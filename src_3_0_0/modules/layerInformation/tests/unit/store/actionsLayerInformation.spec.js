import {expect} from "chai";
import sinon from "sinon";
import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsLayerInformation";

const {startLayerInformation, additionalSingleLayerInfo, setMetadataURL} = actions;

describe("src_3_0_0/modules/layerInformation/store/actionsLayerInformation.js", () => {
    let getters = {},
        rootGetters,
        commit,
        dispatch;

    beforeEach(() => {
        dispatch = sinon.spy();
        commit = sinon.spy();
    });

    describe("initialize the store", () => {
        let layerConf,
            menuExpanded,
            isMobile;

        beforeEach(() => {
            isMobile = false;
            menuExpanded = true;
            layerConf = {
                id: "123",
                metaID: "layerMetaId",
                layername: "name",
                url: "google.de",
                urlIsVisible: true,
                datasets: [
                    {
                        md_id: "123",
                        md_name: "MDName"
                    }
                ]
            };

            rootGetters = {
                "Modules/Legend/layerInfoLegend": {
                    id: "123"
                },
                isMobile: () => isMobile,
                "Menu/expanded": () => menuExpanded
            };

        });
        it("should initialize the LayerInformation", () => {
            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("setLayerInfo");
            expect(commit.secondCall.args[1]).to.be.deep.equals(layerConf);


            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: layerConf.datasets[0].md_name}
            });
            expect(dispatch.secondCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.secondCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.thirdCall.args[0]).to.equal("additionalSingleLayerInfo");
        });
        it("should initialize the LayerInformation and create legend", () => {
            layerConf.legendURL = "https://legend.de";
            layerConf.id = "another";

            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("Modules/Legend/setLayerInfoLegend");
            expect(commit.secondCall.args[1]).to.be.deep.equals({});
            expect(commit.thirdCall.args[0]).to.equal("setLayerInfo");
            expect(commit.thirdCall.args[1]).to.be.deep.equals(layerConf);


            expect(dispatch.callCount).to.be.equals(4);
            expect(dispatch.firstCall.args[0]).to.equal("Modules/Legend/createLegendForLayerInfo");
            expect(dispatch.firstCall.args[1]).to.equal(layerConf.id);

            expect(dispatch.secondCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: layerConf.datasets[0].md_name}
            });
            expect(dispatch.thirdCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.thirdCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.getCall(3).args[0]).to.equal("additionalSingleLayerInfo");
        });

        it("should toggle the LayerInformation in menu if mobile", () => {
            isMobile = true;
            menuExpanded = false;
            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("setLayerInfo");
            expect(commit.secondCall.args[1]).to.be.deep.equals(layerConf);

            expect(dispatch.callCount).to.be.equals(4);
            expect(dispatch.firstCall.args[0]).to.equal("Menu/toggleMenu");
            expect(dispatch.firstCall.args[1]).to.equal("mainMenu");

            expect(dispatch.secondCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: layerConf.datasets[0].md_name}
            });
            expect(dispatch.thirdCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.thirdCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.getCall(3).args[0]).to.equal("additionalSingleLayerInfo");
        });

        it("should initialize the other abstract layer infos", done => {
            const state = {
                layerInfo: {
                    cswUrl: "https://metaver.de/csw",
                    metaID: "73A344E9-CDB5-4A17-89C1-05E202989755"
                }
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done
            testAction(additionalSingleLayerInfo, null, state, {}, [
                {type: "getAbstractInfo", payload: {attributes: state.layerInfo.attributes, metaId: state.layerInfo.metaID, cswUrl: state.layerInfo.cswUrl, customMetadata: state.layerInfo.customMetadata}, dispatch: true}
            ], {}, done);

        });

        it("should set the Meta Data URLs", done => {
            const metaId = "73A344E9-CDB5-4A17-89C1-05E202989755",
                state = {
                    layerInfo: {
                        "id": "123",
                        "metaID": "layerMetaId",
                        "layername": "name",
                        "url": "google.de",
                        "urlIsVisible": true
                    },
                    metaDataCatalogueId: "2"
                },
                metaURLs = ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"];

            testAction(setMetadataURL, metaId, state, {}, [
                {type: "setMetaURLs", payload: metaURLs}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });

        });

        it("should use showDocUrl if set", done => {
            const state = {
                layerInfo: {
                    "id": "123",
                    "metaID": "73A344E9-CDB5-4A17-89C1-05E202989755",
                    "layername": "name",
                    "url": "google.de",
                    "urlIsVisible": true,
                    "cswUrl": "https://metaver.de/csw",
                    "showDocUrl": "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
                },
                metaDataCatalogueId: "2"
            };

            testAction(setMetadataURL, "73A344E9-CDB5-4A17-89C1-05E202989755", state, {}, [
                {type: "setMetaURLs", payload: ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"]}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });

        });

        it("should use the url from metaDataCatalogueId if showDocUrl is not set", done => {
            const state = {
                    layerInfo: {
                        "id": "123",
                        "metaID": "73A344E9-CDB5-4A17-89C1-05E202989755",
                        "layername": "name",
                        "url": "google.de",
                        "urlIsVisible": true,
                        "cswUrl": "https://metaver.de/csw"
                    },
                    metaDataCatalogueId: "2"
                },
                metaURLs = ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"];

            testAction(setMetadataURL, "73A344E9-CDB5-4A17-89C1-05E202989755", state, {}, [
                {type: "setMetaURLs", payload: metaURLs}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });
        });

    });

    describe("restoreFromUrlParams", () => {
        let attributes,
            layerConfig;

        beforeEach(() => {
            attributes = {
                layerInfo: {
                    id: "layerId"
                }
            };
            layerConfig = {
                id: "layerId",
                name: "name"
            };
            getters = {
                type: "layerInformation"
            };
            rootGetters = {
                layerConfigById: () => layerConfig,
                styleListLoaded: true
            };
        });

        it("styleListLoaded = true, start layer info", () => {
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/updateComponentState");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({type: "LayerInformation", attributes});
            expect(dispatch.secondCall.args[0]).to.equal("Modules/LayerInformation/startLayerInformation");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(layerConfig);
        });
        it("styleListLoaded = false, wait and start layer info", () => {
            rootGetters.styleListLoaded = false;
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/updateComponentState");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({type: "LayerInformation", attributes});
            expect(dispatch.secondCall.args[0]).to.equal("waitAndRestoreLayerInformation");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(layerConfig);
        });


    });
});
