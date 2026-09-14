import axios from "axios";

/**
 * WFS requests used to analyse a layer. Every request is built so that as
 * little data as possible travels: attributes come from the schema, the
 * feature count from a hits-only query, counting uses GetPropertyValue (one
 * property, no geometries) and the area analysis uses GetFeature restricted
 * to the two relevant properties.
 * @module addons/wfsAnalyzer/js/wfsAnalysis
 */

/**
 * Timeout for schema and count requests in milliseconds.
 * @type {Number}
 */
const METADATA_TIMEOUT = 20000;

/**
 * Timeout for the actual data requests in milliseconds.
 * @type {Number}
 */
const DATA_TIMEOUT = 120000;

/**
 * XML schema types that hold numbers.
 * @type {String[]}
 */
const numericTypes = [
    "xsd:double",
    "xsd:decimal",
    "xsd:float",
    "xsd:int",
    "xsd:integer",
    "xsd:long",
    "xsd:short",
    "xsd:byte",
    "xsd:nonNegativeInteger",
    "xsd:positiveInteger"
];

/**
 * Requests a WFS url, retrying once on a server or network error. All requests
 * here are plain idempotent GETs, and the Umweltatlas services occasionally
 * answer a large request with a transient 502.
 * @param {String} url the request url.
 * @param {Object} options the axios options.
 * @returns {Promise<Object>} the axios response.
 */
async function getWithRetry (url, options) {
    try {
        return await axios.get(url, options);
    }
    catch (error) {
        const status = error?.response?.status;

        if (status !== undefined && status < 500) {
            throw error;
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        return axios.get(url, options);
    }
}

/**
 * Builds a WFS request url. Any query already present on the service url is
 * dropped so the catalogue's GetCapabilities parameters cannot leak in.
 * @param {String} wfsUrl url of the WFS.
 * @param {Object} params the request parameters.
 * @returns {String} the request url.
 */
export function buildWfsUrl (wfsUrl, params) {
    const url = new URL(wfsUrl);

    url.search = "";
    url.searchParams.set("service", "WFS");
    url.searchParams.set("version", "2.0.0");

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
}

/**
 * Parses an XML string and throws on parser errors.
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
 * Escapes a literal for use in a CQL string comparison by doubling quotes.
 * @param {String} value the value.
 * @returns {String} the escaped value.
 */
function escapeCqlLiteral (value) {
    return String(value).replace(/'/g, "''");
}

/**
 * Builds a CQL_FILTER expression for a single attribute value.
 * @param {String} attribute name of the attribute.
 * @param {String} value the value to filter for.
 * @param {Boolean} [isNumeric=false] whether the attribute holds numbers.
 * @returns {String} the CQL expression or an empty string.
 */
export function buildCqlFilter (attribute, value, isNumeric = false) {
    if (!attribute || value === "" || value === null || value === undefined) {
        return "";
    }

    return isNumeric && String(value).trim() !== "" && !isNaN(Number(value))
        ? `${attribute}=${Number(value)}`
        : `${attribute}='${escapeCqlLiteral(value)}'`;
}

/**
 * Reads the readable name an element carries in
 * `<xsd:annotation><xsd:documentation>`, e.g. "Flächengröße [m²]" for `flalle`.
 * Only direct children are inspected, so the annotation of a nested element
 * cannot be picked up by mistake.
 * @param {Element} element the xsd:element node.
 * @returns {String} the documented name or an empty string.
 */
function readDocumentation (element) {
    const annotation = Array.from(element.children).find((child) => child.localName === "annotation"),
        documentation = annotation
            ? Array.from(annotation.children).find((child) => child.localName === "documentation")
            : undefined;

    return documentation ? documentation.textContent.trim() : "";
}

/**
 * Reads the attributes out of a DescribeFeatureType schema. The geometry is
 * flagged so it can be excluded from the selects, and the documented name is
 * kept as `title` so the user sees something readable instead of the raw
 * column name.
 * @param {String} xml the schema document.
 * @param {String} typeName qualified name of the feature type.
 * @returns {Object[]} the attributes as {name, title, type, isGeometry, isNumeric}.
 */
export function parseAttributes (xml, typeName) {
    const schema = parseXml(xml),
        localTypeName = String(typeName).split(":").pop();

    return Array.from(schema.getElementsByTagNameNS("*", "element"))
        .filter((element) => element.getAttribute("name"))
        .map((element) => {
            const type = element.getAttribute("type") || "",
                name = element.getAttribute("name"),
                title = readDocumentation(element);

            return {
                name,
                // Not every service documents every attribute, so fall back to
                // the raw name.
                title: title || name,
                type,
                isGeometry: type.startsWith("gml:"),
                isNumeric: numericTypes.includes(type)
            };
        })
        // The schema also declares the feature type element itself, which is
        // not an attribute. The geometry stays in the list but is flagged, so
        // callers can offer it or leave it out as needed.
        .filter((attribute) => attribute.name !== localTypeName);
}

/**
 * Reads the attributes of a feature type from its schema.
 * @param {String} wfsUrl url of the WFS.
 * @param {String} typeName qualified name of the feature type.
 * @returns {Promise<Object[]>} the attributes as {name, type, isGeometry, isNumeric}.
 */
export async function fetchAttributes (wfsUrl, typeName) {
    const {data} = await getWithRetry(buildWfsUrl(wfsUrl, {
        request: "DescribeFeatureType",
        typeNames: typeName
    }), {timeout: METADATA_TIMEOUT, responseType: "text"});

    return parseAttributes(data, typeName);
}

/**
 * Reads numberMatched out of a hits-only GetFeature response.
 * @param {String} xml the response document.
 * @returns {Number} the number of matched features.
 */
export function parseNumberMatched (xml) {
    const collection = parseXml(xml).documentElement,
        matched = collection?.getAttribute("numberMatched");

    if (matched === null || matched === undefined || matched === "unknown") {
        throw new Error("The service did not report a feature count.");
    }

    return Number(matched);
}

/**
 * Reads the values out of a GetPropertyValue response.
 * @param {String} xml the response document.
 * @param {String} attribute name of the requested attribute.
 * @returns {String[]} the values, one per feature.
 */
export function parsePropertyValues (xml, attribute) {
    // Looking the element up by local name in any namespace is several times
    // faster than walking every element of the document - which matters, because
    // a whole column can be tens of thousands of entries.
    return Array.from(parseXml(xml).getElementsByTagNameNS("*", attribute))
        .map((element) => element.textContent.trim());
}

/**
 * Asks the service how many features a filter matches, without transferring
 * any of them. Used to show the size of an analysis before it is run.
 * @param {String} wfsUrl url of the WFS.
 * @param {String} typeName qualified name of the feature type.
 * @param {String} [cqlFilter=""] optional CQL filter.
 * @returns {Promise<Number>} the number of matched features.
 */
export async function fetchFeatureCount (wfsUrl, typeName, cqlFilter = "") {
    const {data} = await getWithRetry(buildWfsUrl(wfsUrl, {
        request: "GetFeature",
        typeNames: typeName,
        resultType: "hits",
        CQL_FILTER: cqlFilter
    }), {timeout: METADATA_TIMEOUT, responseType: "text"});

    return parseNumberMatched(data);
}

/**
 * Reads every value of one attribute via GetPropertyValue. Only that single
 * property is transferred, no geometries.
 * @param {String} wfsUrl url of the WFS.
 * @param {String} typeName qualified name of the feature type.
 * @param {String} attribute name of the attribute.
 * @param {String} [cqlFilter=""] optional CQL filter.
 * @returns {Promise<String[]>} the values, one per feature.
 */
export async function fetchPropertyValues (wfsUrl, typeName, attribute, cqlFilter = "") {
    const {data} = await getWithRetry(buildWfsUrl(wfsUrl, {
        request: "GetPropertyValue",
        typeNames: typeName,
        valueReference: attribute,
        CQL_FILTER: cqlFilter
    }), {timeout: DATA_TIMEOUT, responseType: "text"});

    return parsePropertyValues(data, attribute);
}

/**
 * Builds the CQL expression that asks for everything after a value, used to
 * step from one distinct value to the next.
 * @param {String} attribute name of the attribute.
 * @param {String} value the last value that was read.
 * @param {Boolean} isNumeric whether the attribute holds numbers.
 * @returns {String} the CQL expression.
 */
function buildGreaterThanFilter (attribute, value, isNumeric) {
    return isNumeric && !isNaN(Number(value))
        ? `${attribute}>${Number(value)}`
        : `${attribute}>'${escapeCqlLiteral(value)}'`;
}

/**
 * Collects the distinct values of an attribute by asking the service for one
 * value at a time: sorted ascending, one feature, everything greater than the
 * value read before. Every response is a few hundred bytes, which is what makes
 * this work where reading the whole column does not.
 *
 * The number of requests equals the number of distinct values, so the caller
 * must cap it - `limit` is a hard stop, and `truncated` says whether more values
 * exist beyond it.
 * @param {String} wfsUrl url of the WFS.
 * @param {String} typeName qualified name of the feature type.
 * @param {String} attribute name of the attribute.
 * @param {Object} [options={}] the options.
 * @param {Boolean} [options.isNumeric=false] whether the attribute holds numbers.
 * @param {Number} [options.limit=50] maximum number of values to collect.
 * @returns {Promise<Object>} the result as {values, truncated}.
 */
export async function fetchDistinctValuesStepwise (wfsUrl, typeName, attribute, {isNumeric = false, limit = 50} = {}) {
    const values = [];
    let lastValue = null;

    while (values.length < limit) {
        const cqlFilter = lastValue === null ? "" : buildGreaterThanFilter(attribute, lastValue, isNumeric),
            // Sequential by nature: each request needs the value of the one
            // before it.
            {data} = await getWithRetry(buildWfsUrl(wfsUrl, {
                request: "GetPropertyValue",
                typeNames: typeName,
                valueReference: attribute,
                sortBy: attribute,
                count: 1,
                CQL_FILTER: cqlFilter
            }), {timeout: METADATA_TIMEOUT, responseType: "text"}),
            [value] = parsePropertyValues(data, attribute);

        if (value === undefined || value === "") {
            return {values, truncated: false};
        }

        values.push(value);
        lastValue = value;
    }

    return {values, truncated: true};
}

/**
 * Collects the distinct values of an attribute, so they can be offered as
 * filter values.
 *
 * The service has no DISTINCT, so the whole column is read once and
 * deduplicated here. For some attributes of large layers that request is
 * answered with a 502; in that case the values are collected one at a time
 * instead, which stays well under whatever size trips the service up.
 * @param {String} wfsUrl url of the WFS.
 * @param {String} typeName qualified name of the feature type.
 * @param {String} attribute name of the attribute.
 * @param {Object} [options={}] the options.
 * @param {Boolean} [options.isNumeric=false] whether the attribute holds numbers.
 * @param {Number} [options.limit=50] maximum number of values in the fallback.
 * @returns {Promise<Object>} the result as {values, truncated}.
 */
export async function fetchDistinctValues (wfsUrl, typeName, attribute, {isNumeric = false, limit = 50} = {}) {
    try {
        const values = await fetchPropertyValues(wfsUrl, typeName, attribute),
            distinct = sortValues([...new Set(values.filter((value) => value !== ""))]);

        // An attribute can have as many distinct values as there are features.
        // Offering tens of thousands of them helps nobody, so the list is cut
        // at the same limit as the stepwise fallback.
        return {
            values: distinct.slice(0, limit),
            truncated: distinct.length > limit
        };
    }
    catch (error) {
        const {values, truncated} = await fetchDistinctValuesStepwise(wfsUrl, typeName, attribute, {isNumeric, limit});

        return {values: sortValues(values), truncated};
    }
}

/**
 * Sorts values the way a reader expects them.
 * @param {String[]} values the values.
 * @returns {String[]} the sorted values.
 */
function sortValues (values) {
    return [...values].sort((valueA, valueB) => valueA.localeCompare(valueB, undefined, {numeric: true}));
}

/**
 * Turns a list of {label, value} pairs into a sorted result with totals and
 * shares.
 * @param {Map<String, Number>} totals the summed value per category.
 * @param {String} unit either "count" or "area".
 * @returns {Object} the result as {unit, total, categories}.
 */
export function toResult (totals, unit) {
    const categories = [...totals.entries()]
            .map(([label, value]) => ({label, value}))
            .sort((categoryA, categoryB) => categoryB.value - categoryA.value),
        total = categories.reduce((sum, category) => sum + category.value, 0);

    return {
        unit,
        total,
        categories: categories.map((category) => ({
            ...category,
            share: total > 0 ? category.value / total : 0
        }))
    };
}

/**
 * Tallies how often each value occurs.
 * @param {String[]} values the attribute values, one per feature.
 * @returns {Object} the result as {unit, total, categories}.
 */
export function aggregateCounts (values) {
    const totals = new Map();

    values.forEach((value) => {
        totals.set(value, (totals.get(value) || 0) + 1);
    });

    return toResult(totals, "count");
}

/**
 * Sums the area attribute per value of the grouping attribute.
 * @param {Object[]} features the GeoJSON features.
 * @param {String} attribute the attribute to group by.
 * @param {String} areaAttribute the attribute holding the area.
 * @returns {Object} the result as {unit, total, categories}.
 */
export function aggregateAreas (features, attribute, areaAttribute) {
    const totals = new Map();

    features.forEach((feature) => {
        const properties = feature?.properties || {},
            label = properties[attribute] === null || properties[attribute] === undefined
                ? ""
                : String(properties[attribute]),
            area = Number(properties[areaAttribute]);

        totals.set(label, (totals.get(label) || 0) + (isNaN(area) ? 0 : area));
    });

    return toResult(totals, "area");
}

/**
 * Counts the features per value of an attribute. Uses GetPropertyValue, so
 * only the analysed property is transferred.
 * @param {Object} params the parameters.
 * @param {String} params.wfsUrl url of the WFS.
 * @param {String} params.typeName qualified name of the feature type.
 * @param {String} params.attribute the attribute to group by.
 * @param {String} [params.cqlFilter=""] optional CQL filter.
 * @returns {Promise<Object>} the result as {unit, total, categories}.
 */
export async function analyseByCount ({wfsUrl, typeName, attribute, cqlFilter = ""}) {
    const values = await fetchPropertyValues(wfsUrl, typeName, attribute, cqlFilter);

    return aggregateCounts(values);
}

/**
 * Sums the area per value of an attribute. Uses GetFeature limited to the
 * grouping attribute and the area attribute and asks for GeoJSON, so the
 * geometries are not part of the response.
 * @param {Object} params the parameters.
 * @param {String} params.wfsUrl url of the WFS.
 * @param {String} params.typeName qualified name of the feature type.
 * @param {String} params.attribute the attribute to group by.
 * @param {String} params.areaAttribute the attribute holding the area.
 * @param {String} [params.cqlFilter=""] optional CQL filter.
 * @returns {Promise<Object>} the result as {unit, total, categories}.
 */
export async function analyseByArea ({wfsUrl, typeName, attribute, areaAttribute, cqlFilter = ""}) {
    const {data} = await getWithRetry(buildWfsUrl(wfsUrl, {
            request: "GetFeature",
            typeNames: typeName,
            propertyName: `${attribute},${areaAttribute}`,
            outputFormat: "application/json",
            CQL_FILTER: cqlFilter
        }), {timeout: DATA_TIMEOUT}),
        features = Array.isArray(data?.features) ? data.features : [];

    return aggregateAreas(features, attribute, areaAttribute);
}
