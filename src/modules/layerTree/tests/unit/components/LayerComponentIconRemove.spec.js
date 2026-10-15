import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import LayerComponentIconRemove from "@modules/layerTree/components/LayerComponentIconRemove.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerComponentIconRemove.vue", () => {
    let layer,
        propsData,
        removeLayerSpy,
        store,
        wrapper;

    beforeEach(() => {
        layer = {
            id: "1",
            name: "layer",
            typ: "WMS"
        };

        propsData = {
            layerConf: layer
        };

        removeLayerSpy = sinon.spy();

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        LayerTree: {
                            namespaced: true,
                            actions: {
                                removeLayer: removeLayerSpy
                            }
                        }
                    }
                }
            }
        });

        wrapper = shallowMount(LayerComponentIconRemove, {
            global: {
                plugins: [store]
            },
            propsData: propsData
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the remove icon given as property to the component", () => {
        expect(wrapper.find("#layer-component-icon-remove-" + propsData.layerConf.id).exists()).to.be.true;
    });

    it("dispatches removeLayer with the layer configuration", () => {
        wrapper.vm.removeLayer(layer);

        expect(removeLayerSpy.calledOnce).to.be.true;
        expect(removeLayerSpy.firstCall.args[1]).to.deep.equal(layer);
    });
});
