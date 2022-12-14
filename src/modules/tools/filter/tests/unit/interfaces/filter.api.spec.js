import {expect} from "chai";
import sinon from "sinon";
import FilterApi from "../../../interfaces/filter.api";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import olFunctions from "../../../utils/openlayerFunctions";

describe.only("src/modules/tools/filter/interfaces/filter.api.js", () => {

    describe("setServiceByLayerModel", () => {
        let layerId, layerModel, sourceLayerList, onerror;

        before(() => {
            sinon.stub(rawLayerList, "getLayerWhere").callsFake((obj) => {
                return sourceLayerList?.find(rawLayer => rawLayer.id === obj.id);
            });
        });

        beforeEach(() => {
            onerror = (error) => console.error(error);
        });

        afterEach(() => {
            sinon.restore();
        });

        it("should set service based on source layer if WebGL layer provided", () => {
            layerId = "webgl";
            layerModel = {
                get: (key) => {
                    switch (key) {
                        case "typ":
                            return "WebGL";
                        case "sourceId":
                            return "123";
                        default:
                            return undefined;
                    }
                }
            };
            sourceLayerList = [{
                id: "123",
                typ: "WFS",
                featureNS: "namespace/xyz",
                url: "www.abc.xyz",
                featureType: "feature-type"
            }];

            sinon.stub(olFunctions, "getMapProjection").returns("EPSG:25832");

            const filterApi = new FilterApi();

            filterApi.setServiceByLayerModel(layerId, layerModel, true, onerror);
            expect(filterApi.service).to.deep.equal({
                type: "wfs",
                extern: true,
                layerId: "webgl",
                url: "www.abc.xyz",
                featureNS: "namespace",
                featurePrefix: "xyz",
                featureTypes: ["feature-type"]
            });
        });
        it("should use original WebGL layer no source layer provided", () => {
            layerId = "webgl";
            layerModel = {
                get: (key) => {
                    switch (key) {
                        case "typ":
                            return "WebGL";
                        case "sourceId":
                            return "GeoJSON";
                        case "url":
                            return "www.foo.bar";
                        default:
                            return undefined;
                    }
                }
            };
            sourceLayerList = [{
                id: "123",
                typ: "WFS",
                featureNS: "namespace/xyz",
                url: "www.abc.xyz",
                featureType: "feature-type"
            }];

            const filterApi = new FilterApi();

            filterApi.setServiceByLayerModel(layerId, layerModel, false, onerror);
            expect(filterApi.service).to.deep.equal({
                type: "geojson",
                extern: false,
                layerId: "webgl",
                url: "www.foo.bar"
            });
        });
    });
});
