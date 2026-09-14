import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import WfsAnalyzer from "../../../components/WfsAnalyzer.vue";
import gettersWfsAnalyzer from "../../../store/gettersWfsAnalyzer";
import mutationsWfsAnalyzer from "../../../store/mutationsWfsAnalyzer";
import stateWfsAnalyzer from "../../../store/stateWfsAnalyzer";

config.global.mocks.$t = (key) => key;

describe("addons/wfsAnalyzer/components/WfsAnalyzer.vue", () => {
    const layers = [
        {
            id: "ua_flurabstand_1995:a_flurabstand_1995",
            name: "Bereiche mit gespanntem Grundwasser 1995",
            typ: "WMS",
            url: "https://gdi.berlin.de/services/wms/ua_flurabstand_1995",
            layers: "a_flurabstand_1995"
        },
        {
            id: "ua_versiegelung_2005:ua_versiegelung_2005",
            name: "Anteil der versiegelten Fläche 2005",
            typ: "WMS",
            url: "https://gdi.berlin.de/services/wms/ua_versiegelung_2005",
            layers: "ua_versiegelung_2005"
        }
    ];
    let runAnalysisSpy,
        selectFilterAttributeSpy,
        selectLayerSpy,
        selectModeSpy,
        store,
        visibleLayers;

    /**
     * Mounts the component on a store that mimics the real module.
     * @param {Object} [moduleState={}] state overrides.
     * @returns {Object} the wrapper.
     */
    function mountComponent (moduleState = {}) {
        store = createStore({
            getters: {
                visibleSubjectDataLayerConfigs: () => visibleLayers
            },
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        WfsAnalyzer: {
                            namespaced: true,
                            state: {...stateWfsAnalyzer, ...moduleState},
                            getters: gettersWfsAnalyzer,
                            mutations: mutationsWfsAnalyzer,
                            actions: {
                                selectLayer: selectLayerSpy,
                                runAnalysis: runAnalysisSpy,
                                selectFilterAttribute: selectFilterAttributeSpy,
                                selectMode: selectModeSpy,
                                checkWfsAvailability: sinon.spy(),
                                loadFilterValues: sinon.spy(),
                                selectFilterValue: sinon.spy(),
                                syncSelection: sinon.spy()
                            }
                        }
                    }
                }
            }
        });

        return mount(WfsAnalyzer, {global: {plugins: [store]}});
    }

    beforeEach(() => {
        selectLayerSpy = sinon.spy();
        runAnalysisSpy = sinon.spy();
        selectFilterAttributeSpy = sinon.spy();
        selectModeSpy = sinon.spy();
        visibleLayers = layers;
    });

    afterEach(() => {
        sinon.restore();
    });

    it("offers every active layer in the dropdown, sorted by name", () => {
        const options = mountComponent().findAll("#wfs-analyzer-layer-select option");

        // The placeholder plus both layers.
        expect(options).to.have.lengthOf(3);
        expect(options[1].text()).to.equal("Anteil der versiegelten Fläche 2005");
        expect(options[2].text()).to.equal("Bereiche mit gespanntem Grundwasser 1995");
    });

    it("shows a hint and no dropdown when no layer is active", () => {
        visibleLayers = [];
        const wrapper = mountComponent();

        expect(wrapper.find("#wfs-analyzer-layer-select").exists()).to.be.false;
        expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.noActiveLayers");
    });

    it("triggers the check when a layer is selected", async () => {
        const wrapper = mountComponent(),
            select = wrapper.find("#wfs-analyzer-layer-select");

        await select.setValue("ua_versiegelung_2005:ua_versiegelung_2005");

        expect(selectLayerSpy.calledOnce).to.be.true;
        expect(selectLayerSpy.firstCall.args[1]).to.equal("ua_versiegelung_2005:ua_versiegelung_2005");
    });

    it("shows a progress message while checking", () => {
        const wrapper = mountComponent({
            selectedLayerId: layers[0].id,
            checkStatus: "checking"
        });

        expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.checking");
        expect(wrapper.find(".spinner-border").exists()).to.be.true;
    });

    it("says nothing when the WFS is available - it just shows the analysis", () => {
        const wrapper = mountComponent({
            selectedLayerId: layers[0].id,
            checkedLayerId: layers[0].id,
            checkStatus: "available",
            wfsUrl: "https://gdi.berlin.de/services/wfs/ua_flurabstand_1995",
            featureType: {name: "ua_flurabstand_1995:a_flurabstand_1995", title: "Gespanntes Grundwasser"},
            attributesStatus: "ready"
        });

        expect(wrapper.find(".alert-success").exists()).to.be.false;
        expect(wrapper.text()).to.not.contain("additional:modules.wfsAnalyzer.available");
        // The service url is an implementation detail the user does not need.
        expect(wrapper.text()).to.not.contain("https://gdi.berlin.de/services/wfs/ua_flurabstand_1995");
        expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.analysis.title");
    });

    it("states that a layer without WFS cannot be analysed", () => {
        const wrapper = mountComponent({
            selectedLayerId: layers[0].id,
            checkedLayerId: layers[0].id,
            checkStatus: "unavailable",
            reason: "noWfsInMetadata"
        });

        expect(wrapper.find(".alert-warning").exists()).to.be.true;
        expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.unavailable.noWfsInMetadata");
        expect(wrapper.text()).to.not.contain("additional:modules.wfsAnalyzer.analysis.title");
    });

    it("offers a retry when the lookup failed", () => {
        const wrapper = mountComponent({
            selectedLayerId: layers[0].id,
            checkedLayerId: layers[0].id,
            checkStatus: "error",
            errorMessage: "Network Error"
        });

        expect(wrapper.find(".alert-danger").exists()).to.be.true;
        expect(wrapper.text()).to.contain("Network Error");
        expect(wrapper.find(".alert-danger button").exists()).to.be.true;
    });

    it("hides the analysis when the result belongs to a previously selected layer", () => {
        const wrapper = mountComponent({
            selectedLayerId: layers[1].id,
            checkedLayerId: layers[0].id,
            checkStatus: "available",
            attributesStatus: "ready",
            wfsUrl: "https://gdi.berlin.de/services/wfs/ua_flurabstand_1995",
            featureType: {name: "ua_flurabstand_1995:a_flurabstand_1995"}
        });

        expect(wrapper.find("#wfs-analyzer-analysis").exists()).to.be.false;
    });

    describe("analysis", () => {
        const attributes = [
                {name: "bezirk", title: "Bezirksname", type: "xsd:string", isGeometry: false, isNumeric: false},
                {name: "bez", title: "Bezirksname (Code)", type: "xsd:string", isGeometry: false, isNumeric: false},
                {name: "nutzung", title: "Flächennutzung", type: "xsd:string", isGeometry: false, isNumeric: false},
                {name: "typklar", title: "typklar", type: "xsd:string", isGeometry: false, isNumeric: false},
                {name: "flalle", title: "Flächengröße [m²]", type: "xsd:double", isGeometry: false, isNumeric: true},
                {name: "geom", title: "geom", type: "gml:MultiSurfacePropertyType", isGeometry: true, isNumeric: false}
            ],
            confirmed = {
                selectedLayerId: layers[0].id,
                checkedLayerId: layers[0].id,
                checkStatus: "available",
                wfsUrl: "https://gdi.berlin.de/services/wfs/ua_flaechennutzung",
                featureType: {name: layers[0].id},
                attributes,
                attributesStatus: "ready",
                featureCount: 791,
                featureCountStatus: "ready"
            },
            areaResult = {
                unit: "area",
                total: 3000,
                categories: [
                    {label: "Wohnnutzung", value: 2000, share: 2 / 3},
                    {label: "Park", value: 1000, share: 1 / 3}
                ]
            };

        it("shows the analysis form once a WFS is confirmed", () => {
            const wrapper = mountComponent(confirmed);


            expect(wrapper.find("#wfs-analyzer-analysis").exists()).to.be.true;
            expect(wrapper.find("#wfs-analyzer-filter-attribute").exists()).to.be.true;
            expect(wrapper.find("#wfs-analyzer-analyse-attribute").exists()).to.be.true;
            expect(wrapper.find("#wfs-analyzer-mode-count").exists()).to.be.true;
            expect(wrapper.find("#wfs-analyzer-mode-area").exists()).to.be.true;
        });

        it("offers the configured filter attributes but never the geometry", () => {
            const options = mountComponent(confirmed)
                .findAll("#wfs-analyzer-filter-attribute option")
                .map((option) => option.attributes("value"));

            expect(options).to.include("bezirk");
            expect(options).to.include("bez");
            expect(options).to.not.include("geom");
        });

        it("does not offer the geometry as the analysed attribute", () => {
            const options = mountComponent(confirmed)
                .findAll("#wfs-analyzer-analyse-attribute option")
                .map((option) => option.attributes("value"));

            expect(options).to.include("nutzung");
            expect(options).to.not.include("geom");
        });

        it("shows how many features will be loaded", () => {
            expect(mountComponent(confirmed).text())
                .to.contain("additional:modules.wfsAnalyzer.analysis.featureCount");
        });

        it("warns when the filter matches more features than configured", () => {
            const wrapper = mountComponent({...confirmed, featureCount: 999999});

            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.analysis.manyFeatures");
        });

        it("keeps the start button disabled until an attribute is chosen", async () => {
            const wrapper = mountComponent(confirmed),
                button = wrapper.find("#wfs-analyzer-analysis button.btn-primary");

            expect(button.attributes("disabled")).to.not.be.undefined;

            await wrapper.find("#wfs-analyzer-analyse-attribute").setValue("nutzung");

            expect(wrapper.find("#wfs-analyzer-analysis button.btn-primary").attributes("disabled"))
                .to.be.undefined;
        });

        it("starts the analysis on click", async () => {
            const wrapper = mountComponent({...confirmed, analyseAttribute: "nutzung"});

            await wrapper.find("#wfs-analyzer-analysis button.btn-primary").trigger("click");

            expect(runAnalysisSpy.calledOnce).to.be.true;
        });

        it("reveals the area attribute select in area mode", () => {
            const wrapper = mountComponent({...confirmed, mode: "area", areaAttribute: "flalle"}),
                options = wrapper.findAll("#wfs-analyzer-area-attribute option")
                    .map((option) => option.attributes("value"));

            expect(wrapper.find("#wfs-analyzer-area-attribute").exists()).to.be.true;
            expect(options).to.include("flalle");
            // Only numeric attributes can hold an area.
            expect(options).to.not.include("nutzung");
        });

        it("switches the mode via the radios", async () => {
            const wrapper = mountComponent(confirmed);

            await wrapper.find("#wfs-analyzer-mode-area").trigger("change");

            expect(selectModeSpy.calledOnce).to.be.true;
            expect(selectModeSpy.firstCall.args[1]).to.equal("area");
        });

        it("selects a filter attribute", async () => {
            const wrapper = mountComponent(confirmed);

            await wrapper.find("#wfs-analyzer-filter-attribute").setValue("bezirk");

            expect(selectFilterAttributeSpy.calledOnce).to.be.true;
            expect(selectFilterAttributeSpy.firstCall.args[1]).to.equal("bezirk");
        });

        it("offers loaded filter values as datalist suggestions", () => {
            const wrapper = mountComponent({
                    ...confirmed,
                    filterAttribute: "bezirk",
                    filterValues: ["Mitte", "Pankow"],
                    filterValuesStatus: "ready"
                }),
                values = wrapper.findAll("#wfs-analyzer-filter-values option")
                    .map((option) => option.attributes("value"));

            expect(values).to.deep.equal(["Mitte", "Pankow"]);
            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.filter.valuesLoaded");
        });

        it("degrades to a hint when the service refuses a value list", () => {
            const wrapper = mountComponent({
                ...confirmed,
                filterAttribute: "bezirk",
                filterValuesStatus: "error"
            });

            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.filter.valuesUnavailable");
            // Typing a value by hand must still be possible.
            expect(wrapper.find("#wfs-analyzer-filter-value").exists()).to.be.true;
            expect(wrapper.find(".alert-danger").exists()).to.be.false;
        });

        it("renders the result as a bar chart by default", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                mode: "area",
                areaAttribute: "flalle",
                analysisStatus: "ready",
                result: areaResult
            });

            expect(wrapper.findAll(".wfs-analyzer-bar-row")).to.have.lengthOf(2);
            expect(wrapper.text()).to.contain("Wohnnutzung");
            // The heading interpolates the readable name, not the raw column.
            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.result.title");
        });

        it("renders the result as a pie chart", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "ready",
                result: areaResult,
                resultView: "pie"
            });

            expect(wrapper.find("svg").exists()).to.be.true;
            expect(wrapper.findAll("svg path")).to.have.lengthOf(2);
            expect(wrapper.findAll(".wfs-analyzer-swatch")).to.have.lengthOf(2);
        });

        it("renders the result as a table with a totals row", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "ready",
                result: areaResult,
                resultView: "table"
            });

            expect(wrapper.findAll("tbody tr")).to.have.lengthOf(2);
            expect(wrapper.find("tfoot").text()).to.contain("additional:modules.wfsAnalyzer.result.total");
        });

        it("labels an empty attribute value", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "ready",
                resultView: "table",
                result: {unit: "count", total: 5, categories: [{label: "", value: 5, share: 1}]}
            });

            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.result.noValue");
        });

        it("reports a failed analysis", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "error",
                analysisError: "Request failed with status code 502"
            });

            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.analysis.failed");
            expect(wrapper.text()).to.contain("Request failed with status code 502");
        });

        it("shows one loading indicator while the attributes are loading", () => {
            const wrapper = mountComponent({
                ...confirmed,
                attributes: [],
                attributesStatus: "loading"
            });

            expect(wrapper.findAll(".spinner-border")).to.have.lengthOf(1);
            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.analysis.loadingAttributes");
            expect(wrapper.find("#wfs-analyzer-analyse-attribute").exists()).to.be.false;
        });

        it("shows one loading indicator while the WFS is being checked", () => {
            const wrapper = mountComponent({
                selectedLayerId: layers[0].id,
                checkStatus: "checking"
            });

            expect(wrapper.findAll(".spinner-border")).to.have.lengthOf(1);
            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.checking");
        });

        it("drops the loading indicator once the form is ready", () => {
            const wrapper = mountComponent(confirmed);

            expect(wrapper.find(".spinner-border").exists()).to.be.false;
            expect(wrapper.find("#wfs-analyzer-analyse-attribute").exists()).to.be.true;
        });

        it("labels the attributes with the name documented in the WFS", () => {
            const labels = mountComponent(confirmed)
                .findAll("#wfs-analyzer-analyse-attribute option")
                .map((option) => option.text());

            expect(labels).to.include("Bezirksname (bezirk)");
            expect(labels).to.include("Flächennutzung (nutzung)");
            // Undocumented attributes keep their technical name alone.
            expect(labels).to.include("typklar");
        });

        it("keeps the technical name as the option value", () => {
            const options = mountComponent(confirmed)
                .findAll("#wfs-analyzer-analyse-attribute option")
                .map((option) => option.attributes("value"));

            expect(options).to.include("nutzung");
            expect(options).to.include("flalle");
        });

        it("labels the area attribute too", () => {
            const labels = mountComponent({...confirmed, mode: "area", areaAttribute: "flalle"})
                .findAll("#wfs-analyzer-area-attribute option")
                .map((option) => option.text());

            expect(labels).to.include("Flächengröße [m²] (flalle)");
        });
    });
});
