import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import Modeler3DDrawComponent from "../../../components/Modeler3DDraw.vue";
import Modeler3D from "../../../store/indexModeler3D";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/Modeler3DDraw.vue", () => {
    const mockMapGetters = {
            mouseCoordinate: () => {
                return [11.549606597773037, 48.17285700012215];
            }
        },
        Cartesian3Coordinates = {
            x: 3739310.9273738265,
            y: 659341.4057539968,
            z: 5107613.232959453
        },
        pickRayResult = {
            origin: {},
            direction: {}
        },
        entity = {
            id: 1,
            orientation: null,
            position: {
                getValue: () => {
                    return {x: 100, y: 100, z: 100};
                }
            },
            model: {scale: 1}
        },
        entities = {
            getById: sinon.stub().returns(entity),
            add: sinon.stub(),
            values: [{id: "FloatingPointId", positionIndex: 0}]
        },
        scene = {
            camera: {
                getPickRay: sinon.stub().returns(pickRayResult)
            },
            globe: {
                pick: sinon.stub().returns({})
            },
            sampleHeight: sinon.stub()
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
        originalCreateCylinder,
        wrapper;

    beforeEach(() => {
        originalCreateCylinder = Modeler3D.actions.createCylinder;
        Modeler3D.actions.createCylinder = sinon.spy();
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            defined: sinon.stub().returns(true),
            Cartographic: {
                toCartesian: () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                }),
                fromDegrees: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                })
            }
        };

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Modeler3D
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            }
        });

        store.commit("Tools/Modeler3D/setActive", true);
        store.commit("Tools/Modeler3D/setCurrentView", "draw");
    });

    afterEach(() => {
        Modeler3D.actions.createCylinder = originalCreateCylinder;
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("renders Modeler3DDraw", async () => {
        wrapper = shallowMount(Modeler3DDrawComponent, {store, localVue});

        expect(wrapper.find("#modeler3D-draw-tool").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-geometry").exists()).to.be.true;
        expect(wrapper.find("#modeler3D-draw-name").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-transparency").exists()).to.be.true;
        expect(wrapper.find("#clampToGroundSwitch").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-modelling-interaction").exists()).to.be.true;

        it("renders the template for the polygon attributes", () => {
            expect(wrapper.find("#tool-modeler3D-extrudedHeight").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-fill-color").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-outline-color").exists()).to.be.true;
        });
        it("renders the template for the polyline attributes", () => {
            store.commit("Tools/Modeler3D/setSelectedGeometry", "polygon");

            expect(wrapper.find("#tool-modeler3D-lineWidth").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-extrudedHeight").exists()).to.be.false;
            expect(wrapper.find("#tool-modeler3D-fill-color").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-outline-color").exists()).to.be.false;
        });
    });
    describe("Modeler3DDraw.vue methods", () => {
        it("should update currentPosition in Clamp-to-Ground mode", () => {
            const mouseMoveEvent = {
                endPosition: {x: 0, y: 0}
            };

            wrapper = shallowMount(Modeler3DDrawComponent, {store, localVue});
            wrapper.vm.clampToGround = true;
            store.commit("Tools/Modeler3D/setCylinderId", "FloatingPointId");

            wrapper.vm.onMouseMove(mouseMoveEvent);

            expect(scene.camera.getPickRay.calledOnceWith(mouseMoveEvent.endPosition)).to.be.true;
            expect(scene.globe.pick.calledOnceWith(pickRayResult, scene)).to.be.true;
            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentPosition).to.eql({});
            expect(wrapper.vm.activeShapePoints[0]).to.eql({});
        });
        it("should update currentPosition with coordinate transformation in normal mode", () => {
            const mouseMoveEvent = {
                endPosition: {x: 0, y: 0}
            };

            wrapper = shallowMount(Modeler3DDrawComponent, {store, localVue});
            wrapper.vm.clampToGround = false;
            store.commit("Tools/Modeler3D/setCylinderId", "FloatingPointId");

            wrapper.vm.onMouseMove(mouseMoveEvent);

            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentPosition).to.eql(Cartesian3Coordinates);
            expect(wrapper.vm.activeShapePoints[0]).to.eql(Cartesian3Coordinates);
        });
    });
});
