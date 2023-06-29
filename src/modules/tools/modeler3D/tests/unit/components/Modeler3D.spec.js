import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import crs from "@masterportal/masterportalapi/src/crs";
import Modeler3DComponent from "../../../components/Modeler3D.vue";
import Modeler3D from "../../../store/indexModeler3D";
import Modeler3DDraw from "../../../components/Modeler3DDraw.vue";
import Modeler3DImport from "../../../components/Modeler3DImport.vue";
import Modeler3DEntityModel from "../../../components/Modeler3DEntityModel.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/Modeler3D.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            modeler3D: {
                                "name": "translate#common:menu.modeler3D",
                                "icon": "bi-bounding-box"
                            }
                        }
                    }
                }
            }
        },
        namedProjections = [
            ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
            ["EPSG:8395", "+title=ETRS89_3GK3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
            ["EPSG:8395", "+title=EPSG: 8395 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
            ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
        entityList = [
            {
                id: 1,
                position: {getValue: () => "position1"},
                rotation: 0,
                model: {
                    color: null,
                    silhouetteColor: null,
                    silhouetteSize: 0,
                    colorBlendAmount: 0
                }
            },
            {
                id: 2,
                position: {getValue: () => "position2"},
                rotation: 0,
                model: {
                    color: null,
                    silhouetteColor: "white",
                    silhouetteSize: 10,
                    colorBlendAmount: 2
                }
            }
        ],
        entities = {
            getById: (val) => {
                return entityList.find(x => x.id === val);
            }
        },
        scene = {
            requestRender: sinon.stub()
        },
        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return scene;
            },
            getDataSourceDisplay: () => {
                return {
                    defaultDataSource: {
                        entities: entities
                    }
                };
            }
        };

    let store,
        wrapper,
        origUpdatePositionUI;

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            Entity: function (id) {
                this.id = id;
            },
            Cesium3DTileFeature: function (pickId) {
                this.pickId = pickId;
            }
        };

        origUpdatePositionUI = Modeler3D.actions.updatePositionUI;
        Modeler3D.actions.updatePositionUI = sinon.spy();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Modeler3D
                    }
                }
            },
            getters: {
                namedProjections: () => namedProjections
            },
            state: {
                configJson: mockConfigJson
            }
        });
        crs.registerProjections(namedProjections);

        store.commit("Tools/Modeler3D/setActive", true);
        store.commit("Tools/Modeler3D/setCurrentModelId", null);
        store.commit("Tools/Modeler3D/setHiddenObjects", []);
        store.commit("Tools/Modeler3D/setImportedModels", [{id: 1, name: "modelName", heading: 120, scale: 1}]);
    });

    afterEach(() => {
        Modeler3D.actions.updatePositionUI = origUpdatePositionUI;

        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders Modeler3D with import view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        wrapper.vm.currentView = "import-view";
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find(Modeler3DImport).exists()).to.be.true;
        expect(wrapper.find(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("not renders Modeler3D", () => {
        store.commit("Tools/Modeler3D/setActive", false);
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.false;
    });

    it("renders Modeler3D with draw view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        wrapper.vm.currentView = "draw-view";
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find(Modeler3DDraw).exists()).to.be.true;
        expect(wrapper.find(Modeler3DImport).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("renders Modeler3D with options view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        wrapper.vm.currentView = "";
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.true;
        expect(wrapper.find(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.find(Modeler3DImport).exists()).to.be.false;
    });

    it("renders Modeler3D with entity model view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        store.commit("Tools/Modeler3D/setCurrentModelId", "someId");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find(Modeler3DEntityModel).exists()).to.be.true;
        expect(wrapper.find(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.find(Modeler3DImport).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("renders hiddenObject List when set", async () => {
        store.commit("Tools/Modeler3D/setHiddenObjects", [
            {
                id: "id",
                pickId: "pickId",
                layerId: "layerId",
                name: "name"
            }
        ]);

        wrapper = shallowMount(Modeler3DComponent, {store, localVue});
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find("#hidden-objects").exists()).to.be.true;
    });

    describe("Modeler3D.vue methods", () => {
        it("initProjections adds WGS84 decimal projection", () => {
            let projections = [];

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.initProjections();

            projections = store.state.Tools.Modeler3D.projections;
            expect(projections.length).to.be.equals(6);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG").length).to.be.equals(1);
        });

        it("initProjections adds ETRS89_3GK3", () => {
            let projections = [];

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.initProjections();

            projections = store.state.Tools.Modeler3D.projections;
            expect(projections.length).to.be.equals(6);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3").length).to.be.equals(1);
        });

        it("selectObject picks an entity", () => {
            let currentModelId = "";
            const event = {position: "winCoords"},
                pickObject = new global.Cesium.Entity("entityId");

            scene.pick = sinon.stub().returns(pickObject);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(pickObject);

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.selectObject(event);

            currentModelId = store.state.Tools.Modeler3D.currentModelId;

            expect(currentModelId).to.eql("entityId");
        });

        it("selectObject picks object and adds it to list", () => {
            let hiddenObjects = [];
            const event = {position: "winCoords"},
                pickObject = new global.Cesium.Cesium3DTileFeature({
                    object: {
                        show: true,
                        featureId: "featureId",
                        pickId: {key: "pickId"},
                        tileset: {layerReferenceId: "layerId"}
                    }
                });

            scene.pick = sinon.stub().returns(pickObject);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(false);

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.selectObject(event);

            hiddenObjects = store.state.Tools.Modeler3D.hiddenObjects;

            expect(pickObject.pickId.object.show).to.be.false;
            expect(hiddenObjects.length).to.be.equals(1);
            expect(hiddenObjects[0].id).to.be.equals("featureId");
            expect(hiddenObjects[0].pickId).to.be.equals("pickId");
            expect(hiddenObjects[0].layerId).to.be.equals("layerId");
        });

        it("showObject shows the hidden object and deletes it from list", () => {
            let hiddenObjects = [];
            const object = {
                    id: "featureId",
                    pickId: "pickId",
                    layerId: "layerId",
                    name: "Object featureId"
                },
                pickObject = {
                    pickId: {key: "pickId"},
                    show: false
                };

            scene.primitives = {
                _primitives: [{
                    layerReferenceId: "layerId",
                    _selectedTiles: [{content: {getFeature: sinon.stub().returns(pickObject)}}]
                }]
            };

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.showObject(object);

            hiddenObjects = store.state.Tools.Modeler3D.hiddenObjects;

            expect(hiddenObjects.length).to.eql(0);
            expect(pickObject.show).to.be.true;
        });
    });

    describe("Modeler3D.vue watcher", () => {
        it("watch to currentModelId shall highlight selected Entity and populate UI", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});

            wrapper.vm.highlightEntity = sinon.spy();
            store.commit("Tools/Modeler3D/setCurrentModelId", 1);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.highlightEntity).to.be.calledWith(entityList[0]);
            expect(store.state.Tools.Modeler3D.currentModelPosition).to.eql("position1");
            expect(store.state.Tools.Modeler3D.rotation).to.eql(120);
            expect(Modeler3D.actions.updatePositionUI).to.be.called;
        });

        it("watch to currentModelId shall reset highlighting of deselected Entity", async () => {
            store.commit("Tools/Modeler3D/setCurrentModelId", 2);
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.highlightEntity = sinon.spy();
            global.Cesium.Color = {
                WHITE: "#ffffff"
            };

            store.commit("Tools/Modeler3D/setCurrentModelId", null);
            await wrapper.vm.$nextTick();

            expect(entityList[1].model.color).to.be.equals("#ffffff");
            expect(entityList[1].model.silhouetteColor).to.be.null;
            expect(entityList[1].model.silhouetteSize).to.be.equals(0);
            expect(entityList[1].model.colorBlendAmount).to.be.equals(0);

            expect(scene.requestRender).to.be.called;
            expect(store.state.Tools.Modeler3D.currentModelPosition).to.be.null;
        });
    });
});
