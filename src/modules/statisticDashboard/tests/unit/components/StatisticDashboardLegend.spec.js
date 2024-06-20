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
        it("should render title", () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("h5").text()).to.be.include("common:modules.statisticDashboard.legend.editClassification");
        });
        it("should render classification input", () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#classification").exists()).to.be.true;
        });
        it("should render class-range", () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#class-range").exists()).to.be.true;
        });
        it("should render value ranges if classification is 'benutzerdefiniert'", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({selectClassification: "benutzerdefiniert"});

            expect(wrapper.find("#value-ranges").exists()).to.be.true;
        });
        it("should render color palette input", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#custom-color-palette").exists()).to.be.true;
        });
        it("should render opacity input", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#opacity").exists()).to.be.true;
        });
        it("should render 5 value ranges if selectNumberOfClasses is 5", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setData({selectNumberOfClasses: 5, selectClassification: "benutzerdefiniert"});

            expect(wrapper.findAll("#value-ranges").length).to.equal(5);
        });
    });
});
