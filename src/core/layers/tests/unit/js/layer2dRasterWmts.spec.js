import {expect} from "chai";
import sinon from "sinon";

import Layer2dRasterWmts from "@core/layers/js/layer2dRasterWmts";

describe("src/core/js/layers/layer2dRasterWmts.js", () => {
    let attributes,
        fetch,
        warn;

    before(() => {
        fetch = global.fetch;
        global.fetch = sinon.spy(() => new Promise(r => r));

        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    beforeEach(() => {

        attributes = {
            id: "id",
            layers: "layer1,layer2",
            name: "wmtsTestLayer",
            optionsFromCapabilities: false,
            coordinateSystem: "EPSG:3857",
            typ: "WMTS",
            zIndex: 1,
            style: "default",
            version: "1.0.0",
            transparent: 10,
            format: "image/png",
            resLength: "10",
            "origin": [
                -20037508.3428,
                20037508.3428
            ]
        };

        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });

    after(() => {
        global.fetch = fetch;
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dRasterWmts with attributes should create an layer", () => {
            const wmtsLayer = new Layer2dRasterWmts(attributes);

            expect(wmtsLayer).not.to.be.undefined;
            expect(wmtsLayer.getLayer()).not.to.be.undefined;
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                id: "123456789",
                url: "test.url",
                typ: "wmst",
                format: "image/png",
                "origin": [
                    -20037508.3428,
                    20037508.3428
                ],
                style: "default",
                transparent: "10",
                coordinateSystem: "EPSG:3857",
                resLength: "10"
            };
        });

        it("should return the raw layer attributes", () => {
            const wmsLayer = new Layer2dRasterWmts(localAttributes);

            expect(wmsLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                id: "123456789",
                url: "test.url",
                typ: "wmst",
                format: "image/png",
                "origin": [
                    -20037508.3428,
                    20037508.3428
                ],
                style: "default",
                transparent: "10",
                coordinateSystem: "EPSG:3857",
                resLength: "10"
            });
        });
    });

    describe("getLayerParams", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                transparent: 90,
                zIndex: 1,
                coordinateSystem: "EPSG:3857",
                tileSize: "256",
                resLength: "10",
                layers: "exampleLayer",
                tileMatrixSet: "exampleMatrixSet",
                matrixSizes: [],
                scales: [],
                urls: ["https://example.com/wmts"],
                style: "default",
                format: "image/png",
                "origin": [
                    -20037508.3428,
                    20037508.3428
                ]
            };
        });

        it("should return the layer params", () => {
            const wmsLayer = new Layer2dRasterWmts(localAttributes);

            expect(wmsLayer.getLayerParams(localAttributes)).to.deep.equals({
                opacity: 0.1,
                zIndex: 1
            });
        });
    });

    describe("createLegend", () => {
        beforeEach(() => {
            attributes.version = "1.3.0";
            attributes.legend = true;
            attributes.style = "normal";
            attributes.format = "image/png";
        });

        it("createLegend with no optionsFromCapabilities does nothing", async () => {
            const layerWrapper = new Layer2dRasterWmts(attributes);

            expect(await layerWrapper.createLegend()).to.deep.equals([true]);
        });
    });
});
