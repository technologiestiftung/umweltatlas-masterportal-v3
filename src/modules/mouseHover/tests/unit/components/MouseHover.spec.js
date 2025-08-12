import {createStore} from "vuex";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import MouseHoverComponent from "@modules/mouseHover/components/MouseHover.vue";
import MouseHover from "@modules/mouseHover/store/indexMouseHover";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/mouseHover/components/MouseHover.vue", () => {
    const mockMapGetters = {
        ol2DMap: sinon.stub()
    };
    let store,
        wrapper;

    beforeEach(() => {
        MouseHover.actions = {
            ...MouseHover.actions,
            initialize: sinon.stub()
        };
        MouseHover.mutations = {
            ...MouseHover.mutations,
            setActive: sinon.stub()
        };
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        MouseHover: {
                            namespaced: true,
                            state: {
                                active: true
                            },
                            getters: {
                                active: state => state.active,
                                infoBox: () => null,
                                configPaths: () => [],
                                type: () => "default"
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            },
            getters: {
                mobile: () => false
            },
            actions: {
                initializeModule: sinon.stub()
            }
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    it("renders mouseHover module", () => {
        wrapper = shallowMount(MouseHoverComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#mousehover-overlay").exists()).to.be.true;
    });
});
