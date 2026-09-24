import {expect} from "chai";
import {chartColors, formatNumber, getAreaUnit, getChartColor, groupCategories} from "../../../js/formatResult";

describe("addons/wfsAnalyzer/js/formatResult", () => {
    describe("getAreaUnit", () => {
        it("uses square kilometres for a district sized area", () => {
            expect(getAreaUnit(16151234)).to.deep.equal({factor: 1000000, key: "km2"});
        });

        it("uses hectares for medium areas", () => {
            expect(getAreaUnit(250000)).to.deep.equal({factor: 10000, key: "ha"});
        });

        it("uses square metres for small areas", () => {
            expect(getAreaUnit(4623)).to.deep.equal({factor: 1, key: "m2"});
        });
    });

    describe("formatNumber", () => {
        it("groups thousands in German locale", () => {
            expect(formatNumber(26397, "de")).to.equal("26.397");
        });

        it("respects the requested number of decimals", () => {
            expect(formatNumber(16.151234, "de", 2)).to.equal("16,15");
        });

        it("falls back to zero for non-finite values", () => {
            expect(formatNumber(NaN, "de")).to.equal("0");
            expect(formatNumber(Infinity, "de")).to.equal("0");
        });
    });

    describe("groupCategories", () => {
        const categories = [
            {label: "a", value: 10, share: 0.4},
            {label: "b", value: 8, share: 0.32},
            {label: "c", value: 4, share: 0.16},
            {label: "d", value: 2, share: 0.08},
            {label: "e", value: 1, share: 0.04}
        ];

        it("keeps the list untouched when it is short enough", () => {
            expect(groupCategories(categories, 5, "other")).to.have.lengthOf(5);
            expect(groupCategories(categories, 10, "other")).to.deep.equal(categories);
        });

        it("pools the smallest categories into one remainder", () => {
            const grouped = groupCategories(categories, 3, "Sonstige");

            expect(grouped).to.have.lengthOf(3);
            expect(grouped[0].label).to.equal("a");
            expect(grouped[1].label).to.equal("b");
            expect(grouped[2]).to.include({label: "Sonstige", value: 7, isOther: true, groupedCount: 3});
        });

        it("preserves the total when pooling", () => {
            const grouped = groupCategories(categories, 3, "Sonstige"),
                total = categories.reduce((sum, category) => sum + category.value, 0);

            expect(grouped.reduce((sum, category) => sum + category.value, 0)).to.equal(total);
        });

        it("preserves the shares when pooling", () => {
            const grouped = groupCategories(categories, 3, "Sonstige");

            expect(grouped.reduce((sum, category) => sum + category.share, 0)).to.be.closeTo(1, 1e-9);
        });

        it("returns an empty array for a missing list", () => {
            expect(groupCategories(undefined, 5, "other")).to.deep.equal([]);
        });
    });

    describe("getChartColor", () => {
        it("returns a colour for every index by cycling the palette", () => {
            expect(getChartColor(0)).to.match(/^#[0-9a-f]{6}$/i);
            // cycles at the end of the palette, whatever its length
            expect(getChartColor(0)).to.equal(getChartColor(chartColors.length));
            expect(getChartColor(3)).to.not.equal(getChartColor(4));
        });
    });
});
