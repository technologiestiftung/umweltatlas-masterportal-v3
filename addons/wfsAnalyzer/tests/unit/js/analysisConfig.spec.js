import {expect} from "chai";
import {getAnalysisConfig, normalizePresets} from "../../../js/analysisConfig";

describe("addons/wfsAnalyzer/js/analysisConfig", () => {
    afterEach(() => {
        delete global.Config;
    });

    describe("normalizePresets", () => {
        it("returns an empty list when nothing is configured", () => {
            expect(normalizePresets(undefined)).to.deep.equal([]);
            expect(normalizePresets(null)).to.deep.equal([]);
            expect(normalizePresets("bezirk")).to.deep.equal([]);
        });

        it("keeps a complete preset", () => {
            expect(normalizePresets([{
                layerId: "ua_flaechennutzung:a_reale_nutzung_bebaute_flaechen_2021",
                filterAttribute: "bezirk",
                areaAttribute: "flalle",
                analyseAttribute: "woz_name",
                mode: "area"
            }])).to.deep.equal([{
                layerId: "ua_flaechennutzung:a_reale_nutzung_bebaute_flaechen_2021",
                filterAttribute: "bezirk",
                areaAttribute: "flalle",
                analyseAttribute: "woz_name",
                mode: "area"
            }]);
        });

        it("fills the optional fields of a minimal preset", () => {
            expect(normalizePresets([{layerId: "a:b", filterAttribute: "bezirk"}])).to.deep.equal([{
                layerId: "a:b",
                filterAttribute: "bezirk",
                areaAttribute: "",
                analyseAttribute: "",
                mode: ""
            }]);
        });

        it("drops entries without a usable layerId", () => {
            expect(normalizePresets([
                {filterAttribute: "bezirk"},
                {layerId: "", filterAttribute: "bezirk"},
                {layerId: 42},
                null,
                "nope",
                {layerId: "a:b"}
            ])).to.have.lengthOf(1);
        });

        it("ignores a mode it does not know", () => {
            expect(normalizePresets([{layerId: "a:b", mode: "sum"}])[0].mode).to.equal("");
            expect(normalizePresets([{layerId: "a:b", mode: "count"}])[0].mode).to.equal("count");
        });

        it("trims configured values", () => {
            expect(normalizePresets([{layerId: " a:b ", filterAttribute: " bezirk "}])[0])
                .to.include({layerId: "a:b", filterAttribute: "bezirk"});
        });
    });

    describe("getAnalysisConfig", () => {
        it("falls back to the defaults without a portal config", () => {
            const settings = getAnalysisConfig();

            expect(settings.filterAttributes).to.include("bezirk");
            expect(settings.areaAttributes).to.include("flalle");
            expect(settings.maxFeatures).to.be.a("number");
            expect(settings.presets).to.deep.equal([]);
        });

        it("takes the values configured in config.js", () => {
            global.Config = {
                wfsAnalyzer: {
                    filterAttributes: ["bezirk"],
                    areaAttributes: ["flalle"],
                    maxFeatures: 100,
                    maxChartCategories: 5,
                    presets: [{layerId: "a:b", filterAttribute: "bezirk", areaAttribute: "flalle"}]
                }
            };

            const settings = getAnalysisConfig();

            expect(settings.filterAttributes).to.deep.equal(["bezirk"]);
            expect(settings.maxFeatures).to.equal(100);
            expect(settings.maxChartCategories).to.equal(5);
            expect(settings.presets).to.have.lengthOf(1);
            expect(settings.presets[0]).to.include({layerId: "a:b", areaAttribute: "flalle"});
        });

        it("keeps the defaults for keys the portal does not set", () => {
            global.Config = {wfsAnalyzer: {maxFeatures: 10}};

            const settings = getAnalysisConfig();

            expect(settings.maxFeatures).to.equal(10);
            expect(settings.filterAttributes).to.include("bezirk");
            expect(settings.presets).to.deep.equal([]);
        });
    });
});
