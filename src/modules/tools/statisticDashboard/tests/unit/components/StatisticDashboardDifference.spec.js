import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import StatisticDashboardDifference from "../../../components/StatisticDashboardDifference.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import Multiselect from "vue-multiselect";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/src/tools/statiscticDashboard/components/StatisticDashboardDifference.vue", () => {
    const store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                }
            }
        }),
        propsData = {
            referenceData: {
                "year": [
                    {label: "2000", value: "2000"},
                    {label: "2001", value: "2001"},
                    {label: "2002", value: "2002"}
                ],
                "area": [
                    {label: "Wandsbek", value: "Wandsbek"},
                    {label: "Hamburg", value: "Hamburg"},
                    {label: "Deutschland", value: "Deutschland"}
                ]
            }
        };

    describe("Component DOM", () => {
        it("The close button should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.find(".bootstrap-icon").exists()).to.be.true;
            wrapper.destroy();
        });

        it("The title should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.find("h4").exists()).to.be.true;
            wrapper.destroy();
        });

        it("The description should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.find("span").exists()).to.be.true;
            wrapper.destroy();
        });

        it("The input radio button year should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.find("input#reference-year").exists()).to.be.true;
            wrapper.destroy();
        });

        it("The input radio button area should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.find("input#reference-area").exists()).to.be.true;
            wrapper.destroy();
        });

        it("The input radio button area should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.find("input#reference-area").exists()).to.be.true;
            wrapper.destroy();
        });

        it("The component multiselect should exist", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.findComponent(Multiselect).exists()).to.be.true;
            wrapper.destroy();
        });
    });

    describe("Computed Properties", () => {
        it("should set selectedValue to undefined", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.vm.selectedValue).to.be.undefined;
            wrapper.destroy();
        });

        it("should set referenceType to year", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.vm.referenceType).to.equal("year");
            wrapper.destroy();
        });
    });

    describe("User Interaction", () => {
        it("should click reference type with area", async () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            await wrapper.find("input#reference-area").setChecked();
            expect(wrapper.vm.selectedValue).to.deep.equal([]);
            expect(wrapper.vm.optionData).to.deep.equal([
                {label: "Wandsbek", value: "Wandsbek"},
                {label: "Hamburg", value: "Hamburg"},
                {label: "Deutschland", value: "Deutschland"}
            ]);
            expect(wrapper.vm.selectedReferenceData).to.deep.equal({
                "type": "area",
                "value": []
            });
            wrapper.destroy();
        });
    });
});
