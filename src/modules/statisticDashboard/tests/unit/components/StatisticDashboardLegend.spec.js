import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardLegend from "../../../components/StatisticDashboardLegend.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/statiscticDashboard/components/StatisticDashboardLegend.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("The component should exist", () => {
            const propsData = {
                    legendValue: [
                        {
                            "graphic": "data:image/svg+xml;charset=utf-8,<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'><polygon points='5,5 30,5 30,30 5,30' style='fill:rgb(158, 202, 225);fill-opacity:0.9;stroke:rgb(158, 202, 225);stroke-opacity:0.9;stroke-width:3;stroke-linecap:round;stroke-dasharray:;'/></svg>",
                            "name": "90"
                        }
                    ],
                    title: "Einwohner",
                    showNoticeText: false
                },
                wrapper = shallowMount(StatisticDashboardLegend, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.find("#legend-content").exists()).to.be.true;
            expect(wrapper.find("#collapseLegend img").exists()).to.be.true;
            expect(wrapper.find("#collapseLegend span").exists()).to.be.true;
            expect(wrapper.find("#collapseLegend span").text()).to.be.equal("90");
        });
        it("should render title", () => {
            const propsData = {
                    legendValue: [
                        {
                            "graphic": "data:image/svg+xml;charset=utf-8,<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'><polygon points='5,5 30,5 30,30 5,30' style='fill:rgb(158, 202, 225);fill-opacity:0.9;stroke:rgb(158, 202, 225);stroke-opacity:0.9;stroke-width:3;stroke-linecap:round;stroke-dasharray:;'/></svg>",
                            "name": "90"
                        }
                    ],
                    title: "Einwohner",
                    showNoticeText: false
                },
                wrapper = shallowMount(StatisticDashboardLegend, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.find(".accordion-item").text()).to.be.include("Einwohner");
        });
        it("should render notice text", () => {
            const propsData = {
                    legendValue: [
                        {
                            "graphic": "data:image/svg+xml;charset=utf-8,<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'><polygon points='5,5 30,5 30,30 5,30' style='fill:rgb(158, 202, 225);fill-opacity:0.9;stroke:rgb(158, 202, 225);stroke-opacity:0.9;stroke-width:3;stroke-linecap:round;stroke-dasharray:;'/></svg>",
                            "name": "90"
                        }
                    ],
                    title: "Einwohner",
                    showNoticeText: true
                },
                wrapper = shallowMount(StatisticDashboardLegend, {
                    propsData: propsData,
                    global: {
                        plugins: [store]
                    }
                });

            expect(wrapper.find(".more-statistics").exists()).to.be.true;
        });
    });
});
