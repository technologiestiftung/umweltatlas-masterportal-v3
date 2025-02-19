import {shallowMount, config} from "@vue/test-utils";
import {expect} from "chai";
import ChartJs from "chart.js/auto";
import {nextTick} from "vue";
import PiechartItem from "../../../components/PiechartItem.vue";

config.global.mocks.$t = key => key;

describe("src/share-components/charts/components/PiechartItem.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(PiechartItem, {
            propsData: {
                data: {
                    labels: [],
                    datasets: []
                },
                givenOptions: {}
            }
        });
    });

    describe("mounted", () => {
        it("should create an instance of ChartJS when mounted", () => {
            nextTick(() => {
                expect(wrapper.vm.chart).to.be.an.instanceof(ChartJs);
            });
        });
        it("should create a chart of type pie when mounted", () => {
            nextTick(() => {
                expect(wrapper.vm.chart.config.type).to.equal("pie");
            });
        });
        it("should create a canvas element in its component", () => {
            nextTick(() => {
                expect(wrapper.find("canvas").exists()).to.be.true;
            });
        });
    });
    describe("mounted as doughnut", () => {
        const doughnut = shallowMount(PiechartItem, {
            propsData: {
                data: {
                    labels: [],
                    datasets: []
                },
                givenOptions: {},
                diagramType: "doughnut"
            }
        });

        it("should create an instance of ChartJS when mounted", () => {
            nextTick(() => {
                expect(wrapper.vm.chart).to.be.an.instanceof(ChartJs);
            });
        });
        it("should create a chart of type pie when mounted", () => {
            nextTick(() => {
                expect(doughnut.vm.chart.config.type).to.equal("doughnut");
            });
        });
        it("should create a canvas element in its component", () => {
            expect(doughnut.find("canvas").exists()).to.be.true;
        });
    });
    describe("resetChart", () => {
        it("should destroy the former chart and create a new one", () => {
            let destroyCalled = false;

            nextTick(() => {
                wrapper.vm.chart.destroy = () => {
                    destroyCalled = true;
                };
                wrapper.vm.resetChart({});

                expect(destroyCalled).to.be.true;
            });
        });
    });
    describe("getChartJsOptions", () => {
        it("should return an empty object in case everything is fishy", () => {
            expect(wrapper.vm.getChartJsOptions(undefined, undefined)).to.be.an("object").and.to.be.empty;
            expect(wrapper.vm.getChartJsOptions(null, null)).to.be.an("object").and.to.be.empty;
            expect(wrapper.vm.getChartJsOptions("string", "string")).to.be.an("object").and.to.be.empty;
            expect(wrapper.vm.getChartJsOptions(123, 123)).to.be.an("object").and.to.be.empty;
            expect(wrapper.vm.getChartJsOptions(true, true)).to.be.an("object").and.to.be.empty;
            expect(wrapper.vm.getChartJsOptions(false, false)).to.be.an("object").and.to.be.empty;
        });
        it("should return the first param in case the second param is not an object", () => {
            const obj = {test: true};

            expect(wrapper.vm.getChartJsOptions(obj, undefined)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(obj, null)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(obj, "string")).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(obj, 123)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(obj, true)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(obj, false)).to.deep.equal(obj);
        });
        it("should return the second param in case the first param is not an object", () => {
            const obj = {test: true};

            expect(wrapper.vm.getChartJsOptions(undefined, obj)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(null, obj)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions("string", obj)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(123, obj)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(true, obj)).to.deep.equal(obj);
            expect(wrapper.vm.getChartJsOptions(false, obj)).to.deep.equal(obj);
        });
        it("should deep assign the given params", () => {
            const objA = {
                    test: {
                        a: 1,
                        b: 2
                    }
                },
                objB = {
                    test: {
                        b: 3,
                        d: 4
                    },
                    e: 5
                },
                expected = {
                    test: {
                        a: 1,
                        b: 3,
                        d: 4
                    },
                    e: 5
                };

            expect(wrapper.vm.getChartJsOptions(objA, objB)).to.deep.equal(expected);
        });
    });
});
