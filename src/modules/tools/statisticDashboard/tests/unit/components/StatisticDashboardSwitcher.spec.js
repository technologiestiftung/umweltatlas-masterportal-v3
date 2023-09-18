import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import StatisticDashboardSwitcher from "../../../components/StatisticDashboardSwitcher.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/src/tools/statiscticDashboard/components/StatisticDashboardSwitcher.vue", () => {
    const buttons = [{
        name: "Button1",
        icon: "bi bi-table"
    },
    {
        name: "Button2"
    }];

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup"
                },
                localVue
            });

            expect(wrapper.exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render buttongroup", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup"
                },
                localVue
            });

            expect(wrapper.find(".btn-group").exists()).to.be.true;
            wrapper.destroy();
        });
        it("should render two buttons if two button names were given", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup"
                },
                localVue
            });

            expect(wrapper.findAll(".btn")).lengthOf(2);
            wrapper.destroy();
        });
        it("should render icon if icon class was given", () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                propsData: {
                    buttons,
                    group: "buttongroup"
                },
                localVue
            });

            expect(wrapper.find(".bi-table").exists()).to.be.true;
            wrapper.destroy();
        });
    });
    describe("User Interaction", () => {
        it("should emit 'showView' if the user click on first button", async () => {
            const wrapper = shallowMount(StatisticDashboardSwitcher, {
                    propsData: {
                        buttons,
                        group: "buttongroup"
                    },
                    localVue
                }),
                button1 = wrapper.findAll(".btn").at(0);

            await button1.trigger("click");
            expect(wrapper.emitted()).to.have.all.keys("showView");
            expect(wrapper.emitted().showView).deep.to.equal([["Button1"]]);
            wrapper.destroy();
        });
    });
});
