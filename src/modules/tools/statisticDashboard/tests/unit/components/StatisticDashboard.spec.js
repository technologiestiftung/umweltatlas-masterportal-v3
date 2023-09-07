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
        describe("getTimestepsMerged", () => {
            it("should return an empty array if first param and second param are not objects", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    localVue,
                    store
                });

                expect(wrapper.vm.getTimestepsMerged(undefined, undefined)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(null, null)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged([], [])).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(true, true)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(false, false)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged(1234, 1234)).to.be.an("array").that.is.empty;
                expect(wrapper.vm.getTimestepsMerged("1234", "1234")).to.be.an("array").that.is.empty;
            });
            it("should return an empty array if second param is not an object but first is", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                    localVue,
                    store
                });

                expect(wrapper.vm.getTimestepsMerged({foo: "bar"})).to.be.an("array").that.is.empty;
            });
            it("should return only the values of the second param as array", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        localVue,
                        store
                    }),
                    uniqueList = {foo: true, bar: true},
                    expected = [{value: "foo", label: "foo"}, {value: "bar", label: "bar"}];

                expect(wrapper.vm.getTimestepsMerged(undefined, uniqueList)).to.deep.equal(expected);
            });
            it("should return a merged array based of the given two objects", () => {
                const wrapper = shallowMount(StatisticDashboard, {
                        localVue,
                        store
                    }),
                    uniqueList = {bar: true, buz: true, foo: true},
                    configSteps = {2: "Last 2 Years"},
                    expected = [{value: "bar", label: "bar"}, {value: "buz", label: "buz"}, {value: "foo", label: "foo"}, {value: ["buz", "foo"], label: "Last 2 Years"}];

                expect(wrapper.vm.getTimestepsMerged(configSteps, uniqueList)).to.deep.equal(expected);
            });
        });
    });
});
