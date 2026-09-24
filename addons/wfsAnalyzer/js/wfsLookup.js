import axios from "axios";

/**
 * Marker used by the GDI Berlin catalogue to tag an online resource as a WFS.
 * It appears as xlink:href on the gmx:Anchor inside gmd:protocol.
 * @type {String}
 */
const WFS_SERVICE_TYPE_HREF = "serviceType/ogc/wfs";

/**
 * Maximum number of WFS GetCapabilities documents fetched per layer. The
 * candidates are ranked before they are probed, so the wanted service is
 * normally the first one. The limit only guards records that bundle a whole
 * family of services (e.g. the soil maps share one metadata record with 11 WFS).
 * @type {Number}
 */
const MAX_CAPABILITIES_REQUESTS = 4;

/**
 * Timeout for catalogue and capabilities requests in milliseconds.
 * @type {Number}
 */
const REQUEST_TIMEOUT = 20000;

/**
 * Returns all descendants of a node with the given local name, ignoring the
 * namespace prefix. The catalogue mixes gmd/gmx/gco prefixes and re-declares
 * namespaces on nested elements, so matching on the local name is the only
 * reliable way to walk the document.
 * @param {Node} node node to search in.
 * @param {String} localName local name to look for.
 * @returns {Element[]} the matching elements.
 */
function findByLocalName (node, localName) {
    return Array.from(node.getElementsByTagName("*")).filter((element) => element.localName === localName);
}

/**
 * Returns the trimmed text content of the first descendant with the given local name.
 * @param {Node} node node to search in.
 * @param {String} localName local name to look for.
 * @returns {String} the text content or an empty string.
 */
function textByLocalName (node, localName) {
    const [element] = findByLocalName(node, localName);

    return element ? element.textContent.trim() : "";
}

/**
 * Parses an XML string into a document and throws on parser errors.
 * @param {String} xml the XML string.
 * @returns {XMLDocument} the parsed document.
 */
function parseXml (xml) {
    const document = new DOMParser().parseFromString(xml, "text/xml");

    if (document.getElementsByTagName("parsererror").length > 0) {
        throw new Error("The response could not be parsed as XML.");
    }

    return document;
}

/**
 * Builds the CSW GetRecordById request for a metadata id.
 * @param {String} cswUrl base url of the catalogue service.
 * @param {String} metadataId the md_id of the dataset.
 * @returns {String} the request url.
 */
export function buildCswRecordUrl (cswUrl, metadataId) {
    const url = new URL(cswUrl);

    url.searchParams.set("service", "CSW");
    url.searchParams.set("version", "2.0.2");
    url.searchParams.set("request", "GetRecordById");
    url.searchParams.set("outputSchema", "http://www.isotc211.org/2005/gmd");
    url.searchParams.set("elementSetName", "full");
    url.searchParams.set("id", metadataId);

    return url.toString();
}

/**
 * Builds a WFS GetCapabilities request, discarding any query the catalogue
 * already put on the linkage.
 * @param {String} wfsUrl url of the WFS.
 * @param {String} [version="2.0.0"] the requested WFS version.
 * @returns {String} the request url.
 */
export function buildWfsCapabilitiesUrl (wfsUrl, version = "2.0.0") {
    const url = new URL(wfsUrl);

    url.search = "";
    url.searchParams.set("service", "WFS");
    url.searchParams.set("request", "GetCapabilities");
    url.searchParams.set("version", version);

    return url.toString();
}

/**
 * Extracts the service name from a GDI Berlin service url, i.e. the last path
 * segment: "https://gdi.berlin.de/services/wms/ua_versiegelung_2005" becomes
 * "ua_versiegelung_2005". It is used to pair a WMS with its WFS counterpart.
 * @param {String} serviceUrl url of a WMS or WFS.
 * @returns {String} the service name or an empty string.
 */
export function getServiceName (serviceUrl) {
    if (typeof serviceUrl !== "string" || serviceUrl === "") {
        return "";
    }

    try {
        const segments = new URL(serviceUrl).pathname.split("/").filter((segment) => segment !== "");

        return segments.length > 0 ? segments[segments.length - 1] : "";
    }
    catch (error) {
        return "";
    }
}

/**
 * Strips the namespace prefix from a qualified name:
 * "ua_flurabstand_1995:a_flurabstand_1995" becomes "a_flurabstand_1995".
 * @param {String} qualifiedName a possibly prefixed name.
 * @returns {String} the local part in lower case.
 */
function getLocalName (qualifiedName) {
    return String(qualifiedName).split(":").pop().trim().toLowerCase();
}

/**
 * Collects the WFS online resources of a parsed CSW record. A record describes
 * a dataset and lists every service that publishes it, so it may contain a
 * view service (WMS), a download service (WFS), an ATOM feed and documentation.
 * @param {XMLDocument} record the parsed CSW record.
 * @returns {Object[]} the WFS candidates as {url, description}.
 */
export function extractWfsCandidates (record) {
    const candidates = [];

    findByLocalName(record, "CI_OnlineResource").forEach((resource) => {
        const url = textByLocalName(resource, "URL"),
            description = textByLocalName(resource, "description"),
            [protocol] = findByLocalName(resource, "protocol"),
            protocolHref = protocol
                ? Array.from(findByLocalName(protocol, "Anchor"), (anchor) => anchor.getAttribute("xlink:href") || "").join(" ")
                : "";

        if (url === "") {
            return;
        }

        // The service type on the protocol anchor is the authoritative marker.
        // Some records omit it, hence the fallback on the url itself.
        const isWfs = protocolHref.includes(WFS_SERVICE_TYPE_HREF) ||
            (/[/=]wfs(\b|[/&?])/i).test(url);

        if (isWfs && !candidates.some((candidate) => candidate.url === url)) {
            candidates.push({url, description});
        }
    });

    return candidates;
}

/**
 * Sorts the WFS candidates so the one belonging to the given layer is probed
 * first: a WFS whose service name equals the service name of the layer's WMS
 * describes the same data, everything else is a sibling dataset.
 * @param {Object[]} candidates the WFS candidates.
 * @param {String} layerServiceName service name taken from the layer's url.
 * @returns {Object[]} the ranked candidates.
 */
export function rankWfsCandidates (candidates, layerServiceName) {
    if (layerServiceName === "") {
        return [...candidates];
    }

    return [...candidates].sort((candidateA, candidateB) => {
        const scoreA = getServiceName(candidateA.url) === layerServiceName ? 0 : 1,
            scoreB = getServiceName(candidateB.url) === layerServiceName ? 0 : 1;

        return scoreA - scoreB;
    });
}

/**
 * Reads the area a feature type covers, as the capabilities advertise it in
 * `ows:WGS84BoundingBox`. It comes free with the availability check and saves
 * having to ask the service where its data lies.
 * @param {Element} featureType the FeatureType element.
 * @returns {Number[]|null} the extent as [minLon, minLat, maxLon, maxLat].
 */
function readWgs84Extent (featureType) {
    const [box] = findByLocalName(featureType, "WGS84BoundingBox");

    if (!box) {
        return null;
    }

    const corners = [textByLocalName(box, "LowerCorner"), textByLocalName(box, "UpperCorner")]
        .map((corner) => corner.split(/\s+/).map(Number))
        .flat();

    return corners.length === 4 && corners.every((value) => isFinite(value)) ? corners : null;
}

/**
 * Reads the advertised feature types from a WFS capabilities document.
 * @param {XMLDocument} capabilities the parsed capabilities.
 * @returns {Object[]} the feature types as {name, title}.
 */
export function extractFeatureTypes (capabilities) {
    return findByLocalName(capabilities, "FeatureType").map((featureType) => ({
        name: textByLocalName(featureType, "Name"),
        title: textByLocalName(featureType, "Title"),
        extent: readWgs84Extent(featureType)
    })).filter((featureType) => featureType.name !== "");
}

/**
 * Finds the feature type that corresponds to a layer. The Umweltatlas services
 * name their feature types exactly like the layer id
 * ("ua_flurabstand_1995:a_flurabstand_1995"), so the qualified name decides.
 * The local name of the WMS layer only serves as a fallback, and only within
 * one service, where it is unique - measured across the six services with the
 * most feature types (up to 56 of them), 223 of 257 layers were identified by
 * their qualified name alone and not one name was ambiguous.
 * @param {Object[]} featureTypes the feature types of one WFS.
 * @param {Object} layerConf the layer configuration.
 * @returns {Object[]} the matching feature types, empty when none fits.
 */
export function findFeatureTypeMatches (featureTypes, layerConf) {
    const types = Array.isArray(featureTypes) ? featureTypes : [],
        qualified = typeof layerConf?.id === "string" ? layerConf.id.trim() : "",
        exact = types.filter((featureType) => featureType.name === qualified);

    if (exact.length > 0) {
        return exact;
    }

    const wanted = [layerConf?.id, layerConf?.layers]
        .filter((value) => typeof value === "string" && value !== "")
        .map(getLocalName);

    if (wanted.length === 0) {
        return [];
    }

    return types.filter((featureType) => wanted.includes(getLocalName(featureType.name)));
}

/**
 * Finds the one feature type that corresponds to a layer.
 *
 * Where two feature types fit equally well nothing is returned: picking one of
 * them would be a guess, and a guess is what this is meant to avoid.
 * @param {Object[]} featureTypes the feature types of one WFS.
 * @param {Object} layerConf the layer configuration.
 * @returns {Object|null} the matching feature type or null.
 */
export function matchFeatureType (featureTypes, layerConf) {
    const matches = findFeatureTypeMatches(featureTypes, layerConf);

    return matches.length === 1 ? matches[0] : null;
}

/**
 * The addresses at which the layer's own service can be asked for its feature
 * types.
 *
 * A layer names the service that draws it, and that service is the one that
 * also publishes it for download - GeoServer answers every OWS request on every
 * one of its endpoints, so the layer's own url usually suffices. The second
 * form covers servers that separate their services by path.
 * @param {String} layerUrl url the layer is drawn from.
 * @returns {String[]} the addresses to try, without duplicates.
 */
export function deriveWfsUrls (layerUrl) {
    if (typeof layerUrl !== "string" || layerUrl === "") {
        return [];
    }

    let url = null;

    try {
        url = new URL(layerUrl);
    }
    catch (error) {
        return [];
    }

    const swapped = new URL(url.href);

    swapped.pathname = url.pathname.replace(/(^|\/)wms(\/|$)/i, "$1wfs$2");

    return swapped.href === url.href ? [url.href] : [url.href, swapped.href];
}

/**
 * Fetches and parses the CSW record for a metadata id.
 * @param {String} cswUrl base url of the catalogue service.
 * @param {String} metadataId the md_id of the dataset.
 * @returns {Promise<XMLDocument>} the parsed record.
 */
export async function fetchCswRecord (cswUrl, metadataId) {
    const {data} = await axios.get(buildCswRecordUrl(cswUrl, metadataId), {
        timeout: REQUEST_TIMEOUT,
        responseType: "text"
    });

    return parseXml(data);
}

/**
 * Fetches the feature types of a WFS.
 * @param {String} wfsUrl url of the WFS.
 * @returns {Promise<Object[]>} the feature types as {name, title}.
 */
export async function fetchFeatureTypes (wfsUrl) {
    const {data} = await axios.get(buildWfsCapabilitiesUrl(wfsUrl), {
        timeout: REQUEST_TIMEOUT,
        responseType: "text"
    });

    return extractFeatureTypes(parseXml(data));
}

/**
 * Asks the layer's own service for its feature types and identifies the layer
 * among them.
 *
 * This is the exact answer where the catalogue can only offer candidates: a
 * metadata record describes a *dataset* and may list a download service per
 * sibling - `ua_boden_ph_2015` names nine - so choosing among them means
 * guessing. The service the layer is drawn from does not have to be chosen.
 * @param {Object} layerConf the layer configuration.
 * @returns {Promise<Object|null>} the result, or null if this route found nothing.
 */
async function askOwnService (layerConf) {
    for (const wfsUrl of deriveWfsUrls(layerConf?.url)) {
        let featureTypes = null;

        try {
            // Sequential: the first address answers for every GeoServer, so the
            // second is only ever reached on servers that separate by path.
            featureTypes = await fetchFeatureTypes(wfsUrl);
        }
        catch (error) {
            // Not a WFS, or unreachable - the catalogue may still know one.
            continue;
        }

        if (featureTypes.length === 0) {
            continue;
        }

        const matches = findFeatureTypeMatches(featureTypes, layerConf);

        if (matches.length === 1) {
            return {hasWfs: true, wfsUrl, featureType: matches[0], reason: "ok"};
        }
        if (matches.length > 1) {
            return {
                hasWfs: false,
                wfsUrl: "",
                featureType: null,
                reason: "ambiguousFeatureType"
            };
        }

        // The service answers but knows nothing of this layer - a raster layer,
        // or one whose geometry is not published for download. The catalogue
        // still gets its turn, for portals that publish the download service
        // somewhere else entirely.
    }

    return null;
}

/**
 * Checks whether a layer is also published as a WFS and can therefore be
 * analysed. The layer configuration only ever describes the WMS, so the
 * download service has to be discovered through the metadata record the layer
 * points at, and is then verified against the WFS capabilities.
 * @param {Object} layerConf the layer configuration of the selected layer.
 * @returns {Promise<Object>} the result as {hasWfs, wfsUrl, featureType, reason}.
 */
export async function checkWfsForLayer (layerConf) {
    const ownService = await askOwnService(layerConf);

    if (ownService) {
        return ownService;
    }

    const dataset = Array.isArray(layerConf?.datasets) ? layerConf.datasets[0] : undefined,
        metadataId = dataset?.md_id,
        cswUrl = dataset?.csw_url;

    if (!metadataId || !cswUrl) {
        return {
            hasWfs: false,
            wfsUrl: "",
            featureType: null,
            reason: "noMetadata"
        };
    }

    const record = await fetchCswRecord(cswUrl, metadataId),
        candidates = extractWfsCandidates(record);

    if (candidates.length === 0) {
        return {
            hasWfs: false,
            wfsUrl: "",
            featureType: null,
            reason: "noWfsInMetadata"
        };
    }

    const ranked = rankWfsCandidates(candidates, getServiceName(layerConf.url)).slice(0, MAX_CAPABILITIES_REQUESTS);
    let lastError = null;

    for (const candidate of ranked) {
        try {
            // Sequential on purpose: the ranking puts the matching service
            // first, so in practice this is a single request.
            const featureTypes = await fetchFeatureTypes(candidate.url),
                featureType = matchFeatureType(featureTypes, layerConf);

            if (featureType) {
                return {
                    hasWfs: true,
                    wfsUrl: candidate.url,
                    featureType,
                    reason: "ok"
                };
            }
        }
        catch (error) {
            lastError = error;
        }
    }

    if (lastError) {
        throw lastError;
    }

    return {
        hasWfs: false,
        wfsUrl: "",
        featureType: null,
        reason: "noMatchingFeatureType"
    };
}
