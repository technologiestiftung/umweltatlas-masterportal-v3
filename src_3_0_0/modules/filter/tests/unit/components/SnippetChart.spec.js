import {shallowMount, config} from "@vue/test-utils";
import SnippetChart from "../../../components/SnippetChart.vue";
import {expect} from "chai";
import Feature from "ol/Feature";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/filter/components/SnippetChart.vue", () => {
    const chartConfig = {
        "type": "bar",
        "data": {
            "datasets": [{
                "data": [1, 2, 3],
                "featureAttributes": ["bar", "foo"]
            }],
            "labels": ["Eins", "Zwei", "Drei"]
        }
    };

    describe("Component DOM", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            expect(wrapper.vm.title).to.be.true;
            expect(wrapper.vm.api).to.be.null;
            expect(wrapper.vm.filteredItems).to.be.an("array");
            expect(wrapper.vm.chartConfig).to.be.an("object");
        });

        it("should not render the chart with default values", () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            expect(wrapper.isVisible()).to.be.false;
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.false;
        });

        it("should render the bar chart if visible is true", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig
                }
            });

            await wrapper.setData({
                isVisible: true
            });
            expect(wrapper.isVisible()).to.be.true;
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.true;
        });

        it("should not render a chart if the type is not 'bar'", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig: {
                        "type": "line",
                        "data": {
                            "datasets": [{
                                "data": [1, 2, 3]
                            }],
                            "labels": ["Eins", "Zwei", "Drei"]
                        }
                    }
                }
            });

            await wrapper.setData({
                isVisible: true
            });
            expect(wrapper.isVisible()).to.be.true;
            expect(wrapper.findComponent({name: "BarchartItem"}).exists()).to.be.false;
        });

    });

    describe("Watcher", () => {
        it("should set 'isVisible' to false if 'filterItems' change", async () => {
            const wrapper = shallowMount(SnippetChart, {
                props: {
                    chartConfig,
                    filteredItems: [1, 2, 3]
                },
                data () {
                    return {
                        isVisible: true
                    };
                }
            });

            await wrapper.setProps({
                filteredItems: []
            });
            expect(wrapper.vm.isVisible).to.be.false;
        });
    });

    describe("Methods", () => {
        describe("addChartData", () => {
            it("should sets the correct chart data and makes the component visible", () => {
                const wrapper = shallowMount(SnippetChart, {
                        props: {
                            chartConfig
                        }
                    }),
                    obj = {
                        items: [
                            new Feature({foo: "bar", bar: "foo"})
                        ]
                    };

                wrapper.vm.addChartData(obj);
                expect(wrapper.vm.chartConfig.data.datasets[0].data).to.deep.equal(["foo", "bar"]);
                expect(wrapper.vm.isVisible).to.be.true;
            });
        });
    });
});
