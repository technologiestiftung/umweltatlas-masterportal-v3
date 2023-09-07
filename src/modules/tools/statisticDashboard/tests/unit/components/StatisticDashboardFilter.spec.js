import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import StatisticDashboardFilter from "../../../components/StatisticDashboardFilter.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/src/tools/statiscticDashboard/components/StatisticDashboardFilter.vue", () => {
    const timeStepsFilter = {
            5: "Die letzten 5 Jahre",
            10: "Die letzten 10 Jahre",
            all: "Alle Jahre"
        },
        areas = ["Harburg", "Lübeck", "Schwerin"];

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render filtercontainer", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find(".filtercontainer").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdown for category", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find("#categoryfilter").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdown for area", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find("#areafilter").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdown for time", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find("#timefilter").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render dropdownButton for subcategory", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find("button").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render one button if one subcategory is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            await wrapper.setData({
                dropdownSubcategory: ["sub1"]
            });

            expect(wrapper.find(".btn-outline-secondary").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should not render button if no subcategory is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find(".btn-outline-secondary").exists()).to.be.false;
            wrapper.destroy();
        });
        it("should render reset button if subcategory is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            await wrapper.setData({
                dropdownSubcategory: ["sub1"]
            });

            expect(wrapper.find("#reset-button").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should not render reset button if no subcategory is selected", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    timeStepsFilter,
                    areas
                },
                localVue
            });

            expect(wrapper.find("#reset-button").exists()).to.be.false;
            wrapper.destroy();
        });
    });
    describe("Methods", () => {
        describe("toggleSubCategory", () => {
            it("should add a subcategory if there is not already one with that name", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        timeStepsFilter,
                        areas
                    },
                    localVue
                });

                await wrapper.setData({
                    dropdownSubcategory: ["sub1"]
                });
                wrapper.vm.toggleSubCategory("sub2");
                expect(wrapper.vm.dropdownSubcategory).to.deep.equals(["sub1", "sub2"]);
                wrapper.destroy();
            });
            it("should remove a subcategory if there is already one with that name", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        timeStepsFilter,
                        areas
                    },
                    localVue
                });

                await wrapper.setData({
                    dropdownSubcategory: ["sub1"]
                });
                wrapper.vm.toggleSubCategory("sub1");
                expect(wrapper.vm.dropdownSubcategory).to.deep.equals([]);
                wrapper.destroy();
            });
        });
        describe("removeCategory", () => {
            it("should remove subcategory if the name existed", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        timeStepsFilter,
                        areas
                    },
                    localVue
                });

                await wrapper.setData({
                    dropdownSubcategory: ["sub1", "sub2"]
                });
                wrapper.vm.removeCategory("sub1");
                expect(wrapper.vm.dropdownSubcategory).to.deep.equals(["sub2"]);
                wrapper.destroy();
            });
        });
        describe("resetCategories", () => {
            it("should remove all subcategories", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        timeStepsFilter,
                        areas
                    },
                    localVue
                });

                await wrapper.setData({
                    dropdownSubcategory: ["sub1", "sub2"]
                });
                wrapper.vm.resetCategories();
                expect(wrapper.vm.dropdownSubcategory).to.deep.equals([]);
                wrapper.destroy();
            });
        });
    });
});
