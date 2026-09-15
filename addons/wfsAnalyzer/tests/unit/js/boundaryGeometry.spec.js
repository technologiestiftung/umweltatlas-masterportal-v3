import {expect} from "chai";
import {findFeatureByProperty} from "../../../js/boundaryGeometry";

/**
 * A feature collection shaped like the bundled district file.
 * @type {Object}
 */
const bezirke = {
    type: "FeatureCollection",
    features: [
        {type: "Feature", properties: {name: "11000001", gem: "001", namgem: "Mitte", namlan: "Berlin", lan: "11"}, geometry: null},
        {type: "Feature", properties: {name: "11000002", gem: "002", namgem: "Friedrichshain-Kreuzberg", namlan: "Berlin", lan: "11"}, geometry: null},
        {type: "Feature", properties: {name: "11000008", gem: "008", namgem: "Neukölln", namlan: "Berlin", lan: "11"}, geometry: null}
    ]
};

describe("addons/wfsAnalyzer/js/boundaryGeometry", () => {
    describe("findFeatureByProperty", () => {
        it("finds the outline for a district name", () => {
            expect(findFeatureByProperty(bezirke, "namgem", "Mitte").properties.namgem)
                .to.equal("Mitte");
        });

        it("handles hyphens and umlauts", () => {
            expect(findFeatureByProperty(bezirke, "namgem", "Friedrichshain-Kreuzberg")).to.not.be.null;
            expect(findFeatureByProperty(bezirke, "namgem", "Neukölln")).to.not.be.null;
        });

        it("returns null for a value the file does not know", () => {
            expect(findFeatureByProperty(bezirke, "namgem", "Hamburg")).to.be.null;
        });

        it("returns null without a value", () => {
            expect(findFeatureByProperty(bezirke, "namgem", "")).to.be.null;
            expect(findFeatureByProperty(bezirke, "namgem", null)).to.be.null;
            expect(findFeatureByProperty(bezirke, "namgem", undefined)).to.be.null;
        });

        it("returns null for a property the file does not have", () => {
            expect(findFeatureByProperty(bezirke, "gibtsnicht", "Mitte")).to.be.null;
        });

        it("survives a missing or malformed collection", () => {
            expect(findFeatureByProperty(null, "namgem", "Mitte")).to.be.null;
            expect(findFeatureByProperty({}, "namgem", "Mitte")).to.be.null;
            expect(findFeatureByProperty({features: "nope"}, "namgem", "Mitte")).to.be.null;
        });

        it("looks up the value only in the configured property", () => {
            // The area codes of the attribute `bez` are "01", "02", … and the
            // Land code in `lan` happens to be "11" as well. Matching against
            // every property would highlight an arbitrary district for them;
            // matching only `namgem` correctly finds nothing.
            expect(findFeatureByProperty(bezirke, "namgem", "11")).to.be.null;
            expect(findFeatureByProperty(bezirke, "namgem", "01")).to.be.null;
        });

        it("compares as text, so a numeric value still matches", () => {
            expect(findFeatureByProperty(bezirke, "lan", 11).properties.namgem).to.equal("Mitte");
        });
    });
});
