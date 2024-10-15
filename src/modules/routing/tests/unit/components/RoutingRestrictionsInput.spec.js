import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, mount} from "@vue/test-utils";
import RoutingRestrictionsInputComponent from "../../../components/RoutingRestrictionsInput.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/routing/components/RoutingRestrictionsInput.vue", () => {
    let store,
        wrapper,

        routingRestrictionsInputData = {
            length: 10.0,
            width: 2.4,
            height: 2.8,
            weight: 18,
            axleload: 6,
            hazmat: false
        },
        isochronesRestrictionsInputData = {
            length: 10.0,
            width: 2.4,
            height: 2.8,
            weight: 18,
            axleload: 6,
            hazmat: false
        };

    beforeEach(() => {
        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing: {
                            namespaced: true,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    getters: {
                                        routingRestrictionsInputData: () => routingRestrictionsInputData
                                    }
                                },
                                Isochrones: {
                                    namespaced: true,
                                    getters: {
                                        isochronesRestrictionsInputData: () => isochronesRestrictionsInputData
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should render restrictionsInput", () => {

        wrapper = mount(RoutingRestrictionsInputComponent, {
            global: {
                plugins: [store]
            },
            attachTo: document.body
        });
        expect(wrapper.find("#routing-restrictions").exists()).to.be.true;
    });

    it("should validate input (exceeding maximum of length)", async () => {

        routingRestrictionsInputData = {
            length: 31.0,
            width: 2.4,
            height: 2.8,
            weight: 18,
            axleload: 6,
            hazmat: false
        };

        const inputData = sinon.stub(RoutingRestrictionsInputComponent.methods, "inputData");


        inputData.returns(routingRestrictionsInputData);
        wrapper = mount(RoutingRestrictionsInputComponent, {
            global: {
                plugins: [store]
            },
            propsData: {
                moduleName: "Directions"
            },
            attachTo: document.body
        });

        wrapper.vm.validateInput("length", 0, 30);
        expect(routingRestrictionsInputData.length).to.equal(30);
    });
    it("should validate input (exceeding minimum of width)", async () => {

        isochronesRestrictionsInputData = {
            length: 30.0,
            width: -1.0,
            height: 2.8,
            weight: 18,
            axleload: 6,
            hazmat: false
        };

        const inputData = sinon.stub(RoutingRestrictionsInputComponent.methods, "inputData");


        inputData.returns(isochronesRestrictionsInputData);
        wrapper = mount(RoutingRestrictionsInputComponent, {
            global: {
                plugins: [store]
            },
            propsData: {
                moduleName: "Isochrones"
            },
            attachTo: document.body
        });

        wrapper.vm.validateInput("width", 0, 3.5);
        expect(isochronesRestrictionsInputData.width).to.equal(0);
    });
});
