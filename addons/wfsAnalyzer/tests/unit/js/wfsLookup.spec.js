import {expect} from "chai";
import {
    buildCswRecordUrl,
    buildWfsCapabilitiesUrl,
    extractFeatureTypes,
    extractWfsCandidates,
    getServiceName,
    deriveWfsUrls,
    findFeatureTypeMatches,
    matchFeatureType,
    rankWfsCandidates
} from "../../../js/wfsLookup";

/**
 * Builds a gmd:CI_OnlineResource as the GDI Berlin catalogue returns it.
 * @param {String} url the linkage url.
 * @param {String} serviceType value for the xlink:href of the protocol anchor.
 * @returns {String} the XML snippet.
 */
function onlineResource (url, serviceType) {
    const protocol = serviceType === ""
        ? ""
        : `<gmd:protocol><gmx:Anchor xlink:href="${serviceType}">Dienst</gmx:Anchor></gmd:protocol>`;

    return `<gmd:CI_OnlineResource>
        <gmd:linkage><gmd:URL>${url}</gmd:URL></gmd:linkage>
        ${protocol}
        <gmd:description><gco:CharacterString>Beschreibung</gco:CharacterString></gmd:description>
    </gmd:CI_OnlineResource>`;
}

/**
 * Wraps online resources into a parsed CSW record.
 * @param {String[]} resources the XML snippets.
 * @returns {XMLDocument} the parsed record.
 */
function cswRecord (resources) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <csw:GetRecordByIdResponse
            xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
            xmlns:gmd="http://www.isotc211.org/2005/gmd"
            xmlns:gco="http://www.isotc211.org/2005/gco"
            xmlns:gmx="http://www.isotc211.org/2005/gmx"
            xmlns:xlink="http://www.w3.org/1999/xlink">
            <gmd:MD_Metadata>${resources.join("")}</gmd:MD_Metadata>
        </csw:GetRecordByIdResponse>`;

    return new DOMParser().parseFromString(xml, "text/xml");
}

describe("addons/wfsAnalyzer/js/wfsLookup", () => {
    describe("buildCswRecordUrl", () => {
        it("builds a GetRecordById request for the metadata id", () => {
            const url = new URL(buildCswRecordUrl("https://gdi.berlin.de/geonetwork/srv/ger/csw", "9e668587"));

            expect(url.origin + url.pathname).to.equal("https://gdi.berlin.de/geonetwork/srv/ger/csw");
            expect(url.searchParams.get("service")).to.equal("CSW");
            expect(url.searchParams.get("request")).to.equal("GetRecordById");
            expect(url.searchParams.get("version")).to.equal("2.0.2");
            expect(url.searchParams.get("id")).to.equal("9e668587");
            expect(url.searchParams.get("outputSchema")).to.equal("http://www.isotc211.org/2005/gmd");
        });
    });

    describe("buildWfsCapabilitiesUrl", () => {
        it("replaces the query the catalogue put on the linkage", () => {
            const url = new URL(buildWfsCapabilitiesUrl("https://gdi.berlin.de/services/wfs/ua_x?request=GetCapabilities&service=WFS"));

            expect(url.pathname).to.equal("/services/wfs/ua_x");
            expect(url.searchParams.get("service")).to.equal("WFS");
            expect(url.searchParams.get("request")).to.equal("GetCapabilities");
            expect(url.searchParams.get("version")).to.equal("2.0.0");
        });
    });

    describe("getServiceName", () => {
        it("returns the last path segment", () => {
            expect(getServiceName("https://gdi.berlin.de/services/wms/ua_versiegelung_2005")).to.equal("ua_versiegelung_2005");
            expect(getServiceName("https://gdi.berlin.de/services/wfs/ua_versiegelung_2005/")).to.equal("ua_versiegelung_2005");
        });

        it("returns an empty string for missing or invalid urls", () => {
            expect(getServiceName(undefined)).to.equal("");
            expect(getServiceName("")).to.equal("");
            expect(getServiceName("not a url")).to.equal("");
        });
    });

    describe("extractWfsCandidates", () => {
        it("picks the WFS out of a record listing several service types", () => {
            const record = cswRecord([
                    onlineResource("https://gdi.berlin.de", ""),
                    onlineResource("https://gdi.berlin.de/data/ua_flurabstand_1995/atom/", ""),
                    onlineResource("https://gdi.berlin.de/services/wms/ua_flurabstand_1995?request=GetCapabilities&amp;service=WMS", "http://www.opengis.net/def/serviceType/ogc/wms"),
                    onlineResource("https://gdi.berlin.de/services/wfs/ua_flurabstand_1995?request=GetCapabilities&amp;service=WFS", "http://www.opengis.net/def/serviceType/ogc/wfs"),
                    onlineResource("https://gdi.berlin.de/data/ua_flurabstand_1995/docs/beschreibung.pdf", "")
                ]),
                candidates = extractWfsCandidates(record);

            expect(candidates).to.have.lengthOf(1);
            expect(candidates[0].url).to.equal("https://gdi.berlin.de/services/wfs/ua_flurabstand_1995?request=GetCapabilities&service=WFS");
        });

        it("returns every WFS of a record that bundles a family of services", () => {
            const record = cswRecord([
                    onlineResource("https://gdi.berlin.de/services/wfs/ua_boden_archivfkt_2020?service=WFS", "http://www.opengis.net/def/serviceType/ogc/wfs"),
                    onlineResource("https://gdi.berlin.de/services/wfs/ua_boden_vpot_2020?service=WFS", "http://www.opengis.net/def/serviceType/ogc/wfs"),
                    onlineResource("https://gdi.berlin.de/services/wms/ua_boden_vpot_2020?service=WMS", "http://www.opengis.net/def/serviceType/ogc/wms")
                ]),
                candidates = extractWfsCandidates(record);

            expect(candidates.map((candidate) => candidate.url)).to.deep.equal([
                "https://gdi.berlin.de/services/wfs/ua_boden_archivfkt_2020?service=WFS",
                "https://gdi.berlin.de/services/wfs/ua_boden_vpot_2020?service=WFS"
            ]);
        });

        it("falls back to the url when the protocol is not tagged", () => {
            const record = cswRecord([
                    onlineResource("https://gdi.berlin.de/services/wfs/ua_x?request=GetCapabilities", ""),
                    onlineResource("https://gdi.berlin.de/services/wms/ua_x?request=GetCapabilities", "")
                ]),
                candidates = extractWfsCandidates(record);

            expect(candidates).to.have.lengthOf(1);
            expect(candidates[0].url).to.contain("/services/wfs/ua_x");
        });

        it("returns an empty array for a record without services", () => {
            expect(extractWfsCandidates(cswRecord([]))).to.deep.equal([]);
        });
    });

    describe("rankWfsCandidates", () => {
        it("puts the WFS matching the layer service first", () => {
            const candidates = [
                    {url: "https://gdi.berlin.de/services/wfs/ua_boden_vpot_2020"},
                    {url: "https://gdi.berlin.de/services/wfs/ua_boden_archivfkt_2020"},
                    {url: "https://gdi.berlin.de/services/wfs/ua_boden_leist_2020"}
                ],
                ranked = rankWfsCandidates(candidates, "ua_boden_archivfkt_2020");

            expect(getServiceName(ranked[0].url)).to.equal("ua_boden_archivfkt_2020");
            expect(ranked).to.have.lengthOf(3);
        });

        it("keeps the order when the layer service name is unknown", () => {
            const candidates = [{url: "https://example.com/a"}, {url: "https://example.com/b"}];

            expect(rankWfsCandidates(candidates, "")).to.deep.equal(candidates);
        });
    });

    describe("extractFeatureTypes", () => {
        it("reads name and title from a WFS 2.0.0 capabilities document", () => {
            const capabilities = new DOMParser().parseFromString(`<?xml version="1.0"?>
                    <wfs:WFS_Capabilities version="2.0.0" xmlns:wfs="http://www.opengis.net/wfs/2.0">
                        <wfs:FeatureTypeList>
                            <wfs:FeatureType>
                                <wfs:Name>ua_flurabstand_1995:a_flurabstand_1995</wfs:Name>
                                <wfs:Title>Bereiche mit gespanntem Grundwasser 1995</wfs:Title>
                            </wfs:FeatureType>
                        </wfs:FeatureTypeList>
                    </wfs:WFS_Capabilities>`, "text/xml"),
                featureTypes = extractFeatureTypes(capabilities);

            expect(featureTypes).to.deep.equal([{
                name: "ua_flurabstand_1995:a_flurabstand_1995",
                title: "Bereiche mit gespanntem Grundwasser 1995",
                extent: null
            }]);
        });

        it("reads the advertised extent, which saves asking where the data lies", () => {
            const capabilities = new DOMParser().parseFromString(`<?xml version="1.0"?>
                    <wfs:WFS_Capabilities version="2.0.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:ows="http://www.opengis.net/ows/1.1">
                        <wfs:FeatureTypeList>
                            <wfs:FeatureType>
                                <wfs:Name>ua:a</wfs:Name>
                                <wfs:Title>A</wfs:Title>
                                <ows:WGS84BoundingBox>
                                    <ows:LowerCorner>13.077449 52.330577</ows:LowerCorner>
                                    <ows:UpperCorner>13.763905 52.678717</ows:UpperCorner>
                                </ows:WGS84BoundingBox>
                            </wfs:FeatureType>
                        </wfs:FeatureTypeList>
                    </wfs:WFS_Capabilities>`, "text/xml"),
                [featureType] = extractFeatureTypes(capabilities);

            expect(featureType.extent).to.deep.equal([13.077449, 52.330577, 13.763905, 52.678717]);
        });

        it("ignores an extent it cannot read", () => {
            const capabilities = new DOMParser().parseFromString(`<?xml version="1.0"?>
                    <wfs:WFS_Capabilities version="2.0.0" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:ows="http://www.opengis.net/ows/1.1">
                        <wfs:FeatureTypeList>
                            <wfs:FeatureType>
                                <wfs:Name>ua:a</wfs:Name>
                                <ows:WGS84BoundingBox>
                                    <ows:LowerCorner>keine zahl</ows:LowerCorner>
                                    <ows:UpperCorner>13.7 52.6</ows:UpperCorner>
                                </ows:WGS84BoundingBox>
                            </wfs:FeatureType>
                        </wfs:FeatureTypeList>
                    </wfs:WFS_Capabilities>`, "text/xml"),
                [featureType] = extractFeatureTypes(capabilities);

            expect(featureType.extent).to.equal(null);
        });
    });

    describe("matchFeatureType", () => {
        const featureTypes = [
            {name: "ua_flurabstand_1995:a_flurabstand_1995", title: "Gespanntes Grundwasser"},
            {name: "ua_flurabstand_1995:something_else", title: "Anderes"}
        ];

        it("matches the qualified layer id", () => {
            const match = matchFeatureType(featureTypes, {
                id: "ua_flurabstand_1995:a_flurabstand_1995",
                layers: "a_flurabstand_1995"
            });

            expect(match.name).to.equal("ua_flurabstand_1995:a_flurabstand_1995");
        });

        it("matches on the WMS layers attribute alone", () => {
            expect(matchFeatureType(featureTypes, {id: "unrelated", layers: "a_flurabstand_1995"}).name)
                .to.equal("ua_flurabstand_1995:a_flurabstand_1995");
        });

        it("returns null when the service does not publish the layer", () => {
            expect(matchFeatureType(featureTypes, {id: "ua_other:foo", layers: "foo"})).to.be.null;
        });

        it("returns null when the layer carries no identifiers", () => {
            expect(matchFeatureType(featureTypes, {})).to.be.null;
        });

        it("prefers the qualified name over a same-named type of another workspace", () => {
            const types = [
                {name: "other_ws:a_flurabstand_1995"},
                {name: "ua_flurabstand_1995:a_flurabstand_1995"}
            ];

            expect(matchFeatureType(types, {id: "ua_flurabstand_1995:a_flurabstand_1995"}).name)
                .to.equal("ua_flurabstand_1995:a_flurabstand_1995");
        });

        it("returns null when two types fit equally well", () => {
            // Picking one of them would be a guess, which is what this avoids.
            const types = [
                {name: "ws_a:a_flurabstand_1995"},
                {name: "ws_b:a_flurabstand_1995"}
            ];

            expect(matchFeatureType(types, {id: "unrelated", layers: "a_flurabstand_1995"})).to.be.null;
        });
    });

    describe("findFeatureTypeMatches", () => {
        it("reports every candidate, so the caller can tell 'none' from 'ambiguous'", () => {
            const types = [{name: "ws_a:x"}, {name: "ws_b:x"}];

            expect(findFeatureTypeMatches(types, {layers: "x"})).to.have.lengthOf(2);
            expect(findFeatureTypeMatches(types, {layers: "y"})).to.have.lengthOf(0);
        });

        it("narrows an otherwise ambiguous name down by the qualified id", () => {
            const types = [{name: "ws_a:x"}, {name: "ws_b:x"}];

            expect(findFeatureTypeMatches(types, {id: "ws_b:x", layers: "x"})).to.deep.equal([{name: "ws_b:x"}]);
        });

        it("copes with a missing list", () => {
            expect(findFeatureTypeMatches(undefined, {id: "a:b"})).to.deep.equal([]);
        });
    });

    describe("deriveWfsUrls", () => {
        it("offers the layer's own address first", () => {
            // GeoServer answers every OWS request on every one of its
            // endpoints, so this one address is usually the whole answer.
            expect(deriveWfsUrls("https://gdi.berlin.de/services/wms/ua_boden_ph_2015")[0])
                .to.equal("https://gdi.berlin.de/services/wms/ua_boden_ph_2015");
        });

        it("adds the wfs path for servers that separate their services", () => {
            expect(deriveWfsUrls("https://gdi.berlin.de/services/wms/ua_boden_ph_2015"))
                .to.deep.equal([
                    "https://gdi.berlin.de/services/wms/ua_boden_ph_2015",
                    "https://gdi.berlin.de/services/wfs/ua_boden_ph_2015"
                ]);
        });

        it("swaps a trailing wms segment as well", () => {
            expect(deriveWfsUrls("https://example.org/geoserver/wms")).to.deep.equal([
                "https://example.org/geoserver/wms",
                "https://example.org/geoserver/wfs"
            ]);
        });

        it("does not touch a path that only contains wms inside a word", () => {
            expect(deriveWfsUrls("https://example.org/wmsdata/ows")).to.deep.equal([
                "https://example.org/wmsdata/ows"
            ]);
        });

        it("keeps query parameters the layer url carries", () => {
            expect(deriveWfsUrls("https://example.org/wms/x?map=/data/x.map")[1])
                .to.equal("https://example.org/wfs/x?map=/data/x.map");
        });

        it("returns nothing for an unusable url", () => {
            expect(deriveWfsUrls("kein-url")).to.deep.equal([]);
            expect(deriveWfsUrls("")).to.deep.equal([]);
            expect(deriveWfsUrls(undefined)).to.deep.equal([]);
        });
    });
});
