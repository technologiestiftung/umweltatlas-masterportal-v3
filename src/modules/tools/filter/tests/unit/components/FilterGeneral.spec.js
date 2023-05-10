import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import FilterGeneral from "../../../components/FilterGeneral.vue";
import FilterStore from "../../../store/indexFilter";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("src/modules/tools/filter/components/FilterGeneral.vue", () => {
    let wrapper;

    const layers = [
            {
                title: "layerOne",
                layerId: "1234"
            },
            {
                title: "layerTwo",
                layerId: "4321"
            },
            {
                title: "layerThree",
                layerId: "5678"
            }
        ],
        groups = [{layers, title: "groupOne"}, {layers, title: "groupTwo"}],
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Filter: FilterStore
                    }
                }
            }
        });

    beforeEach(() => {
        wrapper = shallowMount(FilterGeneral, {
            localVue,
            store
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });
    // selectedLayerGroups
    it("should exist", async () => {
        wrapper.vm.setActive(true);
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-general-filter").exists()).to.be.true;
    });

    it("should render two accordions if two layer groups are present and layerSelectorVisible is true", async () => {
        wrapper.vm.setActive(true);
        wrapper.vm.setLayerGroups(groups);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll(".accordion-collapse").exists()).to.be.true;
        expect(wrapper.findAll(".accordion-collapse")).to.have.lengthOf(2);
    });

    it("should render no accordions if layer groups are present and layerSelectorVisible is false", async () => {
        wrapper.vm.setActive(true);
        wrapper.vm.setLayerSelectorVisible(false);
        await wrapper.setData({
            layerConfigs: {
                groups,
                layers
            },
            preparedLayerGroups: groups
        });

        expect(wrapper.findAll(".accordion-collapse").exists()).to.be.false;
    });

    it("should render and open one accordion if its selected", async () => {
        wrapper.vm.setActive(true);
        wrapper.vm.setLayerGroups(groups);
        wrapper.vm.setLayerSelectorVisible(true);
        await wrapper.setData({
            selectedLayerGroups: [0]
        });

        expect(wrapper.findAll(".show").exists()).to.be.true;
        expect(wrapper.findAll(".show")).to.have.lengthOf(1);
    });
    describe("updateSelectedAccordions", () => {
        it("should add filterIds to selectedAccordion", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: true
                }
            });

            const expected = [
                {
                    filterId: 0,
                    layerId: "1234"
                }
            ];

            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal(expected);
        });
        it("should remove filterIds from selectedAccordion", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: true
                }
            });
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal([]);
        });
        it("should add filterIds to selectedAccordion if multiLayerSelector is false", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: false
                }
            });

            const expected = [
                {
                    filterId: 0,
                    layerId: "1234"
                }
            ];

            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal(expected);
        });
        it("should remove filterIds from selectedAccordion if multiLayerSelector is false", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: false
                }
            });
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal([]);
        });
        it("should not change the rule when adding and removing the filterId of selectedAccordion", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: true
                }
            });
            const rule = [
                {
                    snippetId: 0,
                    startup: false,
                    fixed: false,
                    attrName: "test",
                    operator: "EQ",
                    value: ["Altona"]
                }
            ];

            wrapper.vm.setRulesOfFilters({
                rulesOfFilters: rule
            });
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.rulesOfFilters).to.deep.equal(rule);
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.rulesOfFilters).to.deep.equal(rule);
        });
    });
});
