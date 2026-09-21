import {expect} from "chai";
import {buildHighlightParams, buildHighlightSld, highlightColor} from "../../../js/areaHighlight";

describe("addons/wfsAnalyzer/js/areaHighlight", () => {
    describe("buildHighlightSld", () => {
        it("names the layer it applies to", () => {
            expect(buildHighlightSld("a_reale_nutzung")).to.contain("<Name>a_reale_nutzung</Name>");
        });

        it("paints polygons, points and lines, so any geometry shows up", () => {
            const sld = buildHighlightSld("a");

            expect(sld).to.contain("PolygonSymbolizer");
            expect(sld).to.contain("PointSymbolizer");
            expect(sld).to.contain("LineSymbolizer");
        });

        it("uses one flat colour", () => {
            const sld = buildHighlightSld("a"),
                colors = sld.match(new RegExp(highlightColor, "g"));

            expect(colors).to.have.lengthOf(3);
            // No fill-opacity: the image stays a single colour and compresses,
            // the transparency is applied to the map layer instead.
            expect(sld).to.not.contain("fill-opacity");
        });

        it("takes another colour when asked", () => {
            expect(buildHighlightSld("a", "#00FF00")).to.contain("#00FF00");
        });
    });

    describe("buildHighlightParams", () => {
        it("switches the anti-aliasing off", () => {
            // With it GeoServer blends the edges, the flat fill turns into a
            // thousand shades and the image triples in size.
            expect(buildHighlightParams("a", "bezirk='Mitte'").format_options).to.equal("antialias:none");
        });

        it("requests a transparent png with the highlight style", () => {
            const params = buildHighlightParams("a", "");

            expect(params.LAYERS).to.equal("a");
            expect(params.FORMAT).to.equal("image/png");
            expect(params.TRANSPARENT).to.equal(true);
            expect(params.STYLES).to.equal("");
            expect(params.SLD_BODY).to.contain("StyledLayerDescriptor");
        });

        it("carries a filter only when there is one", () => {
            expect(buildHighlightParams("a", "bezirk='Mitte'").CQL_FILTER).to.equal("bezirk='Mitte'");
            expect(buildHighlightParams("a", "")).to.not.have.property("CQL_FILTER");
        });
    });
});
