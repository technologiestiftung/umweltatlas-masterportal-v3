import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import StatisticDashboard from "../../../components/StatisticDashboard.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";
import fetchData from "../../../utils/fetchData";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("/src/modules/tools/StatisticDashboard.vue", () => {
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
    });

    describe("methods", () => {
        describe("getCategoriesFromStatisticAttributes", () => {
            it("should return an empty array if given param is not an object", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    localVue,
                    store
                });

                expect(wrapper.vm.getCategoriesFromStatisticAttributes(undefined)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getCategoriesFromStatisticAttributes([])).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getCategoriesFromStatisticAttributes(null)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getCategoriesFromStatisticAttributes("1234")).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getCategoriesFromStatisticAttributes(1234)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getCategoriesFromStatisticAttributes(true)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getCategoriesFromStatisticAttributes(false)).to.be.an("array").that.is.empty;
            });
            it("should return an empty array if child objects has no category attribute", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        localVue,
                        store
                    }),
                    attributes = {
                        foo: "bar",
                        fow: {
                            bow: "vow"
                        }
                    };

                expect(wrapper.vm.getCategoriesFromStatisticAttributes(attributes)).to.be.an("array").that.is.empty;
            });
            it("should return an array with strings", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        localVue,
                        store
                    }),
                    attributes = {
                        foo: {
                            category: "FOO"
                        },
                        fow: {
                            category: "BAR"
                        }
                    },
                    expected = ["FOO", "BAR"];

                expect(wrapper.vm.getCategoriesFromStatisticAttributes(attributes)).to.deep.equal(expected);
            });
        });
        describe("getUniqueValuesForLevel", () => {
            it("should return an empty object if first parm is not an object", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    localVue,
                    store
                });

                expect(await wrapper.vm.getUniqueValuesForLevel(undefined)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel([])).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(null)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(true)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(false)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel(1234)).to.be.an("object").that.is.empty;
                expect(await wrapper.vm.getUniqueValuesForLevel("1234")).to.be.an("object").that.is.empty;
            });
            it("should return an empty object if first param has no child object called mappingFilter", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    localVue,
                    store
                });

                expect(await wrapper.vm.getUniqueValuesForLevel({})).to.be.an("object").that.is.empty;
            });
            it("should return an empty object if first param has a child object but not expected structure", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    localVue,
                    store
                });

                expect(await wrapper.vm.getUniqueValuesForLevel({
                    mappingFilter: {}
                })).to.be.an("object").that.is.empty;
            });
            it("should call expected function with expected params", async () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        localVue,
                        store
                    }),
                    layerId = "1234",
                    attrNames = [
                        "fooBAR",
                        "fowWaw"
                    ];

                sinon.stub(fetchData, "getUniqueValues");
                await wrapper.vm.getUniqueValuesForLevel({
                    layerId,
                    mappingFilter: {
                        timeAttribute: {
                            attrName: "fooBAR"
                        },
                        regionNameAttribute: {
                            attrName: "fowWaw"
                        }
                    }
                });

                expect(fetchData.getUniqueValues.calledWith(layerId, attrNames, undefined, undefined)).to.be.true;
                sinon.restore();
            });
        });
    });
});
