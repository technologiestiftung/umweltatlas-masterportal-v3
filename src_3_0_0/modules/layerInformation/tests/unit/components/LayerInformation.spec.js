import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import LayerInformationComponent from "../../../components/LayerInformation.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/layerInformation/components/LayerInformation.vue", () => {
    let store,
        legendAvailable,
        downloadLinks;

    beforeEach(() => {
        downloadLinks = null;
        legendAvailable = true;
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
                            mutations: {
                                setMetaDataCatalogueId: () => sinon.stub()
                            },
                            getters: {
                                customText: () => sinon.stub(),
                                title: () => "",
                                layerInfo: () => ({"metaIdArray": [], "url": ["https://wms.example.org/", "https://wfs.example.org/?evil=1", "./local.geojson"], "typ": ["WMS", "WFS", "GeoJSON"], "layerNames": ["X-WMS", "X-WFS", ""]}),
                                datePublication: () => null,
                                downloadLinks: () => downloadLinks,
                                periodicityKey: () => null,
                                abstractText: () => "Test",
                                noMetadataLoaded: () => "",
                                metaURLs: () => [],
                                currentLayerName: () => "",
                                legendAvailable: () => legendAvailable,
                                showUrlGlobal: () => true
                            },
                            actions: {
                                setConfigParams: () => sinon.stub()
                            }
                        },
                        Legend: {
                            namespaced: true,
                            getters: {
                                layerInfoLegend: sinon.stub()
                            },
                            actions: {
                                createLegendForLayerInfo: sinon.stub()
                            }
                        }
                    }
                }
            },
            getters: {
                configJs: () => sinon.stub()
            }
        });

        location = {href: "https://self.example.org/portal/"};
    });


    it("should have an existing title", () => {
        const wrapper = mount(LayerInformationComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".subtitle")).to.exist;
    });

    it("should have a close button, active tab is 'layerinfo-legend'", async () => {
        downloadLinks = ["https://download.com"];
        const wrapper = mount(LayerInformationComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.vm.activeTab).to.be.equals("layerinfo-legend");
        expect(wrapper.find(".bi-x-lg")).to.exist;
        expect(wrapper.find("#layerinfo-legend")).to.exist;
        expect(wrapper.findAll("li > a")[0].attributes().href).to.be.equals("#layerinfo-legend");
    });

    it("if legendAvailable is false: 'LayerInfoDataDownload' is active tab", async () => {
        legendAvailable = false;
        downloadLinks = ["https://download.com"];
        const wrapper = mount(LayerInformationComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAll("#layerinfo-legend").length).to.be.equals(0);
        expect(wrapper.vm.activeTab).to.be.equals("LayerInfoDataDownload");
        expect(wrapper.findAll("li > a")[0].attributes().href).to.be.equals("#LayerInfoDataDownload");
    });

    it("should check if dropdown for group layer to not exists", async () => {
        const wrapper = mount(LayerInformationComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#changeLayerInfo").exists()).to.be.false;
    });

    it("should generate correct urls", async () => {
        const wrapper = mount(LayerInformationComponent, {
                global: {
                    plugins: [store]
                }
            }),
            links = wrapper.findAll("div > ul > li > a");

        expect(links.length).to.be.equals(3);
        links.forEach(link => {
            expect(link.attributes("href")).to.include("https://wms.example.org/?SERVICE=WMS&REQUEST=GetCapabilities");
            expect(link.attributes("href")).to.include("https://wfs.example.org/?evil=1&SERVICE=WFS&REQUEST=GetCapabilities");
            expect(link.attributes("href")).to.include("https://self.example.org/portal/local.geojson?SERVICE=GeoJSON&REQUEST=GetCapabilities");
        });
    });
});
