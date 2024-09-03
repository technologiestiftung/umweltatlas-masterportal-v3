import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import LayerInfoContactButton from "../../../components/LayerInfoContactButton.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerInfoContactButton.vue", () => {
    let store,
        pointOfContact,
        publisher,
        mainMenu;

    const propsData = {
        layerName: "Layer XYZ",
        previousComponent: "layerInformation"
    };

    beforeEach(() => {
        mainMenu = {
            currentComponent: "layerInformation",
            sections: [
                [
                    {
                        type: "layerInformation"
                    },
                    {
                        type: "contact"
                    }
                ]
            ]
        };
        store = createStore({
            namespaced: true,
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        LayerInformation: {
                            namespaced: true,
                            getters: {
                                layerInfo: () => ({"metaIdArray": [], "url": ["https://wms.example.org/", "https://wfs.example.org/?evil=1", "./local.geojson"], "typ": ["WMS", "WFS", "GeoJSON"], "layerNames": ["X-WMS", "X-WFS", ""]}),
                                pointOfContact: () => pointOfContact,
                                publisher: () => publisher
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        mainMenu: () => mainMenu,
                        secondaryMenu: () => {
                            return {
                                sections: [
                                    [
                                        {
                                            type: "section1"
                                        },
                                        {
                                            type: "section2"
                                        }
                                    ]
                                ]
                            };
                        }
                    }
                }
            }
        });
    });


    it("should show contact button", async () => {
        pointOfContact = {
            "name": "Behörde ABC",
            "positionName": ["Metadaten-Verantwortlicher"],
            "street": "XYZ Straße 99",
            "housenr": "",
            "postalCode": "D-12345",
            "city": "Hamburg",
            "email": "test@gv.hamburg.de",
            "country": "DEU"
        };
        publisher = "";

        const wrapper = mount(LayerInfoContactButton, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find(".openContactButton").exists()).to.be.true;
    });

    it("should not show contact button if no contact information is in the metadata", async () => {
        pointOfContact = "";
        publisher = "";

        const wrapper = mount(LayerInfoContactButton, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find(".openContactButton").exists()).to.be.false;
    });

    it("should not show contact button if contact module is not configured", async () => {
        pointOfContact = {
            "name": "Behörde ABC",
            "positionName": ["Metadaten-Verantwortlicher"],
            "street": "XYZ Straße 99",
            "housenr": "",
            "postalCode": "D-12345",
            "city": "Hamburg",
            "email": "test@gv.hamburg.de",
            "country": "DEU"
        };
        publisher = "";

        mainMenu = {
            currentComponent: "layerInformation",
            navigation: {
                currentComponent: {
                    type: "layerInformation",
                    props: {
                        name: "abc"
                    }
                }
            },
            sections: [
                [
                    {
                        type: "layerInformation"
                    },
                    {
                        type: "about"
                    }
                ]
            ]
        };

        const wrapper = mount(LayerInfoContactButton, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find(".openContactButton").exists()).to.be.false;
    });
});
