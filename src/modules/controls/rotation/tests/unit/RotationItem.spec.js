import Vuex from "vuex";
import {expect} from "chai";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import RotationItem from "../../components/RotationItem.vue";
import ControlIcon from "../../../ControlIcon.vue";
import Map from "ol/Map";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/controls/rotation/components/RotationItem.vue", () => {
    let store,
        wrapper;

    before(() => {
        mapCollection.clear();
        mapCollection.addMap(new Map(), "2D");
    });
    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true
        });
    });

    it("the control renders if rotation is not 0", async () => {
        wrapper = shallowMount(RotationItem, {store, localVue});
        await wrapper.setData({rotation: 0.1});

        expect(wrapper.find("#rotation-control").exists()).to.be.true;
    });
    it("the control renders if hideInactive is true", async () => {
        wrapper = shallowMount(RotationItem, {store, localVue});
        await wrapper.setData({hideInactive: true});

        expect(wrapper.find("#rotation-control").exists()).to.be.true;
    });
    it("setToNorth() sets mapView rotation to 0", () => {
        wrapper = shallowMount(RotationItem, {store, localVue});
        mapCollection.getMapView("2D").setRotation(4);
        wrapper.vm.setToNorth();
        expect(mapCollection.getMapView("2D").getRotation()).to.eql(0);
    });
    it("updateRotation() updates rotation data, ControlIcon component exists", async () => {
        const event = {
            target: {
                getRotation: () => {
                    return 0.123;
                }
            }
        };

        wrapper = await shallowMount(RotationItem, {store, localVue});
        await wrapper.vm.updateRotation(event);
        expect(wrapper.vm.rotation).to.eql(0.123);
        expect(wrapper.findComponent(ControlIcon).exists()).to.be.true;
    });
});
