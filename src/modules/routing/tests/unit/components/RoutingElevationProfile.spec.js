import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import RoutingElevationProfileData from "../../../components/RoutingElevationProfile.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/routing/components/RoutingElevationProfileData.vue", () => {
    const routingDirections = {
        duration: 10,
        distance: 10,
        segments: [],
        elevationProfile: {
            data: [[0, 150], [10, 185], [17, 204]],
            ascent: 100,
            descent: 250
        }
    };

    let store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing: {
                            namespaced: true,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    getters: {
                                        routingDirections: () => routingDirections
                                    }
                                }
                            },
                            getters: {
                                directionsSettings: () => {
                                    return {
                                        styleElevationProfile: {
                                            profileColor: "#fe2c00",
                                            profileFillColor: "#fccac0",
                                            elevationPointLineColor: [0, 0, 0, 1.0],
                                            elevationPointFillColor: [125, 125, 125, 1.0]
                                        }
                                    };
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should render the component", () => {
        sinon.stub(RoutingElevationProfileData.methods, "drawChart");
        wrapper = mount(RoutingElevationProfileData, {
            global: {
                plugins: [store]
            },
            attachTo: document.body
        });
        expect(wrapper.findComponent(RoutingElevationProfileData).exists()).to.be.true;
    });

    it("should extract directions data correctly", () => {
        sinon.stub(RoutingElevationProfileData.methods, "drawChart");
        wrapper = mount(RoutingElevationProfileData, {
            global: {
                plugins: [store]
            },
            attachTo: document.body
        });

        expect(wrapper.vm.distances).deep.to.equal([0, 10, 17]);
        expect(wrapper.vm.elevations).deep.to.equal([150, 185, 204]);
        expect(wrapper.vm.ascent).equals("100");
        expect(wrapper.vm.descent).equals("250");
    });
});
