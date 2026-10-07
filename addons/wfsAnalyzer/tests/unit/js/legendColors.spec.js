import {expect} from "chai";
import {buildLegendUrl, colorMapByAttribute, decodeLegend, matchLegendAttribute, parseLegendRules, repairEncoding} from "../../../js/legendColors";

describe("addons/wfsAnalyzer/js/legendColors", () => {
    /**
     * Builds a legend rule as the service returns it.
     * @param {String} filter the rule filter.
     * @param {String} fill the polygon fill colour.
     * @returns {Object} the rule.
     */
    function rule (filter, fill) {
        return {name: "r", title: null, filter, symbolizers: [{Polygon: {fill, "fill-opacity": "1"}}]};
    }

    describe("buildLegendUrl", () => {
        it("asks for the legend of one layer as json", () => {
            const url = new URL(buildLegendUrl("https://gdi.berlin.de/services/wms/ua_flaechennutzung", "a_reale_nutzung"));

            expect(url.origin + url.pathname).to.equal("https://gdi.berlin.de/services/wms/ua_flaechennutzung");
            expect(url.searchParams.get("request")).to.equal("GetLegendGraphic");
            expect(url.searchParams.get("format")).to.equal("application/json");
            expect(url.searchParams.get("layer")).to.equal("a_reale_nutzung");
        });

        it("drops query parameters the layer url may carry", () => {
            const url = new URL(buildLegendUrl("https://gdi.berlin.de/services/wms/ua?service=WMS&request=GetCapabilities", "a"));

            expect(url.searchParams.get("request")).to.equal("GetLegendGraphic");
        });
    });

    describe("decodeLegend", () => {
        it("reads a utf-8 answer as utf-8", () => {
            const bytes = new Uint8Array([0x6D, 0xC3, 0xA4, 0xC3, 0x9F, 0x69, 0x67]);

            expect(decodeLegend(bytes.buffer)).to.equal("mäßig");
        });

        it("falls back to latin-1, which some services answer in", () => {
            // The rare-soils legend declares application/json and sends
            // latin-1 all the same. Read as utf-8 "mäßig" becomes garbage - and
            // since the value is also the filter of the rule, the request built
            // from it matches nothing: 0 features instead of 1301.
            const bytes = new Uint8Array([0x6D, 0xE4, 0xDF, 0x69, 0x67]);

            expect(decodeLegend(bytes.buffer)).to.equal("mäßig");
        });

        it("passes text through untouched", () => {
            expect(decodeLegend("{\"Legend\":[]}")).to.equal("{\"Legend\":[]}");
        });
    });

    describe("repairEncoding", () => {
        it("repairs utf-8 that was read as latin-1", () => {
            expect(repairEncoding("GrÃ¼n- und FreiflÃ¤che")).to.equal("Grün- und Freifläche");
            expect(repairEncoding("GewÃ¤sser")).to.equal("Gewässer");
        });

        it("leaves a string that really is latin-1 alone", () => {
            // Its bytes are no valid utf-8, so there is nothing to repair -
            // and the same document may hold both kinds.
            expect(repairEncoding("mäßig")).to.equal("mäßig");
            expect(repairEncoding("häufig")).to.equal("häufig");
        });

        it("leaves plain text untouched", () => {
            expect(repairEncoding("woz = '10'")).to.equal("woz = '10'");
            expect(repairEncoding("Grün")).to.equal("Grün");
            expect(repairEncoding("")).to.equal("");
        });

        it("keeps anything that is not a string", () => {
            expect(repairEncoding(undefined)).to.equal(undefined);
            expect(repairEncoding(42)).to.equal(42);
        });
    });

    describe("parseLegendRules", () => {
        it("reads attribute, value and colour of a value rule", () => {
            expect(parseLegendRules({Legend: [{rules: [rule("[woz = '10']", "#FFCC65")]}]}))
                .to.deep.equal([{attribute: "woz", value: "10", color: "#FFCC65"}]);
        });

        it("reads unquoted values as the service writes them for numbers", () => {
            expect(parseLegendRules({Legend: [{rules: [rule("[naturnaehe = 9]", "#AACCFF")]}]}))
                .to.deep.equal([{attribute: "naturnaehe", value: "9", color: "#AACCFF"}]);
        });

        it("accepts a raw json string", () => {
            expect(parseLegendRules(JSON.stringify({Legend: [{rules: [rule("[grz = '1']", "#000000")]}]})))
                .to.have.lengthOf(1);
        });

        it("skips rules that describe no single value", () => {
            const legend = {Legend: [{rules: [
                rule("[a >= 10 AND a < 20]", "#111111"),
                rule("[a = '1' AND b = '2']", "#222222"),
                {name: "r", filter: null, symbolizers: [{Polygon: {fill: "#333333"}}]}
            ]}]};

            expect(parseLegendRules(legend)).to.deep.equal([]);
        });

        it("skips rules without a colour", () => {
            expect(parseLegendRules({Legend: [{rules: [{filter: "[woz = '10']", symbolizers: []}]}]})).to.deep.equal([]);
        });

        it("falls back to the stroke of a line symbolizer", () => {
            const legend = {Legend: [{rules: [{filter: "[typ = 'a']", symbolizers: [{Line: {stroke: "#445566"}}]}]}]};

            expect(parseLegendRules(legend)).to.deep.equal([{attribute: "typ", value: "a", color: "#445566"}]);
        });

        it("returns nothing for malformed input instead of throwing", () => {
            expect(parseLegendRules("not json")).to.deep.equal([]);
            expect(parseLegendRules(undefined)).to.deep.equal([]);
            expect(parseLegendRules({})).to.deep.equal([]);
        });
    });

    describe("colorMapByAttribute", () => {
        it("groups the colours by attribute", () => {
            const map = colorMapByAttribute([
                {attribute: "woz", value: "10", color: "#a"},
                {attribute: "grz", value: "1", color: "#b"},
                {attribute: "woz", value: "21", color: "#c"}
            ]);

            expect(map).to.deep.equal({woz: {10: "#a", 21: "#c"}, grz: {1: "#b"}});
        });

        it("keeps the first colour of a repeated value, as the map draws it", () => {
            const map = colorMapByAttribute([
                {attribute: "woz", value: "10", color: "#first"},
                {attribute: "woz", value: "10", color: "#later"}
            ]);

            expect(map.woz["10"]).to.equal("#first");
        });
    });

    describe("matchLegendAttribute", () => {
        const colorMap = {woz: {10: "#a"}, grz: {1: "#b"}};

        it("matches an attribute the map is styled by directly", () => {
            expect(matchLegendAttribute(colorMap, "woz")).to.deep.equal({legendAttribute: "woz", needsBridge: false});
        });

        it("matches the readable counterpart of a code via a configured suffix", () => {
            expect(matchLegendAttribute(colorMap, "woz_name", ["_name"]))
                .to.deep.equal({legendAttribute: "woz", needsBridge: true});
            expect(matchLegendAttribute({typ: {a: "#a"}}, "typklar", ["_name", "klar"]))
                .to.deep.equal({legendAttribute: "typ", needsBridge: true});
        });

        it("matches nothing when no suffix is configured", () => {
            // The suffixes come from config.js; without them only the column
            // the map is styled by can be recognised.
            expect(matchLegendAttribute(colorMap, "woz_name")).to.equal(null);
        });

        it("returns nothing for an attribute the legend says nothing about", () => {
            expect(matchLegendAttribute(colorMap, "nutzung", ["_name"])).to.equal(null);
            expect(matchLegendAttribute(colorMap, "ewoz_name", ["_name"])).to.equal(null);
        });

        it("returns nothing without a legend or without an attribute", () => {
            expect(matchLegendAttribute({}, "woz")).to.equal(null);
            expect(matchLegendAttribute(colorMap, "")).to.equal(null);
        });
    });
});
