import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {mount, config, createLocalVue} from "@vue/test-utils";
import Modeler3DImportComponent from "../../../components/Modeler3DImport.vue";
import Modeler3DModule from "../../../store/indexModeler3D";
import {JSDOM} from "jsdom";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";

const localVue = createLocalVue(),
    globalDocument = global.document,
    globalWindow = global.window,
    {window} = new JSDOM(),
    featureCollection = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    name: "Zeichnung",
                    clampToGround: true,
                    color: {
                        red: 0.9411764705882353,
                        green: 0.9725490196078431,
                        blue: 1,
                        alpha: 1
                    },
                    outlineColor: {
                        red: 0.9411764705882353,
                        green: 0.9725490196078431,
                        blue: 1,
                        alpha: 1
                    },
                    extrudedHeight: 51.399072774877325
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [9.994428832757109, 53.55216143433489, 31.39907277487732],
                        [9.99525788981755, 53.552197024075085, 31.39907277487732],
                        [9.994765846774351, 53.55178310383997, 31.39907277487732]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    name: "Zeichnung",
                    clampToGround: true,
                    color: {
                        red: 0.9411764705882353,
                        green: 0.9725490196078431,
                        blue: 1,
                        alpha: 1
                    },
                    width: 2
                },
                geometry: {
                    type: "Polyline",
                    coordinates: [[
                        [9.994428832757109, 53.55216143433489, 31.39907277487732],
                        [9.99525788981755, 53.552197024075085, 31.39907277487732],
                        [9.994765846774351, 53.55178310383997, 31.39907277487732]
                    ]]
                }
            }
        ]
    };

global.window = window;
global.FileReader = window.FileReader;
localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/Modeler3DImport.vue", () => {
    let store, wrapper, scene;
    const entities = {
            getById: sinon.stub().returns({position: {}}),
            values: []
        },
        defaultDataSource = {entities},
        dataSourceDisplay = {defaultDataSource},
        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return scene;
            }
        };

    map3D.getDataSourceDisplay = sinon.stub().returns(dataSourceDisplay);

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            Entity: function (options) {
                this.id = options.id;
                this.name = options.name;
                this.clampToGround = options.clampToGround;
            }
        };

        entities.add = sinon.stub();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Modeler3D: Modeler3DModule
                    }
                }
            }
        });
        store.commit("Tools/Modeler3D/setActive", true);
        store.commit("Tools/Modeler3D/setIsLoading", false);
    });

    afterEach(() => {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    after(() => {
        global.document = globalDocument;
        global.window = globalWindow;
    });

    it("should find Tool component", () => {
        wrapper = mount(Modeler3DImportComponent, {store, localVue});
        const toolModeler3DImportWrapper = wrapper.findComponent({name: "BasicFileImport"});

        expect(toolModeler3DImportWrapper.exists()).to.be.true;
    });
    it("should handle files correctly", () => {
        wrapper = mount(Modeler3DImportComponent, {store, localVue});
        const fileDetails = {
                lastModified: 1686206596589,
                name: "House.gltf",
                size: 1801540,
                type: "",
                webkitRelativePath: ""
            },
            file = new File([fileDetails], fileDetails.name),
            readAsArrayBufferStub = sinon.stub(FileReader.prototype, "readAsArrayBuffer"),
            readAsTextStub = sinon.stub(FileReader.prototype, "readAsText");
            // addSingleAlertStub = sinon.stub(store, "dispatch");

        file.name = fileDetails.name;

        // Call the addFile function
        wrapper.vm.addFile([file]);
        // expect(addSingleAlertStub.calledOnceWith("Alerting/addSingleAlert")).to.be.true;
        // expect(addSingleAlertStub.args[0][1]).to.deep.equal({
        //     content: i18next.t("common:modules.tools.modeler3D.import.alertingMessages.missingFormat", {format: "xyz"})
        // });
        readAsArrayBufferStub.restore();
        readAsTextStub.restore();
    });
    it("handles OBJ file correctly", () => {
        const fileContent = "dummy obj file content",
            fileName = "example.obj",

            objLoaderStub = sinon.stub(OBJLoader.prototype, "parse").returns(fileContent);

        wrapper = mount(Modeler3DImportComponent, {store, localVue});
        wrapper.vm.handleObjFile(fileContent, fileName);

        expect(objLoaderStub.calledOnce).to.be.true;
    });
    it("should handle DAE file correctly", () => {
        wrapper = mount(Modeler3DImportComponent, {store, localVue});
        const fileContent = "dummy dae file content",
            fileName = "example.dae",

            colladaLoaderStub = sinon.stub(ColladaLoader.prototype, "load");

        wrapper.vm.handleDaeFile(fileContent, fileName);
        expect(colladaLoaderStub.calledOnce).to.be.true;
    });
    it("handles GeoJSON file correctly", () => {
        const fileContent = JSON.stringify(featureCollection),
            featureCount = featureCollection.features.length;

        global.Cesium.Color = function (red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        };
        global.Cesium.ColorMaterialProperty = function (color) {
            this.color = color;
        };
        global.Cesium.PolygonHierarchy = function (positions) {
            this.positions = positions;
        };
        global.Cesium.ShadowMode = {
            ENABLED: 1
        };
        global.Cesium.Cartesian3 = {
            fromDegrees: sinon.stub().returns({x: 10, y: 20, z: 30})
        };

        wrapper = mount(Modeler3DImportComponent, {store, localVue});
        wrapper.vm.handleGeoJsonFile(fileContent);

        expect(entities.add.callCount).to.equal(featureCount);
        expect(store.state.Tools.Modeler3D.drawnModels.length).to.equal(featureCount);
        expect(store.state.Tools.Modeler3D.currentView).to.equal("draw");
    });
    it("displays the list of successfully imported models", async () => {
        wrapper = mount(Modeler3DImportComponent, {store, localVue});
        const importedModels = [
                {
                    id: "1",
                    name: "Model 1",
                    show: true
                },
                {
                    id: "2",
                    name: "Model 2",
                    show: true
                }
            ],
            importedModelList = wrapper.find("#successfully-imported-models");

        store.commit("Tools/Modeler3D/setImportedModels", importedModels);
        await wrapper.vm.$nextTick();

        expect(importedModelList.exists()).to.be.true;
    });
});
