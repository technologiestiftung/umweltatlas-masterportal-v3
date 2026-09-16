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
    let loadValuesForSpy,
        runAnalysisSpy,
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
                                loadValuesFor: loadValuesForSpy,
                                selectFilterValue: sinon.spy(),
                                selectExtraFilterAttribute: sinon.spy(),
                                selectExtraFilterValue: sinon.spy(),
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
        loadValuesForSpy = sinon.spy();
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

    it("picks the layer automatically when only one is active", () => {
        visibleLayers = [layers[0]];
        mountComponent();

        expect(selectLayerSpy.calledOnce).to.be.true;
        expect(selectLayerSpy.firstCall.args[1]).to.equal(layers[0].id);
    });

    it("does not preselect when there is a choice to make", () => {
        mountComponent();

        expect(selectLayerSpy.called).to.be.false;
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
        });

        it("carries no text explaining how the tool is built", () => {
            const text = mountComponent(confirmed).text();

            // Every one of these described a backend constraint, not a choice.
            expect(text).to.not.contain("additional:modules.wfsAnalyzer.intro");
            expect(text).to.not.contain("additional:modules.wfsAnalyzer.filter.loadValuesHint");
            expect(text).to.not.contain("additional:modules.wfsAnalyzer.mode.areaAttributeHint");
        });

        it("names the area attributes the same way as everywhere else", () => {
            const options = mountComponent(confirmed)
                    .findAll("#wfs-analyzer-filter-attribute option"),
                labels = options.map((option) => option.text());

            expect(options[0].text()).to.equal("additional:modules.wfsAnalyzer.filter.wholeLayer");
            // Documented name plus the technical one, as in the other selects.
            expect(labels).to.include("Bezirksname (bezirk)");
            expect(labels).to.include("Bezirksname (Code) (bez)");
        });

        it("asks for a value only once an area is chosen", async () => {
            const wrapper = mountComponent(confirmed);

            expect(wrapper.find("#wfs-analyzer-filter-value").exists()).to.be.false;

            await wrapper.find("#wfs-analyzer-filter-attribute").setValue("bezirk");

            expect(selectFilterAttributeSpy.calledOnce).to.be.true;
        });

        it("loads the values when the value field is focused - no button", async () => {
            const wrapper = mountComponent({...confirmed, filterAttribute: "bezirk"});

            expect(wrapper.text()).to.not.contain("additional:modules.wfsAnalyzer.filter.loadValues");

            await wrapper.find("#wfs-analyzer-filter-value").trigger("focus");

            expect(loadValuesForSpy.calledOnce).to.be.true;
            expect(loadValuesForSpy.firstCall.args[1]).to.equal("bezirk");
        });

        it("offers the loaded values as suggestions while typing", () => {
            const wrapper = mountComponent({
                    ...confirmed,
                    filterAttribute: "bezirk",
                    valueCache: {bezirk: {values: ["Mitte", "Pankow"], truncated: false, status: "ready"}}
                }),
                values = wrapper.findAll("#wfs-analyzer-filter-value-values option")
                    .map((option) => option.attributes("value"));

            expect(values).to.deep.equal(["Mitte", "Pankow"]);
        });

        it("shows a spinner while the values are loading", () => {
            const wrapper = mountComponent({
                ...confirmed,
                filterAttribute: "bezirk",
                valueCache: {bezirk: {values: [], truncated: false, status: "loading"}}
            });

            expect(wrapper.find(".wfs-analyzer-field-spinner").exists()).to.be.true;
        });

        it("warns when the suggestion list is incomplete", () => {
            const wrapper = mountComponent({
                ...confirmed,
                filterAttribute: "bezirk",
                valueCache: {bezirk: {values: ["a", "b"], truncated: true, status: "ready"}}
            });

            expect(wrapper.find(".alert-warning").exists()).to.be.true;
            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.filter.valuesLoadedPartly");
        });

        it("falls back to typing when no value list is available", () => {
            const wrapper = mountComponent({
                ...confirmed,
                filterAttribute: "bezirk",
                valueCache: {bezirk: {values: [], truncated: false, status: "error"}}
            });

            expect(wrapper.text()).to.contain("additional:modules.wfsAnalyzer.filter.valuesUnavailable");
            expect(wrapper.find("#wfs-analyzer-filter-value").exists()).to.be.true;
        });

        it("hides the area-attribute select when there is nothing to choose", () => {
            const wrapper = mountComponent({...confirmed, mode: "area", areaAttribute: "flalle"});

            // Exactly one numeric candidate, so the choice is made silently.
            expect(wrapper.find("#wfs-analyzer-area-attribute").exists()).to.be.false;
        });

        it("asks which attribute holds the area only when several could", () => {
            const wrapper = mountComponent({
                ...confirmed,
                attributes: [...attributes, {name: "flaeche", title: "Fläche", type: "xsd:double", isGeometry: false, isNumeric: true}],
                mode: "area",
                areaAttribute: "flalle"
            });

            expect(wrapper.find("#wfs-analyzer-area-attribute").exists()).to.be.true;
        });

        it("does not offer an area analysis for a layer without an area attribute", () => {
            const wrapper = mountComponent({
                ...confirmed,
                attributes: attributes.filter((attribute) => !attribute.isNumeric)
            });

            expect(wrapper.find("#wfs-analyzer-mode-area").exists()).to.be.false;
            expect(wrapper.find("#wfs-analyzer-mode-count").exists()).to.be.false;
        });

        it("switches the mode via the buttons", async () => {
            const wrapper = mountComponent(confirmed);

            await wrapper.find("#wfs-analyzer-mode-area").trigger("click");

            expect(selectModeSpy.calledOnce).to.be.true;
            expect(selectModeSpy.firstCall.args[1]).to.equal("area");
        });

        it("keeps the additional filter collapsed until asked for", async () => {
            const wrapper = mountComponent(confirmed);

            expect(wrapper.find("#wfs-analyzer-extra-attribute").exists()).to.be.false;

            await wrapper.find("#wfs-analyzer-extra-toggle").trigger("click");

            expect(wrapper.find("#wfs-analyzer-extra-attribute").exists()).to.be.true;
        });

        it("leaves the area attribute out of the additional filter", async () => {
            const wrapper = mountComponent({...confirmed, filterAttribute: "bezirk"});

            await wrapper.find("#wfs-analyzer-extra-toggle").trigger("click");

            const options = wrapper.findAll("#wfs-analyzer-extra-attribute option")
                .map((option) => option.attributes("value"));

            expect(options).to.not.include("bezirk");
            expect(options).to.include("nutzung");
        });

        it("shows how many features will be loaded", () => {
            expect(mountComponent(confirmed).text())
                .to.contain("additional:modules.wfsAnalyzer.analysis.featureCount");
        });

        it("warns when the filter matches more features than configured", () => {
            expect(mountComponent({...confirmed, featureCount: 999999}).text())
                .to.contain("additional:modules.wfsAnalyzer.analysis.manyFeatures");
        });

        it("keeps the start button disabled until an attribute is chosen", async () => {
            const wrapper = mountComponent(confirmed);

            expect(wrapper.find("#wfs-analyzer-analysis button.btn-primary").attributes("disabled"))
                .to.not.be.undefined;

            await wrapper.find("#wfs-analyzer-analyse-attribute").setValue("nutzung");

            expect(wrapper.find("#wfs-analyzer-analysis button.btn-primary").attributes("disabled"))
                .to.be.undefined;
        });

        it("starts the analysis on click", async () => {
            const wrapper = mountComponent({...confirmed, analyseAttribute: "nutzung"});

            await wrapper.find("#wfs-analyzer-analysis button.btn-primary").trigger("click");

            expect(runAnalysisSpy.calledOnce).to.be.true;
        });

        it("labels the analysed attributes with the name documented in the WFS", () => {
            const labels = mountComponent(confirmed)
                .findAll("#wfs-analyzer-analyse-attribute option")
                .map((option) => option.text());

            expect(labels).to.include("Bezirksname (bezirk)");
            expect(labels).to.include("typklar");
        });

        it("renders the result as a table with a bar per row by default", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                mode: "area",
                areaAttribute: "flalle",
                analysisStatus: "ready",
                result: areaResult
            });

            expect(wrapper.findAll("tbody tr")).to.have.lengthOf(2);
            expect(wrapper.findAll("tbody .wfs-analyzer-bar-fill")).to.have.lengthOf(2);
            expect(wrapper.text()).to.contain("Wohnnutzung");
        });

        it("offers the result as a CSV download", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "ready",
                result: areaResult
            });

            expect(wrapper.find("#wfs-analyzer-download").exists()).to.be.true;
        });

        it("renders the result as a pie chart", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "ready",
                result: areaResult,
                resultView: "pie"
            });

            expect(wrapper.findAll("svg path")).to.have.lengthOf(2);
        });

        it("renders the result as a table with a totals row", () => {
            const wrapper = mountComponent({
                ...confirmed,
                analyseAttribute: "nutzung",
                analysisStatus: "ready",
                result: areaResult
            });

            expect(wrapper.findAll("tbody tr")).to.have.lengthOf(2);
            expect(wrapper.find("tfoot").text()).to.contain("additional:modules.wfsAnalyzer.result.total");
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
            const wrapper = mountComponent({...confirmed, attributes: [], attributesStatus: "loading"});

            expect(wrapper.findAll(".spinner-border")).to.have.lengthOf(1);
            expect(wrapper.find("#wfs-analyzer-analyse-attribute").exists()).to.be.false;
        });

        it("drops the loading indicator once the form is ready", () => {
            const wrapper = mountComponent(confirmed);

            expect(wrapper.find(".spinner-border").exists()).to.be.false;
            expect(wrapper.find("#wfs-analyzer-analyse-attribute").exists()).to.be.true;
        });
    });
});
