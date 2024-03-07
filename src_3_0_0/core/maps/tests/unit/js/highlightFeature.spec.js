import {expect} from "chai";
import sinon from "sinon";
import {Style, Fill, Stroke, Circle} from "ol/style.js";
import highlightFeature from "../../../js/highlightFeature";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import layerCollection from "../../../../layers/js/layerCollection";

describe("highlightFeature", () => {
    let featurePoint, featurePolygon, featureLine, stylePoint, styleGeoms, dispatch, commit;

    beforeEach(() => {
        const stroke = new Stroke({}),
            fill = new Fill({}),
            styleObject = {
                styleId: "defaultHighlightFeaturesPoint",
                rules: [{
                    style: {
                        type: "circle",
                        circleFillColor: [255, 255, 0, 0.9],
                        circleRadius: 8,
                        circleStrokeColor: [0, 0, 0, 1],
                        circleStrokeWidth: 2
                    }
                }]
            };

        stylePoint = new Style({
            image: new Circle({
                fill,
                stroke,
                radius: 5
            })
        });

        styleGeoms = new Style({
            stroke,
            fill
        });

        featurePoint = {
            getId: () => "testPoint",
            getGeometry: sinon.stub(),
            getStyle: sinon.stub().returns(stylePoint),
            setStyle: sinon.stub()
        };

        featurePolygon = {
            getId: () => "testPolygon",
            getGeometry: sinon.stub(),
            getStyle: sinon.stub().returns(styleGeoms),
            setStyle: sinon.stub()
        };

        featureLine = {
            getId: () => "testLine",
            getGeometry: sinon.stub(),
            getStyle: sinon.stub().returns(styleGeoms),
            setStyle: sinon.stub()
        };

        commit = sinon.spy();
        dispatch = sinon.spy();
        sinon.stub(createStyle, "createStyle").returns(styleGeoms);
        sinon.stub(styleList, "returnStyleObject").returns(styleObject);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("highlightPolygon", () => {
        it("should highlight a polygon feature with custom style", () => {
            const highlightObject = {
                type: "highlightPolygon",
                feature: featurePolygon,
                highlightStyle: styleGeoms,
                styleId: "styleId"
            };

            highlightFeature.highlightPolygon({commit, dispatch}, highlightObject);

            expect(highlightObject.feature.setStyle.called).to.be.true;
            expect(commit.calledWith("Maps/addHighlightedFeature", featurePolygon)).to.be.true;
            expect(commit.calledWith("Maps/addHighlightedFeatureStyle", styleGeoms)).to.be.true;
        });

        it("should place a polygon marker if no highlightStyle is provided", () => {
            const highlightObject = {
                type: "highlightPolygon",
                feature: featurePolygon,
                layer: {id: "layerId"}
            };

            createStyle.createStyle.returns(undefined);
            styleList.returnStyleObject.returns(undefined);
            highlightFeature.highlightPolygon({commit, dispatch}, highlightObject);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.calledWith("Maps/placingPolygonMarker", featurePolygon)).to.be.true;
        });
    });

    describe("highlightLine", () => {
        it("should highlight a line feature with custom style", () => {
            const highlightObject = {
                type: "highlightLine",
                feature: featureLine,
                highlightStyle: styleGeoms,
                styleId: "styleId"
            };

            highlightFeature.highlightLine({commit, dispatch}, highlightObject);

            expect(highlightObject.feature.setStyle.called).to.be.true;
            expect(commit.calledWith("Maps/addHighlightedFeature", featureLine)).to.be.true;
            expect(commit.calledWith("Maps/addHighlightedFeatureStyle", styleGeoms)).to.be.true;
        });

        it("should place a line marker if no highlightStyle is provided", () => {
            const highlightObject = {
                type: "highlightLine",
                feature: featureLine,
                layer: {id: "layerId"}
            };

            createStyle.createStyle.returns(undefined);
            styleList.returnStyleObject.returns(undefined);
            highlightFeature.highlightLine({commit, dispatch}, highlightObject);

            expect(dispatch.calledWith("Maps/placingPolygonMarker", featureLine)).to.be.true;
        });
    });
    describe("increaseFeature", () => {
        it("should increase the feature's icon size and commit changes", () => {
            const highlightObject = {
                    type: "increase",
                    feature: featurePoint,
                    scale: 2,
                    layer: {id: "layerId"}
                },
                clonedStyle = new Style({
                    image: new Circle({
                        stroke: new Stroke({}),
                        fill: new Fill({}),
                        radius: 5
                    })
                });

            createStyle.createStyle.returns(clonedStyle);
            styleList.returnStyleObject.returns(clonedStyle);

            highlightFeature.increaseFeature({commit}, highlightObject);

            sinon.assert.calledWith(commit, "Maps/addHighlightedFeature", sinon.match.same(featurePoint));
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeatureStyle", sinon.match.any);
        });
    });

    describe("highlightViaParametricUrl", () => {
        it("should dispatch 'Maps/placingPolygonMarker' with the found feature", async () => {
            const layerIdAndFeatureId = ["layerId", "featureId"],
                expectedFeature = featurePolygon;

            sinon.stub(layerCollection, "getLayerById").returns({
                layerSource: {
                    getFeatures: () => [expectedFeature],
                    getFeatureById: () => expectedFeature
                }
            });

            await highlightFeature.highlightViaParametricUrl({dispatch}, layerIdAndFeatureId);

            sinon.assert.calledWith(dispatch, "Maps/placingPolygonMarker", expectedFeature, {root: true});
        });

        it("should not dispatch 'Maps/placingPolygonMarker' if no feature is found", async () => {
            const layerIdAndFeatureId = ["layerId", "featureId"];

            await highlightFeature.highlightViaParametricUrl({dispatch}, layerIdAndFeatureId);

            sinon.assert.notCalled(dispatch);
        });
    });

    describe("highlightFeature", () => {
        describe("dispatch actions based on highlightObject type", () => {
            it("should dispatch 'increaseFeature' action for 'increase' type", () => {
                const highlightObject = {
                    type: "increase"
                };

                highlightFeature.highlightFeature({dispatch}, highlightObject);

                sinon.assert.calledWith(dispatch, "increaseFeature", highlightObject);
            });

            it("should dispatch 'highlightViaParametricUrl' action for 'viaLayerIdAndFeatureId' type", () => {
                const highlightObject = {
                    type: "viaLayerIdAndFeatureId",
                    layerIdAndFeatureId: ["layerId", "featureId"]
                };

                highlightFeature.highlightFeature({dispatch}, highlightObject);

                sinon.assert.calledWith(dispatch, "highlightViaParametricUrl", highlightObject.layerIdAndFeatureId);
            });

            it("should dispatch 'highlightPolygon' action for 'highlightPolygon' type", () => {
                const highlightObject = {
                    type: "highlightPolygon"
                };

                highlightFeature.highlightFeature({dispatch}, highlightObject);

                sinon.assert.calledWith(dispatch, "highlightPolygon", highlightObject);
            });

            it("should dispatch 'highlightLine' action for 'highlightLine' type", () => {
                const highlightObject = {
                    type: "highlightLine"
                };

                highlightFeature.highlightFeature({dispatch}, highlightObject);

                sinon.assert.calledWith(dispatch, "highlightLine", highlightObject);
            });

            it("should warn for unrecognized highlight type", () => {
                const highlightObject = {
                        type: "unrecognizedType"
                    },

                    consoleWarnSpy = sinon.spy(console, "warn");

                highlightFeature.highlightFeature({dispatch}, highlightObject);

                sinon.assert.calledWith(consoleWarnSpy, `Unrecognized highlight type: ${highlightObject.type}`);

                consoleWarnSpy.restore();
            });
        });
    });
});
