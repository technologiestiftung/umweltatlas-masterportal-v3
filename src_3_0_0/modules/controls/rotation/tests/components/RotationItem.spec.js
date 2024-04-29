import {createStore} from "vuex";
import {expect} from "chai";
import {config, mount, shallowMount} from "@vue/test-utils";
import RotationItemComponent from "../../components/RotationItem.vue";
import Map from "ol/Map";
import sinon from "sinon";
import RotationItem from "../../store/indexRotation";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/controls/rotation/components/RotationItem.vue", () => {
    let store,
        wrapper,
        showAlways,
        rotationIcons,
        isMobile;

    before(() => {
        mapCollection.clear();
        mapCollection.addMap(new Map(), "2D");
    });
    beforeEach(() => {
        isMobile = false;
        showAlways = false;
        rotationIcons = true;

        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Rotation: RotationItem
                    }
                }
            },
            getters: {
                isMobile: () => isMobile,
                controlsConfig: () => {
                    return {
                        rotation: {
                            showAlways: showAlways,
                            rotationIcons: rotationIcons
                        }
                    };
                }
            }
        });
        store.commit("Controls/Rotation/setRotation", 0, {root: true});
        store.commit("Controls/Rotation/setShowAlways", false, {root: true});
        store.commit("Controls/Rotation/setRotationAngle", 45, {root: true});
    });
    afterEach(() => {
        sinon.restore();
    });
    it("the reset rotation button renders if rotation is not 0, rotate buttons are rendered", async () => {
        store.commit("Controls/Rotation/setRotation", 0.1, {root: true});
        wrapper = mount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("isMobile: the reset rotation button renders, rotate buttons are not rendered", async () => {
        isMobile = true;
        store.commit("Controls/Rotation/setRotation", 0.1, {root: true});
        wrapper = mount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.false;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.false;
    });
    it("the reset rotation button renders if showAlways is true, rotate buttons are rendered", () => {
        showAlways = true;
        store.commit("Controls/Rotation/setShowAlways", true, {root: true});
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("the reset rotation button not rendered if showAlways is false, rotate buttons are rendered", () => {
        showAlways = false;
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.false;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("the rotate-buttons are not rendered if rotationIcons is false", () => {
        rotationIcons = true;
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.false;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    describe("methods", () => {
        it("rotateClockwise", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            mapCollection.getMapView("2D").setRotation(0);
            wrapper.vm.rotateClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(wrapper.vm.degreesToRadians(45));
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(wrapper.vm.degreesToRadians(45));
            wrapper.vm.rotateClockwise();
            wrapper.vm.rotateClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(wrapper.vm.degreesToRadians(135));
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(wrapper.vm.degreesToRadians(135));
        });
        it("rotateClockwise set rotation to 0 if near north", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            store.commit("Controls/Rotation/setRotation", wrapper.vm.degreesToRadians(-45), {root: true});
            mapCollection.getMapView("2D").setRotation(wrapper.vm.degreesToRadians(-45));
            wrapper.vm.rotateClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(0);
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(0);
        });
        it("rotateClockwise set angle to 90", () => {
            store.commit("Controls/Rotation/setRotationAngle", 90, {root: true});
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            store.commit("Controls/Rotation/setRotation", 0, {root: true});
            mapCollection.getMapView("2D").setRotation(0);
            wrapper.vm.rotateClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(wrapper.vm.degreesToRadians(90));
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(wrapper.vm.degreesToRadians(90));
        });
        it("rotateCounterClockwise set angle to 80", () => {
            store.commit("Controls/Rotation/setRotationAngle", 80, {root: true});
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            store.commit("Controls/Rotation/setRotation", 0, {root: true});
            mapCollection.getMapView("2D").setRotation(0);
            wrapper.vm.rotateClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(wrapper.vm.degreesToRadians(80));
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(wrapper.vm.degreesToRadians(80));
        });
        it("rotateCounterClockwise", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            mapCollection.getMapView("2D").setRotation(0);
            wrapper.vm.rotateCounterClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(wrapper.vm.degreesToRadians(-45));
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(wrapper.vm.degreesToRadians(-45));
            wrapper.vm.rotateCounterClockwise();
            wrapper.vm.rotateCounterClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(wrapper.vm.degreesToRadians(-135));
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(wrapper.vm.degreesToRadians(-135));
        });
        it("rotateCounterClockwise set rotation to 0 if near north", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            store.commit("Controls/Rotation/setRotation", wrapper.vm.degreesToRadians(45), {root: true});
            mapCollection.getMapView("2D").setRotation(wrapper.vm.degreesToRadians(45));
            wrapper.vm.rotateCounterClockwise();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(0);
            expect(store.getters["Controls/Rotation/rotation"]).to.eql(0);
        });
        it("setToNorth() sets mapView rotation to 0", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            mapCollection.getMapView("2D").setRotation(4);
            wrapper.vm.setToNorth();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(0);
        });
        it("degreesToRadians", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            expect(wrapper.vm.degreesToRadians(0)).to.eql(0);
            expect(wrapper.vm.degreesToRadians(180)).to.eql(Math.PI);
            expect(wrapper.vm.degreesToRadians(360)).to.eql(2 * Math.PI);
            expect(wrapper.vm.degreesToRadians(90)).to.eql(Math.PI / 2);

            expect(wrapper.vm.degreesToRadians(-180)).to.eql(-Math.PI);
            expect(wrapper.vm.degreesToRadians(-360)).to.eql(-2 * Math.PI);
            expect(wrapper.vm.degreesToRadians(-90)).to.eql(Math.PI / -2);
        });
    });
});
