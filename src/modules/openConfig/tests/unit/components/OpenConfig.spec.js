import {createStore} from "vuex";
import {config, shallowMount, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import OpenConfigComponent from "../../../components/OpenConfig.vue";
import FileUpload from "../../../../../shared/modules/inputs/components/FileUpload.vue";

config.global.mocks.$t = key => key;

describe.only("src/modules/openConfig/components/OpenConfig.vue", () => {
    let store,
        warn,
        wrapper;

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        OpenConfig: {
                            namespaced: true,
                            getters: {
                                icon: () => sinon.stub()
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the openConfig", () => {
        wrapper = shallowMount(OpenConfigComponent, {
            global: {
                plugins: [store],
                stubs: {
                    FileUpload: false
                }
            }
        });

        expect(wrapper.find("#open-config").exists()).to.be.true;
        expect(wrapper.find("p").exists()).to.be.true;
        expect(wrapper.find("#open-config-input-button").exists()).to.be.true;
        expect(wrapper.findComponent(FileUpload).exists()).to.be.true;
    });

    it("should trigger loadFile when file is selected", async () => {
        wrapper = shallowMount(OpenConfigComponent, {
            global: {
                plugins: [store]
            }
        });
        const loadFileSpy = sinon.spy(wrapper.vm, "loadFile");

        await wrapper.findComponent(FileUpload).vm.$emit("change", {target: {files: [{}]}});

        expect(loadFileSpy.calledOnce).to.be.true;
    });

    it("should trigger loadFile when file is dropped", async () => {
        wrapper = shallowMount(OpenConfigComponent, {
            global: {
                plugins: [store]
            }
        });
        const loadFileSpy = sinon.spy(wrapper.vm, "loadFile");

        await wrapper.findComponent(FileUpload).vm.$emit("drop", {target: {files: [{}]}});

        expect(loadFileSpy.calledOnce).to.be.true;
    });
});
