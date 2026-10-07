import {expect} from "chai";
import {drawnFilter} from "../../../js/areaLayer";

describe("addons/wfsAnalyzer/js/areaLayer", () => {
    describe("drawnFilter", () => {
        it("draws the area itself for the filled and outlined styles", () => {
            expect(drawnFilter("bezirk='Mitte'", "highlight")).to.equal("bezirk='Mitte'");
            expect(drawnFilter("bezirk='Mitte'", "border")).to.equal("bezirk='Mitte'");
        });

        it("draws everything but the area for the mask", () => {
            // Turning it around in the filter keeps it a plain map layer.
            // Cutting the area out of a veil on the map canvas took the map
            // away with it, and inverting the image rendered nothing at all.
            expect(drawnFilter("bezirk='Mitte'", "mask")).to.equal("NOT (bezirk='Mitte')");
        });

        it("has nothing to turn around without an area", () => {
            expect(drawnFilter("", "mask")).to.equal("");
        });
    });
});
