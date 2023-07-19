import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsGfi.js";


describe("src/modules/tools/gfi/store/actions/actionsGfi.js", () => {
    before(() => {
        mapCollection.clear();

        const map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return {
                    primitives: {
                        show: true,
                        contains: () => true,
                        add: sinon.stub()
                    }
                };
            }
        };

        mapCollection.addMap(map3D, "3D");
        global.Cesium = {};
        global.Cesium.ScreenSpaceEventHandler = function () {
            return {
                setInputAction: () => sinon.stub(),
                destroy: () => sinon.stub()
            };
        };
        global.Cesium.ScreenSpaceEventType = {
            LEFT_CLICK: sinon.stub()
        };
        global.Cesium.Color = {
            RED: () => sinon.stub()
        };
        sinon.stub(console, "warn");
    });
    describe("updateClick: Listener for click on the map", () => {
        it("commits setGfiFeatures and start collectGfiFeatures", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy();

            actions.updateClick({commit, dispatch});
            expect(commit.calledOnce).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("MapMarker/removePolygonMarker");
            expect(dispatch.secondCall.args[0]).to.equal("collectGfiFeatures");
        });
    });
    describe("test 3D Highlighting", () => {
        it("console warns if color is not array or string", () => {
            const dispatch = sinon.spy(),
                getters = {
                    "coloredHighlighting3D": {
                        "color": {}
                    }
                };

            actions.highlight3DTile({getters, dispatch});
            expect(console.warn.called).to.be.true;
            expect(console.warn.calledWith("The color for the 3D highlighting is not valid. Please check the config or documentation.")).to.be.true;
        });
        it("dispatch removeHighlightColor", () => {
            const dispatch = sinon.spy();

            actions.removeHighlight3DTile({dispatch});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("removeHighlightColor");
        });
    });
});
