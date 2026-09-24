import {expect} from "chai";
import {areaLayerOpacity, buildHighlightParams, buildHighlightSld, defaultAreaColor, normalizeAreaStyle, readAreaOpacity} from "../../../js/areaHighlight";

describe("addons/wfsAnalyzer/js/areaHighlight", () => {
    describe("normalizeAreaStyle", () => {
        it("falls back to the filled style", () => {
            expect(normalizeAreaStyle().style).to.equal("highlight");
            expect(normalizeAreaStyle({style: "umriss"}).style).to.equal("highlight");
        });

        it("takes the three styles it knows", () => {
            expect(normalizeAreaStyle({style: "border"}).style).to.equal("border");
            expect(normalizeAreaStyle({style: "highlight"}).style).to.equal("highlight");
            expect(normalizeAreaStyle({style: "mask"}).style).to.equal("mask");
        });

        it("takes a hex colour in either length", () => {
            expect(normalizeAreaStyle({color: "#0050A0"}).color).to.equal("#0050A0");
            expect(normalizeAreaStyle({color: "#0af"}).color).to.equal("#0af");
        });

        it("refuses anything that is not a plain hex colour", () => {
            // The value is interpolated into an SLD document, so nothing else
            // has any business getting through.
            ["red", "rgb(1,2,3)", "#00ff00; evil", "", null, 42].forEach((color) => {
                expect(normalizeAreaStyle({color}).color).to.equal(defaultAreaColor);
            });
        });
    });

    describe("areaLayerOpacity", () => {
        it("lets the map show through a fill, but draws an outline solid", () => {
            expect(areaLayerOpacity("highlight")).to.be.below(1);
            expect(areaLayerOpacity("border")).to.equal(1);
        });

        it("lets the map show through the veil of the mask", () => {
            expect(areaLayerOpacity("mask")).to.be.below(1);
        });

        it("treats an unknown style like the default", () => {
            expect(areaLayerOpacity("unsinn")).to.equal(areaLayerOpacity("highlight"));
        });

        it("takes an opacity from the configuration over the one of the style", () => {
            expect(areaLayerOpacity("mask", 0.8)).to.equal(0.8);
            expect(areaLayerOpacity("border", 0.25)).to.equal(0.25);
            expect(areaLayerOpacity("highlight", 0)).to.equal(0);
        });

        it("keeps the style's own where the configuration has none or a wrong one", () => {
            expect(areaLayerOpacity("mask")).to.equal(0.45);
            expect(areaLayerOpacity("mask", 45)).to.equal(0.45);
            expect(areaLayerOpacity("mask", "0.8")).to.equal(0.45);
        });
    });

    describe("readAreaOpacity", () => {
        it("takes a share between none and all", () => {
            expect(readAreaOpacity(0)).to.equal(0);
            expect(readAreaOpacity(0.45)).to.equal(0.45);
            expect(readAreaOpacity(1)).to.equal(1);
        });

        it("refuses anything outside it, and anything that is not a number", () => {
            // 45 is more likely a percentage written by mistake than an
            // intention, and painting the map over would be the result.
            expect(readAreaOpacity(45)).to.equal(null);
            expect(readAreaOpacity(-1)).to.equal(null);
            expect(readAreaOpacity("0.5")).to.equal(null);
            expect(readAreaOpacity(undefined)).to.equal(null);
            expect(readAreaOpacity(NaN)).to.equal(null);
        });
    });

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

        it("fills the polygons in the highlight style", () => {
            expect(buildHighlightSld("a", {style: "highlight"})).to.contain("<PolygonSymbolizer><Fill>");
        });

        it("fills the polygons without an outline in the mask style", () => {
            // The hairline outline of the highlight style would widen the hole
            // it cuts by a pixel.
            const sld = buildHighlightSld("a", {style: "mask"});

            expect(sld).to.contain("<PolygonSymbolizer><Fill>");
            expect(sld).to.not.contain("</Fill><Stroke>");
        });

        it("leaves the polygons hollow in the border style", () => {
            const sld = buildHighlightSld("a", {style: "border"});

            expect(sld).to.contain("<PolygonSymbolizer><Stroke>");
            expect(sld).to.not.contain("<Fill>");
        });

        it("uses one flat colour, never a transparency", () => {
            const sld = buildHighlightSld("a", {color: "#0050A0"});

            expect(sld).to.contain("#0050A0");
            expect(sld).to.not.contain(defaultAreaColor);
            // The transparency belongs on the map layer: it keeps the image a
            // single colour, which is what makes it compress.
            expect(sld).to.not.contain("opacity");
        });

        it("draws a thicker line for a border than for a fill's edge", () => {
            /**
             * @param {String} style the area style.
             * @returns {Number} the stroke width the style asks for.
             */
            function strokeWidth (style) {
                return Number((/stroke-width">(\d+)/).exec(buildHighlightSld("a", {style}))[1]);
            }

            expect(strokeWidth("border")).to.be.above(strokeWidth("highlight"));
        });
    });

    describe("buildHighlightParams", () => {
        it("switches the anti-aliasing off", () => {
            // With it GeoServer blends the edges, the flat colour turns into a
            // thousand shades and the image triples in size.
            expect(buildHighlightParams("a", "bezirk='Mitte'").format_options).to.equal("antialias:none");
        });

        it("requests a transparent png with the area style", () => {
            const params = buildHighlightParams("a", "");

            expect(params.LAYERS).to.equal("a");
            expect(params.FORMAT).to.equal("image/png");
            expect(params.TRANSPARENT).to.equal(true);
            expect(params.STYLES).to.equal("");
            expect(params.SLD_BODY).to.contain("StyledLayerDescriptor");
        });

        it("passes the configured style through", () => {
            expect(buildHighlightParams("a", "", {style: "border"}).SLD_BODY).to.contain("<PolygonSymbolizer><Stroke>");
        });

        it("carries a filter only when there is one", () => {
            expect(buildHighlightParams("a", "bezirk='Mitte'").CQL_FILTER).to.equal("bezirk='Mitte'");
            expect(buildHighlightParams("a", "")).to.not.have.property("CQL_FILTER");
        });
    });
});
