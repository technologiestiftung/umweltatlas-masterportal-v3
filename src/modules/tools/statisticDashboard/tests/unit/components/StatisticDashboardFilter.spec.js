import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import StatisticDashboardFilter from "../../../components/StatisticDashboardFilter.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/src/tools/statiscticDashboard/components/StatisticDashboardFilter.vue", () => {
    const timeStepsFilter = [
            "Die letzten 5 Jahre",
            "Die letzten 10 Jahre",
            "Alle Jahre"
        ],
        regions = ["Harburg", "Lübeck", "Schwerin"];

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render filtercontainer", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find(".filtercontainer").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdown for category", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find("#categoryfilter").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdown for area", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find("#areafilter").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdown for time", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find("#timefilter").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdownButton for statistics", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find("button").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render one button if one statistic is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            await wrapper.setData({
                selectedStatistics: ["stat1"]
            });

            expect(wrapper.find(".btn-outline-secondary").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should not render button if no statistic is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find(".btn-outline-secondary").exists()).to.be.false;
            wrapper.destroy();
        });
        it("should render reset button if statistic is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            await wrapper.setData({
                selectedStatistics: ["stat1"]
            });

            expect(wrapper.find("#reset-button").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should not render reset button if no statistic is selected", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                localVue
            });

            expect(wrapper.find("#reset-button").exists()).to.be.false;
            wrapper.destroy();
        });
    });
    describe("Methods", () => {
        describe("toggleStatistic", () => {
            it("should add a statistic if there is not already one with that name", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    localVue
                });

                await wrapper.setData({
                    selectedStatistics: ["stat1"]
                });
                wrapper.vm.toggleStatistic("stat2");
                expect(wrapper.vm.selectedStatistics).to.deep.equals(["stat1", "stat2"]);
                wrapper.destroy();
            });
            it("should remove a statistic if there is already one with that name", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    localVue
                });

                await wrapper.setData({
                    selectedStatistics: ["stat1"]
                });
                wrapper.vm.toggleStatistic("stat1");
                expect(wrapper.vm.selectedStatistics).to.deep.equals([]);
                wrapper.destroy();
            });
        });
        describe("removeStatistic", () => {
            it("should remove statistic if the name existed", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    localVue
                });

                await wrapper.setData({
                    selectedStatistics: ["stat1", "stat2"]
                });
                wrapper.vm.removeStatistic("stat1");
                expect(wrapper.vm.selectedStatistics).to.deep.equals(["stat2"]);
                wrapper.destroy();
            });
        });
        describe("resetStatistics", () => {
            it("should remove all statistics", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    localVue
                });

                await wrapper.setData({
                    selectedStatistics: ["stat1", "stat2"]
                });
                wrapper.vm.resetStatistics();
                expect(wrapper.vm.selectedStatistics).to.deep.equals([]);
                wrapper.destroy();
            });
        });
    });
});
