import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardLegend from "../../../components/StatisticDashboardLegend.vue";
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
                        StatisticDashboard: {
                            namespaced: true,
                            mutations: {
                                setClassificationMode: (state, options) => {
                                    state.classificationMode = options;
                                },
                                setAllowPositiveNegativeClasses: (state, options) => {
                                    state.allowPositiveNegativeClasses = options;
                                }
                            },
                            getters: {
                                classificationMode: (state) => state.classificationMode,
                                allowPositiveNegativeClasses: (state) => state.allowPositiveNegativeClasses
                            }
                        }
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
        it("should render color palette input", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#custom-color-palette").exists()).to.be.true;
        });
        it("should render value ranges if classification is 'benutzerdefiniert'", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setClassificationMode("benutzerdefiniert");
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#value-ranges").exists()).to.be.true;
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

            wrapper.vm.setClassificationMode("benutzerdefiniert");
            await wrapper.setData({selectNumberOfClasses: 5});

            expect(wrapper.findAll("#value-ranges").length).to.equal(5);
        });
    });
    describe("Allow positive negative checkbox", () => {
        it("should show correct default status according to store", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setAllowPositiveNegativeClasses(true);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#allowPosNegMix").element.checked).to.equal(true);

            wrapper.vm.setAllowPositiveNegativeClasses(false);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#allowPosNegMix").element.checked).to.equal(false);
        });
        it("should change value in store correctly when clicked", async () => {
            const wrapper = shallowMount(StatisticDashboardLegend, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.setAllowPositiveNegativeClasses(false);

            await wrapper.find("#allowPosNegMix").setValue(true);
            await wrapper.find("#allowPosNegMix").trigger("change");

            expect(wrapper.vm.allowPositiveNegativeClasses).to.equal(true);
        });
    });
});
