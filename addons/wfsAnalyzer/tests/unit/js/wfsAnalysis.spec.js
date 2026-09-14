import {expect} from "chai";
import sinon from "sinon";
import axios from "axios";
import {
    aggregateAreas,
    aggregateCounts,
    buildCqlFilter,
    buildWfsUrl,
    fetchDistinctValues,
    parseAttributes,
    parseNumberMatched,
    parsePropertyValues
} from "../../../js/wfsAnalysis";

describe("addons/wfsAnalyzer/js/wfsAnalysis", () => {
    describe("buildWfsUrl", () => {
        it("drops an existing query and sets service and version", () => {
            const url = new URL(buildWfsUrl("https://gdi.berlin.de/services/wfs/ua_x?request=GetCapabilities&service=WFS", {
                request: "GetFeature",
                typeNames: "ua_x:layer"
            }));

            expect(url.pathname).to.equal("/services/wfs/ua_x");
            expect(url.searchParams.get("service")).to.equal("WFS");
            expect(url.searchParams.get("version")).to.equal("2.0.0");
            expect(url.searchParams.get("request")).to.equal("GetFeature");
            expect(url.searchParams.get("typeNames")).to.equal("ua_x:layer");
        });

        it("omits empty parameters so no empty CQL_FILTER is sent", () => {
            const url = new URL(buildWfsUrl("https://example.com/wfs", {
                request: "GetFeature",
                CQL_FILTER: "",
                propertyName: undefined
            }));

            expect(url.searchParams.has("CQL_FILTER")).to.be.false;
            expect(url.searchParams.has("propertyName")).to.be.false;
        });
    });

    describe("buildCqlFilter", () => {
        it("quotes string values", () => {
            expect(buildCqlFilter("bezirk", "Friedrichshain-Kreuzberg"))
                .to.equal("bezirk='Friedrichshain-Kreuzberg'");
        });

        it("escapes single quotes by doubling them", () => {
            expect(buildCqlFilter("name", "O'Hara")).to.equal("name='O''Hara'");
        });

        it("leaves numeric values unquoted", () => {
            expect(buildCqlFilter("typ", "5", true)).to.equal("typ=5");
        });

        it("quotes a non-numeric value even on a numeric attribute", () => {
            expect(buildCqlFilter("typ", "abc", true)).to.equal("typ='abc'");
        });

        it("returns an empty filter when attribute or value is missing", () => {
            expect(buildCqlFilter("", "Mitte")).to.equal("");
            expect(buildCqlFilter("bezirk", "")).to.equal("");
            expect(buildCqlFilter("bezirk", null)).to.equal("");
        });
    });

    describe("parseAttributes", () => {
        // Shaped like a real GDI Berlin DescribeFeatureType response: most
        // attributes carry a readable name in xsd:documentation, some do not.
        const schema = `<?xml version="1.0" encoding="UTF-8"?>
            <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                <xsd:complexType name="d_reale_nutzung_2021Type">
                    <xsd:complexContent>
                        <xsd:extension base="gml:AbstractFeatureType">
                            <xsd:sequence>
                                <xsd:element name="bezirk" nillable="true" type="xsd:string">
                                    <xsd:annotation>
                                        <xsd:documentation>Bezirksname</xsd:documentation>
                                    </xsd:annotation>
                                </xsd:element>
                                <xsd:element name="nutzung" nillable="true" type="xsd:string"/>
                                <xsd:element name="flalle" nillable="true" type="xsd:double">
                                    <xsd:annotation>
                                        <xsd:documentation>Flächengröße [m²]</xsd:documentation>
                                    </xsd:annotation>
                                </xsd:element>
                                <xsd:element name="geom" nillable="true" type="gml:MultiSurfacePropertyType"/>
                            </xsd:sequence>
                        </xsd:extension>
                    </xsd:complexContent>
                </xsd:complexType>
                <xsd:element name="d_reale_nutzung_2021" type="ua:d_reale_nutzung_2021Type"/>
            </xsd:schema>`;

        it("reads the readable name from xsd:documentation", () => {
            const attributes = parseAttributes(schema, "ua:d_reale_nutzung_2021");

            expect(attributes.find((attribute) => attribute.name === "bezirk").title)
                .to.equal("Bezirksname");
            expect(attributes.find((attribute) => attribute.name === "flalle").title)
                .to.equal("Flächengröße [m²]");
        });

        it("falls back to the raw name where the service documents nothing", () => {
            const attributes = parseAttributes(schema, "ua:d_reale_nutzung_2021");

            expect(attributes.find((attribute) => attribute.name === "nutzung").title)
                .to.equal("nutzung");
        });

        it("does not take the documentation of a nested element", () => {
            const nested = `<?xml version="1.0"?>
                <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <xsd:element name="outer" type="xsd:string">
                        <xsd:complexType>
                            <xsd:sequence>
                                <xsd:element name="inner" type="xsd:string">
                                    <xsd:annotation>
                                        <xsd:documentation>Inner label</xsd:documentation>
                                    </xsd:annotation>
                                </xsd:element>
                            </xsd:sequence>
                        </xsd:complexType>
                    </xsd:element>
                </xsd:schema>`;

            expect(parseAttributes(nested, "ua:whatever")
                .find((attribute) => attribute.name === "outer").title).to.equal("outer");
        });

        it("reads name, type and the numeric flag", () => {
            const attributes = parseAttributes(schema, "ua:d_reale_nutzung_2021");

            expect(attributes.map((attribute) => attribute.name))
                .to.deep.equal(["bezirk", "nutzung", "flalle", "geom"]);
            expect(attributes.find((attribute) => attribute.name === "flalle").isNumeric).to.be.true;
            expect(attributes.find((attribute) => attribute.name === "bezirk").isNumeric).to.be.false;
        });

        it("flags the geometry instead of dropping it", () => {
            const geometry = parseAttributes(schema, "ua:d_reale_nutzung_2021")
                .find((attribute) => attribute.name === "geom");

            expect(geometry.isGeometry).to.be.true;
        });

        it("excludes the feature type element itself", () => {
            const attributes = parseAttributes(schema, "ua:d_reale_nutzung_2021");

            expect(attributes.some((attribute) => attribute.name === "d_reale_nutzung_2021")).to.be.false;
        });

        it("throws on a response that is not XML", () => {
            expect(() => parseAttributes("<html><body>Proxy Error</body></html>", "ua:x")).to.not.throw();
        });
    });

    describe("parseNumberMatched", () => {
        it("reads the hits count without any features", () => {
            const hits = `<?xml version="1.0"?>
                <wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0"
                    numberMatched="1474" numberReturned="0"/>`;

            expect(parseNumberMatched(hits)).to.equal(1474);
        });

        it("throws when the service reports an unknown count", () => {
            const hits = `<?xml version="1.0"?>
                <wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0"
                    numberMatched="unknown" numberReturned="0"/>`;

            expect(() => parseNumberMatched(hits)).to.throw();
        });
    });

    describe("parsePropertyValues", () => {
        it("reads one value per member, ignoring the namespace prefix", () => {
            const values = `<?xml version="1.0"?>
                <wfs:ValueCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:ua="ua">
                    <wfs:member><ua:nutzung>Wohnnutzung</ua:nutzung></wfs:member>
                    <wfs:member><ua:nutzung>Park / Grünfläche</ua:nutzung></wfs:member>
                    <wfs:member><ua:nutzung>Wohnnutzung</ua:nutzung></wfs:member>
                </wfs:ValueCollection>`;

            expect(parsePropertyValues(values, "nutzung"))
                .to.deep.equal(["Wohnnutzung", "Park / Grünfläche", "Wohnnutzung"]);
        });

        it("returns an empty array when the attribute is absent", () => {
            const values = `<?xml version="1.0"?>
                <wfs:ValueCollection xmlns:wfs="http://www.opengis.net/wfs/2.0"/>`;

            expect(parsePropertyValues(values, "nutzung")).to.deep.equal([]);
        });
    });

    describe("aggregateCounts", () => {
        it("counts occurrences, sorts descending and computes shares", () => {
            const result = aggregateCounts(["a", "b", "a", "a", "c", "b"]);

            expect(result.unit).to.equal("count");
            expect(result.total).to.equal(6);
            expect(result.categories.map((category) => category.label)).to.deep.equal(["a", "b", "c"]);
            expect(result.categories[0].value).to.equal(3);
            expect(result.categories[0].share).to.equal(0.5);
            expect(result.categories.reduce((sum, category) => sum + category.share, 0)).to.be.closeTo(1, 1e-9);
        });

        it("returns an empty result for no values", () => {
            const result = aggregateCounts([]);

            expect(result.total).to.equal(0);
            expect(result.categories).to.deep.equal([]);
        });
    });

    describe("aggregateAreas", () => {
        const features = [
            {properties: {nutzung: "Wohnnutzung", flalle: 1000}},
            {properties: {nutzung: "Park", flalle: 500}},
            {properties: {nutzung: "Wohnnutzung", flalle: 2000}}
        ];

        it("sums the area per category", () => {
            const result = aggregateAreas(features, "nutzung", "flalle");

            expect(result.unit).to.equal("area");
            expect(result.total).to.equal(3500);
            expect(result.categories[0]).to.include({label: "Wohnnutzung", value: 3000});
            expect(result.categories[1]).to.include({label: "Park", value: 500});
        });

        it("treats a missing or non-numeric area as zero", () => {
            const result = aggregateAreas([
                {properties: {nutzung: "a", flalle: null}},
                {properties: {nutzung: "a", flalle: "keine"}},
                {properties: {nutzung: "a", flalle: 10}}
            ], "nutzung", "flalle");

            expect(result.total).to.equal(10);
        });

        it("groups features whose grouping attribute is null under an empty label", () => {
            const result = aggregateAreas([
                {properties: {nutzung: null, flalle: 10}}
            ], "nutzung", "flalle");

            expect(result.categories[0].label).to.equal("");
        });
    });

    describe("fetchDistinctValues", () => {
        /**
         * Builds a GetPropertyValue response.
         * @param {String[]} values the values to include.
         * @returns {String} the XML.
         */
        function valueCollection (values) {
            return `<?xml version="1.0"?>
                <wfs:ValueCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:ua="ua">
                    ${values.map((value) => `<wfs:member><ua:bezirk>${value}</ua:bezirk></wfs:member>`).join("")}
                </wfs:ValueCollection>`;
        }

        afterEach(() => {
            sinon.restore();
        });

        it("reads the whole column in one request when the service allows it", async () => {
            const get = sinon.stub(axios, "get")
                    .resolves({data: valueCollection(["Mitte", "Pankow", "Mitte", ""])}),
                result = await fetchDistinctValues("https://example.com/wfs", "ua:layer", "bezirk");

            expect(get.callCount).to.equal(1);
            expect(result.values).to.deep.equal(["Mitte", "Pankow"]);
            expect(result.truncated).to.be.false;
        });

        it("cuts a very long list and flags it", async () => {
            sinon.stub(axios, "get").resolves({data: valueCollection(["a", "b", "c", "d"])});

            const result = await fetchDistinctValues("https://example.com/wfs", "ua:layer", "bezirk", {limit: 2});

            expect(result.values).to.deep.equal(["a", "b"]);
            expect(result.truncated).to.be.true;
        });

        it("collects the values one by one when the bulk request fails", async () => {
            const get = sinon.stub(axios, "get");

            // The bulk request and its retry both fail with a server error.
            get.onCall(0).rejects({response: {status: 502}});
            get.onCall(1).rejects({response: {status: 502}});
            // Then one request per value, and an empty one to finish.
            get.onCall(2).resolves({data: valueCollection(["Mitte"])});
            get.onCall(3).resolves({data: valueCollection(["Pankow"])});
            get.onCall(4).resolves({data: valueCollection([])});

            const result = await fetchDistinctValues("https://example.com/wfs", "ua:layer", "bezirk");

            expect(result.values).to.deep.equal(["Mitte", "Pankow"]);
            expect(result.truncated).to.be.false;
        });

        it("steps through the values in ascending order, asking for the next one each time", async () => {
            const get = sinon.stub(axios, "get");

            get.onCall(0).rejects({response: {status: 502}});
            get.onCall(1).rejects({response: {status: 502}});
            get.onCall(2).resolves({data: valueCollection(["Mitte"])});
            get.onCall(3).resolves({data: valueCollection([])});

            await fetchDistinctValues("https://example.com/wfs", "ua:layer", "bezirk");

            const firstStep = new URL(get.getCall(2).args[0]),
                secondStep = new URL(get.getCall(3).args[0]);

            expect(firstStep.searchParams.get("sortBy")).to.equal("bezirk");
            expect(firstStep.searchParams.get("count")).to.equal("1");
            expect(firstStep.searchParams.has("CQL_FILTER")).to.be.false;
            expect(secondStep.searchParams.get("CQL_FILTER")).to.equal("bezirk>'Mitte'");
        });

        it("compares numerically for a numeric attribute", async () => {
            const get = sinon.stub(axios, "get");

            get.onCall(0).rejects({response: {status: 502}});
            get.onCall(1).rejects({response: {status: 502}});
            get.onCall(2).resolves({data: valueCollection(["1.0"])});
            get.onCall(3).resolves({data: valueCollection([])});

            await fetchDistinctValues("https://example.com/wfs", "ua:layer", "bezirk", {isNumeric: true});

            expect(new URL(get.getCall(3).args[0]).searchParams.get("CQL_FILTER")).to.equal("bezirk>1");
        });

        it("stops at the limit and flags the list as incomplete", async () => {
            const get = sinon.stub(axios, "get");

            get.onCall(0).rejects({response: {status: 502}});
            get.onCall(1).rejects({response: {status: 502}});
            get.onCall(2).resolves({data: valueCollection(["a"])});
            get.onCall(3).resolves({data: valueCollection(["b"])});
            get.onCall(4).resolves({data: valueCollection(["c"])});

            const result = await fetchDistinctValues("https://example.com/wfs", "ua:layer", "bezirk", {limit: 2});

            expect(result.values).to.deep.equal(["a", "b"]);
            expect(result.truncated).to.be.true;
        });
    });
});
