import {expect} from "chai";
import getters from "../../../store/gettersWfsAnalyzer";
import stateWfsAnalyzer from "../../../store/stateWfsAnalyzer";

describe("addons/wfsAnalyzer/store/gettersWfsAnalyzer", () => {
    const legendColors = {woz: {10: "#FFCC65", 21: "#FF6699"}};

    /**
     * Builds the state and the getters the colour getters depend on.
     * @param {Object} [overrides={}] state overrides.
     * @param {Object} [settings={}] setting overrides.
     * @param {Object} [preset=null] the preset of the selected layer.
     * @returns {Object} the state and the module getters.
     */
    function setup (overrides = {}, settings = {}, preset = null) {
        const state = {...stateWfsAnalyzer, ...overrides},
            moduleGetters = {
                settings: {autoColor: false, maxLegendRules: 40, ...settings},
                preset
            };

        moduleGetters.autoColorEnabled = getters.autoColorEnabled(state, moduleGetters);
        moduleGetters.legendMatch = getters.legendMatch(state, moduleGetters);

        return {state, moduleGetters};
    }

    describe("areaAttributeCandidates", () => {
        const flalle = {name: "flalle", title: "Flächengröße [m²]", isNumeric: true},
            importid = {name: "importid", title: "Schlüssel", isNumeric: true},
            meter = {name: "meter", title: "Länge des Abschnittes [m]", isNumeric: true};

        it("offers the configured area columns", () => {
            const candidates = getters.areaAttributeCandidates({areaAttribute: ""}, {
                suggestedAreaAttributes: [flalle],
                possibleAreaAttributes: [flalle, importid]
            });

            expect(candidates).to.deep.equal([flalle]);
        });

        it("offers nothing when no column is named as an area", () => {
            // A numeric column is no evidence of an area - "Schlüssel" and
            // "X-Koordinate" are numbers too, and summing them is nonsense.
            const candidates = getters.areaAttributeCandidates({areaAttribute: ""}, {
                suggestedAreaAttributes: [],
                possibleAreaAttributes: [importid]
            });

            expect(candidates).to.deep.equal([]);
        });

        it("keeps a column a preset named, so the select shows what is set", () => {
            const candidates = getters.areaAttributeCandidates({areaAttribute: "meter"}, {
                suggestedAreaAttributes: [],
                possibleAreaAttributes: [importid, meter]
            });

            expect(candidates).to.deep.equal([meter]);
        });
    });

    describe("canAnalyseByArea", () => {
        it("follows the candidates", () => {
            expect(getters.canAnalyseByArea({}, {areaAttributeCandidates: [{name: "flalle"}]})).to.equal(true);
            expect(getters.canAnalyseByArea({}, {areaAttributeCandidates: []})).to.equal(false);
        });
    });

    describe("presetAnalyseAttribute", () => {
        const attributes = [
            {name: "woz_name", title: "Stadtstruktur"},
            {name: "nutzung", title: "Nutzung"}
        ];

        /**
         * @param {Object|null} preset the preset of the selected layer.
         * @returns {Object} the module getters the getter depends on.
         */
        function withPreset (preset) {
            return {preset, selectableAttributes: attributes};
        }

        it("returns the attribute a preset pins", () => {
            expect(getters.presetAnalyseAttribute({}, withPreset({analyseAttribute: "woz_name"})))
                .to.deep.equal({name: "woz_name", title: "Stadtstruktur"});
        });

        it("ignores the spelling of the preset", () => {
            expect(getters.presetAnalyseAttribute({}, withPreset({analyseAttribute: " WOZ_Name "}))?.name)
                .to.equal("woz_name");
        });

        it("returns null when the layer does not have that attribute", () => {
            // preselectAttributes skips such a preset with a warning, so the
            // choice is the user's again and the select has to stay.
            expect(getters.presetAnalyseAttribute({}, withPreset({analyseAttribute: "gibtesnicht"}))).to.equal(null);
        });

        it("returns null without a preset or without the field", () => {
            expect(getters.presetAnalyseAttribute({}, withPreset(null))).to.equal(null);
            expect(getters.presetAnalyseAttribute({}, withPreset({}))).to.equal(null);
            expect(getters.presetAnalyseAttribute({}, withPreset({analyseAttribute: ""}))).to.equal(null);
            expect(getters.presetAnalyseAttribute({}, withPreset({analyseAttribute: 42}))).to.equal(null);
        });
    });

    describe("areaCqlFilter", () => {
        const moduleGetters = {attributeByName: () => ({isNumeric: false})};

        it("describes the area selection alone", () => {
            const state = {...stateWfsAnalyzer, filterAttribute: "bezirk", filterValue: "Mitte"};

            expect(getters.areaCqlFilter(state, moduleGetters)).to.equal("bezirk='Mitte'");
        });

        it("ignores the additional filter, which narrows what is counted, not where", () => {
            const state = {
                ...stateWfsAnalyzer,
                filterAttribute: "bezirk",
                filterValue: "Mitte",
                extraFilterAttribute: "woz_name",
                extraFilterValue: "Wohnnutzung"
            };

            expect(getters.areaCqlFilter(state, moduleGetters)).to.equal("bezirk='Mitte'");
        });

        it("is empty without an area selection, so nothing is drawn", () => {
            expect(getters.areaCqlFilter({...stateWfsAnalyzer}, moduleGetters)).to.equal("");
            expect(getters.areaCqlFilter({...stateWfsAnalyzer, filterAttribute: "bezirk"}, moduleGetters)).to.equal("");
        });

        it("writes a numeric value without quotes", () => {
            const state = {...stateWfsAnalyzer, filterAttribute: "plr_id", filterValue: "12"};

            expect(getters.areaCqlFilter(state, {attributeByName: () => ({isNumeric: true})})).to.equal("plr_id=12");
        });
    });

    describe("autoColorEnabled", () => {
        it("follows the global setting when no preset says otherwise", () => {
            expect(setup({}, {autoColor: true}).moduleGetters.autoColorEnabled).to.equal(true);
            expect(setup({}, {autoColor: false}).moduleGetters.autoColorEnabled).to.equal(false);
        });

        it("lets a preset switch it on for one layer", () => {
            expect(setup({}, {autoColor: false}, {autoColor: true}).moduleGetters.autoColorEnabled).to.equal(true);
        });

        it("lets a preset switch it off for one layer", () => {
            expect(setup({}, {autoColor: true}, {autoColor: false}).moduleGetters.autoColorEnabled).to.equal(false);
        });

        it("ignores a preset that does not mention it", () => {
            expect(setup({}, {autoColor: true}, {autoColor: null}).moduleGetters.autoColorEnabled).to.equal(true);
        });
    });

    describe("legendMatch", () => {
        it("stays empty while the feature is switched off", () => {
            const {moduleGetters} = setup({legendColors, analyseAttribute: "woz"}, {autoColor: false});

            expect(moduleGetters.legendMatch).to.equal(null);
        });

        it("matches the analysed attribute directly", () => {
            const {moduleGetters} = setup({legendColors, analyseAttribute: "woz"}, {autoColor: true});

            expect(moduleGetters.legendMatch).to.deep.equal({legendAttribute: "woz", needsBridge: false});
        });

        it("matches the readable counterpart of a code", () => {
            const {moduleGetters} = setup({legendColors, analyseAttribute: "woz_name"}, {autoColor: true});

            expect(moduleGetters.legendMatch).to.deep.equal({legendAttribute: "woz", needsBridge: true});
        });
    });

    describe("categoryColors", () => {
        it("has no colours without a match", () => {
            const {state, moduleGetters} = setup({legendColors, analyseAttribute: "nutzung"}, {autoColor: true});

            expect(getters.categoryColors(state, moduleGetters)).to.deep.equal({});
        });

        it("keys the colours by value when the values are the legend's own", () => {
            const {state, moduleGetters} = setup({legendColors, analyseAttribute: "woz"}, {autoColor: true});

            expect(getters.categoryColors(state, moduleGetters)).to.deep.equal({10: "#FFCC65", 21: "#FF6699"});
        });

        it("keys the colours by the readable name when a bridge is needed", () => {
            const {state, moduleGetters} = setup({
                legendColors,
                analyseAttribute: "woz_name",
                codeNames: {10: "Wohnnutzung", 21: "Mischnutzung"}
            }, {autoColor: true});

            expect(getters.categoryColors(state, moduleGetters))
                .to.deep.equal({Wohnnutzung: "#FFCC65", Mischnutzung: "#FF6699"});
        });

        it("leaves out a code whose name is unknown instead of guessing", () => {
            const {state, moduleGetters} = setup({
                legendColors,
                analyseAttribute: "woz_name",
                codeNames: {10: "Wohnnutzung"}
            }, {autoColor: true});

            expect(getters.categoryColors(state, moduleGetters)).to.deep.equal({Wohnnutzung: "#FFCC65"});
        });

        it("has no colours while the bridge has not been built", () => {
            const {state, moduleGetters} = setup({legendColors, analyseAttribute: "woz_name"}, {autoColor: true});

            expect(getters.categoryColors(state, moduleGetters)).to.deep.equal({});
        });
    });
});
