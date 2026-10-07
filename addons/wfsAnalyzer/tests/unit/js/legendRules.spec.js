import {expect} from "chai";
import {
    buildExclusiveFilters,
    cannotOverlap,
    combineFilters,
    parseLegendClasses,
    readEquality
} from "../../../js/legendRules";

describe("addons/wfsAnalyzer/js/legendRules", () => {
    /**
     * Builds a legend as the service returns it.
     * @param {Object[]} rules the rules.
     * @returns {Object} the legend document.
     */
    function legend (rules) {
        return {Legend: [{rules}]};
    }

    describe("parseLegendClasses", () => {
        it("reads label, filter and colour of a class", () => {
            const classes = parseLegendClasses(legend([
                {name: "10", filter: "[woz = '10']", symbolizers: [{Polygon: {fill: "#FFCC65"}}]}
            ]));

            expect(classes).to.deep.equal([{label: "10", filter: "woz = '10'", color: "#FFCC65"}]);
        });

        it("keeps a range exactly as the legend writes it", () => {
            // Quoted numbers and all: the service reads this back as CQL and
            // returns the same count as for the unquoted form.
            const [first] = parseLegendClasses(legend([
                {name: "1 - 4", filter: "[ew_ha > '0' AND ew_ha <= '4']", symbolizers: [{Polygon: {fill: "#CCFF66"}}]}
            ]));

            expect(first.filter).to.equal("ew_ha > '0' AND ew_ha <= '4'");
            expect(first.label).to.equal("1 - 4");
        });

        it("prefers the title where a service sets one", () => {
            const [first] = parseLegendClasses(legend([
                {name: "10", title: "Wohnnutzung", filter: "[woz = '10']", symbolizers: [{Polygon: {fill: "#a"}}]}
            ]));

            expect(first.label).to.equal("Wohnnutzung");
        });

        it("skips a rule without a filter, which paints everything", () => {
            const classes = parseLegendClasses(legend([
                {name: "alles", symbolizers: [{Polygon: {fill: "#a"}}]},
                {name: "10", filter: "[woz = '10']", symbolizers: [{Polygon: {fill: "#b"}}]}
            ]));

            expect(classes).to.have.lengthOf(1);
            expect(classes[0].label).to.equal("10");
        });

        it("skips a rule without a label, which could not be shown", () => {
            expect(parseLegendClasses(legend([{filter: "[a = 1]", symbolizers: []}]))).to.deep.equal([]);
        });

        it("repairs a label and filter read in the wrong encoding", () => {
            // One legend may mix both: the layer title in latin-1, the rule
            // names in utf-8. Whichever way the document is read, half of it
            // comes out wrong, so each string is repaired on its own.
            const [only] = parseLegendClasses(legend([
                {name: "GrÃ¼n- und FreiflÃ¤che", filter: "[grz <> '110']", symbolizers: [{Polygon: {fill: "#a"}}]}
            ]));

            expect(only.label).to.equal("Grün- und Freifläche");
        });

        it("makes one class of rules that repeat a filter", () => {
            // A style draws the same features again for a hatching or an
            // outline; each of those is a rule. bodengesellschaften2020 has 133
            // rules over 78 distinct filters.
            const classes = parseLegendClasses(legend([
                {name: "1080", filter: "[bgs_neu = '1080']", symbolizers: [{Polygon: {fill: "#9B6A3D"}}]},
                {name: "1080", filter: "[bgs_neu = '1080']", symbolizers: [{Polygon: {}}]},
                {name: "1080", filter: "[bgs_neu = '1080']", symbolizers: [{Polygon: {}}]}
            ]));

            expect(classes).to.deep.equal([{label: "1080", filter: "bgs_neu = '1080'", color: "#9B6A3D"}]);
        });

        it("takes the colour from a later rule when the first has none", () => {
            const [only] = parseLegendClasses(legend([
                {name: "a", filter: "[x = 1]", symbolizers: [{Polygon: {}}]},
                {name: "a", filter: "[x = 1]", symbolizers: [{Polygon: {fill: "#abcdef"}}]}
            ]));

            expect(only.color).to.equal("#abcdef");
        });

        it("accepts raw json and survives rubbish", () => {
            expect(parseLegendClasses(JSON.stringify(legend([
                {name: "a", filter: "[x = 1]", symbolizers: [{Polygon: {fill: "#a"}}]}
            ])))).to.have.lengthOf(1);
            expect(parseLegendClasses("kein json")).to.deep.equal([]);
            expect(parseLegendClasses(undefined)).to.deep.equal([]);
        });
    });

    describe("buildExclusiveFilters", () => {
        it("excludes every later class that could overlap, as the map draws them on top", () => {
            // Different columns: a feature may carry both, so the later rule
            // is what the map shows and the earlier one has to give way.
            const [first, second, third] = buildExclusiveFilters([
                {label: "a", filter: "woz = '10'"},
                {label: "b", filter: "grz = '100'"},
                {label: "c", filter: "grz = '110'"}
            ]);

            expect(first.filter).to.equal("(woz = '10') AND NOT (grz = '100') AND NOT (grz = '110')");
            expect(second.filter).to.equal("(grz = '100')");
            expect(third.filter).to.equal("(grz = '110')");
        });

        it("keeps label and colour untouched", () => {
            const [first] = buildExclusiveFilters([{label: "a", filter: "x = 1", color: "#abc"}]);

            expect(first).to.include({label: "a", color: "#abc"});
        });

        it("copes with no classes at all", () => {
            expect(buildExclusiveFilters([])).to.deep.equal([]);
        });

        it("leaves out an exclusion that cannot change anything", () => {
            // Two values of one column never match the same feature, so the
            // filters stay short - which also keeps them below the gateway's
            // patience: it rejects a filter putting IS NULL after a quoted
            // value.
            const [first] = buildExclusiveFilters([
                {label: "a", filter: "woz = '10'"},
                {label: "b", filter: "woz IS NULL AND grz = '110'"}
            ]);

            expect(first.filter).to.equal("(woz = '10')");
        });
    });

    describe("cannotOverlap", () => {
        it("sees two different values of one column", () => {
            expect(cannotOverlap("woz = '10'", "woz = '21'")).to.equal(true);
        });

        it("sees a value against a null test", () => {
            expect(cannotOverlap("woz = '10'", "woz IS NULL AND grz = '110'")).to.equal(true);
            expect(cannotOverlap("woz IS NULL", "woz = '10'")).to.equal(true);
        });

        it("sees the two halves of a not-equals split", () => {
            expect(cannotOverlap("woz IS NULL AND grz <> '110'", "woz IS NULL AND grz = '110'")).to.equal(true);
        });

        it("admits it cannot tell for different columns", () => {
            // A feature may well carry both, which is exactly the overlap the
            // exclusion is there for.
            expect(cannotOverlap("woz = '10'", "grz = '100'")).to.equal(false);
        });

        it("admits it cannot tell for ranges", () => {
            expect(cannotOverlap("ew_ha > '0' AND ew_ha <= '4'", "ew_ha > '4' AND ew_ha <= '30'")).to.equal(false);
        });
    });

    describe("combineFilters", () => {
        it("brackets both sides", () => {
            expect(combineFilters("a = 1", "b = 2")).to.equal("(a = 1) AND (b = 2)");
        });

        it("skips what is empty", () => {
            expect(combineFilters("a = 1", "")).to.equal("(a = 1)");
            expect(combineFilters("", "b = 2")).to.equal("(b = 2)");
            expect(combineFilters("", "")).to.equal("");
        });
    });

    describe("readEquality", () => {
        it("reads the column and the value", () => {
            expect(readEquality("woz = '10'")).to.deep.equal({attribute: "woz", value: "10"});
            expect(readEquality("stufe = 3")).to.deep.equal({attribute: "stufe", value: "3"});
        });

        it("is not fooled by a range or a combination", () => {
            // Only a plain equality can be traded for readable text.
            expect(readEquality("ew_ha > '0' AND ew_ha <= '4'")).to.equal(null);
            expect(readEquality("woz IS NULL AND grz <> '110'")).to.equal(null);
            expect(readEquality("")).to.equal(null);
        });
    });
});
