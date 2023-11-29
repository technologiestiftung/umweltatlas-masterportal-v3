import {expect} from "chai";
import sinon from "sinon";
import Layer3dTileset from "../../../js/layer3dTileset";

describe("src_3_0_0/core/js/layers/layer3dTileset.js", () => {
    let attributes,
        fromUrlSpy,
        warn;

    before(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    beforeEach(() => {
        attributes = {
            id: "id",
            name: "tilesetLayer",
            url: "the_url",
            typ: "TileSet3D",
            cesium3DTilesetOptions: {
                maximumScreenSpaceError: 6
            }
        };

        mapCollection.clear();

        global.Cesium = {};
        global.Cesium.Cesium3DTileset = () => { /* no content*/ };
        global.Cesium.Cesium3DTileset.fromUrl = () => sinon.stub();

        fromUrlSpy = sinon.spy(global.Cesium.Cesium3DTileset, "fromUrl");
    });

    afterEach(() => {
        sinon.restore();
        global.Cesium = null;
    });

    describe("createLayer", () => {
        let checkLayer;

        before(() => {
            /**
             * Checks the layer for attributes content.
             * @param {Object} layer the layer
             * @param {Object} terrainLayer the terrainLayer
             * @param {Object} attrs the attributes
             * @param {function} done to be called at the end of test
             * @returns {void}
             */
            checkLayer = (layer, terrainLayer, attrs, done) => {
                expect(layer).not.to.be.undefined;
                expect(terrainLayer.get("name")).to.be.equals(attrs.name);
                expect(terrainLayer.get("id")).to.be.equals(attrs.id);
                expect(terrainLayer.get("typ")).to.be.equals(attrs.typ);
                layer.tileset.then(tileset => {
                    expect(tileset.layerReferenceId).to.be.equals(attrs.id);
                    done();
                });
            };
        });

        it("new Layer3dTileset should create an layer with warning", () => {
            const layer3dTileset = new Layer3dTileset(attributes);

            expect(layer3dTileset).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("createLayer shall create a tileset layer", function (done) {
            const layer3dTileset = new Layer3dTileset(attributes),
                layer = layer3dTileset.getLayer();

            expect(fromUrlSpy.calledOnce).to.equal(true);
            checkLayer(layer, layer3dTileset, attributes, done);
        });

        it("createLayer shall create a visible tileset layer", function (done) {
            Object.assign(attributes, {visibility: true});

            const layer3dTileset = new Layer3dTileset(attributes),
                layer = layer3dTileset.getLayer();

            expect(layer3dTileset.get("visibility")).to.equal(true);
            expect(fromUrlSpy.calledOnce).to.equal(true);
            expect(fromUrlSpy.calledWithMatch("the_url/tileset.json", {maximumScreenSpaceError: 6})).to.equal(true);
            checkLayer(layer, layer3dTileset, attributes, done);
        });
    });
});
