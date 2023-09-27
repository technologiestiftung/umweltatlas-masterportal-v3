import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import StatisticDashboardDifference from "../../../components/StatisticDashboardDifference.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import Multiselect from "vue-multiselect";
import StatisticSwitcher from "../../../components/StatisticDashboardSwitcher.vue";

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
                "date": [
                    {label: "2000", value: "2000"},
                    {label: "2001", value: "2001"},
                    {label: "2002", value: "2002"}
                ],
                "region": [
                    {label: "Wandsbek", value: "Wandsbek"},
                    {label: "Hamburg", value: "Hamburg"},
                    {label: "Deutschland", value: "Deutschland"}
                ]
            }
        };

    describe("Component DOM", () => {
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

        it("should find switcher component", async () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.findComponent(StatisticSwitcher).exists()).to.be.true;
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

        it("should set referenceType to date", () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            expect(wrapper.vm.referenceType).to.equal("date");
            wrapper.destroy();
        });
    });

    describe("Methods", () => {
        it("should set reference type with region", async () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            await wrapper.vm.handleReference("Gebiet");
            expect(wrapper.vm.selectedValue).to.deep.equal([]);
            expect(wrapper.vm.optionData).to.deep.equal([
                {label: "Wandsbek", value: "Wandsbek"},
                {label: "Hamburg", value: "Hamburg"},
                {label: "Deutschland", value: "Deutschland"}
            ]);
            expect(wrapper.vm.selectedReferenceData).to.deep.equal({
                "type": "region",
                "value": []
            });
            wrapper.destroy();
        });

        it("should set savedReferenceData", async () => {
            const wrapper = shallowMount(StatisticDashboardDifference, {
                propsData: propsData,
                localVue,
                store
            });

            await wrapper.vm.handleReference("Gebiet");
            expect(wrapper.vm.savedReferenceData).to.deep.equal({});
            wrapper.destroy();
        });
    });
});
