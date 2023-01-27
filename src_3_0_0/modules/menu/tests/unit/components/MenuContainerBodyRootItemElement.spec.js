import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import MenuContainerBodyRootItemElement from "../../../components/MenuContainerBodyRootItemElement.vue";
import {expect} from "chai";
import LightButton from "../../../../../shared/modules/buttons/components/LightButton.vue";

config.global.mocks.$t = key => key;

describe.skip("src_3_0_0/modules/menu/MenuContainerBodyRootItemElement.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                tree: {
                    type: "light"
                }
            }
        };
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => "2D"
                    }
                }
            },
            getters: {
                deviceMode: () => "Desktop",
                portalConfig: () => mockConfigJson.Portalconfig
            }
        });
    });

    it("renders the component and it contains the SimpleButton", () => {
        const wrapper = shallowMount(MenuContainerBodyRootItemElement, {
            global: {
                plugins: [store]
            },
            propsData: {icon: "bi-file-plus", name: "awesomeName", properties: {}}
        });

        expect(wrapper.findComponent(LightButton).exists()).to.be.true;
    });
});