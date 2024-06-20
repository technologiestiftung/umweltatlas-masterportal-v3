import getVisibleLayer from "../../../js/getVisibleLayer";
import {expect} from "chai";
import sinon from "sinon";
import store from "../../../../../app-store";

describe.only("src/modules/print/utils/getVisibleLayer", function () {
    let layers;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getLayers: () => {
                return {
                    getArray: () => {
                        return layers
                    }
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        layers = [];
        store.getters = {
            "Maps/getResolutionByScale": () => 100,
            "Modules/Print/currentScale": 5
        };
    });

    afterEach(() => {       
        sinon.restore();
    });

    describe("getVisibleLayer", function () {
        it("getVisibleLayer return empty array", function () {           
            getVisibleLayer();

            expect(result.length).to.be.equal(0);
        });
        it("getVisibleLayer return visible layer - no groups", function () {
            const layer1 = {
                id: "1",
                getVisible: () => true,
                getMaxResolution: () => 1000,
                get: () => "no_markerPoint"
            },
            layer2 = {
                id: "2",
                getVisible: () => true,
                getMaxResolution: () => 1000,
                get: () => "no_markerPoint"
            }
            layers.push(layer1);
            layers.push(layer2);
            const result = getVisibleLayer();

            expect(result.length).to.be.equal(2);
        });
    });

});
