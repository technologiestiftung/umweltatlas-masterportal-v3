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
            fill = new Fill({});

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
            setStyle: sinon.stub(),
            get: () => [{getId: () => "testPoint"}]
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

        commit = sinon.stub();
        dispatch = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
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

    describe("highlightPolygon", () => {
        it("should highlight a polygon feature with custom style", async () => {
            const highlightObject = {
                type: "highlightPolygon",
                feature: featurePolygon,
                highlightStyle: styleGeoms,
                styleId: "styleId"
            };

            dispatch = sinon.stub().resolves(styleGeoms);

            await highlightFeature.highlightPolygon({commit, dispatch}, highlightObject);

            sinon.assert.calledWith(featurePolygon.setStyle, sinon.match.instanceOf(Style));
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeature", featurePolygon);
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeatureStyle", sinon.match.instanceOf(Style));
            sinon.assert.calledWith(dispatch, "fetchAndApplyStyle", sinon.match({
                highlightObject: highlightObject,
                feature: featurePolygon
            }));
        });

        it("should place a polygon marker if no highlightStyle is provided", async () => {
            const highlightObject = {
                type: "highlightPolygon",
                feature: featurePolygon,
                layer: {id: "layerId"}
            };

            dispatch = sinon.stub().resolves(null);

            dispatch.withArgs("fetchAndApplyStyle", sinon.match.any).resolves(null);

            await highlightFeature.highlightPolygon({commit, dispatch}, highlightObject);

            sinon.assert.calledWith(dispatch, "Maps/placingPolygonMarker", featurePolygon, {root: true});
        });
    });


    describe("highlightLine", () => {
        it("should highlight a line feature with custom style", async () => {
            const highlightObject = {
                type: "highlightLine",
                feature: featureLine,
                highlightStyle: styleGeoms,
                styleId: "styleId"
            };

            dispatch = sinon.stub().resolves(styleGeoms);

            await highlightFeature.highlightLine({commit, dispatch}, highlightObject);

            sinon.assert.calledWith(featureLine.setStyle, sinon.match.instanceOf(Style));
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeature", featureLine);
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeatureStyle", sinon.match.instanceOf(Style));
            sinon.assert.calledWith(dispatch, "fetchAndApplyStyle", sinon.match({
                highlightObject: highlightObject,
                feature: featureLine
            }));
        });

        it("should place a line marker if no highlightStyle is provided", async () => {
            const highlightObject = {
                type: "highlightLine",
                feature: featureLine,
                layer: {id: "layerId"}
            };

            dispatch = sinon.stub().resolves(null);

            dispatch.withArgs("fetchAndApplyStyle", sinon.match.any).resolves(null);

            await highlightFeature.highlightLine({commit, dispatch}, highlightObject);

            sinon.assert.calledWith(dispatch, "Maps/placingPolygonMarker", featureLine, {root: true});
        });
    });

    describe("increaseFeature", () => {
        it("should increase the feature's icon size and commit changes", async () => {
            const highlightObject = {
                    type: "increase",
                    feature: featurePoint,
                    scale: 2,
                    layer: {id: "layerId"}
                },

                mockedStyle = new Style({
                    image: new Circle({
                        radius: 10,
                        fill: new Fill({color: "red"}),
                        stroke: new Stroke({color: "black", width: 2})
                    })
                });

            mockedStyle.clone = sinon.stub().returns(mockedStyle);

            dispatch.withArgs("fetchAndApplyStyle", sinon.match.any).resolves(mockedStyle);

            await highlightFeature.increaseFeature({commit, dispatch}, highlightObject);

            sinon.assert.called(mockedStyle.clone);
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeature", featurePoint);
            sinon.assert.calledWith(commit, "Maps/addHighlightedFeatureStyle", sinon.match.any);
            sinon.assert.calledWith(dispatch, "fetchAndApplyStyle", sinon.match.any);
            sinon.assert.called(mockedStyle.clone);
        });
    });


    describe("highlightViaParametricUrl", () => {
        it("should dispatch 'Maps/placingPolygonMarker' with the found feature", async () => {
            const layerIdAndFeatureId = ["layerId", "featureId"],
                expectedFeature = featurePolygon;

            dispatch.callsFake((action, payload) => {
                if (action === "getHighlightFeature" && payload.layerId === layerIdAndFeatureId[0] && payload.featureId === layerIdAndFeatureId[1]) {
                    return Promise.resolve(expectedFeature);
                }
                return Promise.resolve();
            });

            await highlightFeature.highlightViaParametricUrl({dispatch}, layerIdAndFeatureId);

            sinon.assert.calledWith(dispatch, "Maps/placingPolygonMarker", expectedFeature, {root: true});
        });

        it("should not dispatch 'Maps/placingPolygonMarker' if no feature is found", async () => {
            const layerIdAndFeatureId = ["layerId", "featureId"];

            dispatch.callsFake((action, payload) => {
                if (action === "getHighlightFeature" && payload.layerId === layerIdAndFeatureId[0] && payload.featureId === layerIdAndFeatureId[1]) {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve();
            });

            await highlightFeature.highlightViaParametricUrl({dispatch}, layerIdAndFeatureId);

            sinon.assert.neverCalledWith(dispatch, "Maps/placingPolygonMarker", sinon.match.any, {root: true});
        });
    });

    describe("getHighlightFeature", () => {
        let layerSourceStub, layerStub;

        beforeEach(() => {
            layerSourceStub = {
                getFeatures: sinon.stub().returns([featurePoint]),
                getFeatureById: sinon.stub(),
                once: sinon.stub()
            };
            layerStub = {layerSource: layerSourceStub};
            sinon.stub(layerCollection, "getLayerById").returns(layerStub);
        });

        it("should retrieve a feature directly if available", async () => {
            const featureId = "testPoint",
                layerId = "layerId",
                expectedFeature = featurePoint,
                result = await highlightFeature.getHighlightFeature({}, {layerId, featureId});

            layerSourceStub.getFeatures.returns([expectedFeature]);
            layerSourceStub.getFeatureById.withArgs(featureId).returns(expectedFeature);

            expect(result).to.equal(expectedFeature);
        });

        it("should wait for 'featuresloadend' event if features are not yet loaded", async () => {
            const featureId = "testPoint",
                layerId = "layerId",
                expectedFeature = featurePoint,
                result = await highlightFeature.getHighlightFeature({}, {layerId, featureId});

            layerSourceStub.getFeatures.returns([]);
            layerSourceStub.once.callsFake((event, callback) => {
                if (event === "featuresloadend") {
                    setTimeout(() => {
                        layerSourceStub.getFeatureById.withArgs(featureId).returns(expectedFeature);
                        callback();
                    }, 100);
                }
            });

            expect(result).to.equal(expectedFeature);
        });
    });

    describe("fetchAndApplyStyle", () => {
        beforeEach(() => {
            sinon.stub(styleList, "returnStyleObject");
            sinon.stub(createStyle, "createStyle");
        });

        it("should fetch and apply the correct style", async () => {
            styleList.returnStyleObject.returns(true);
            createStyle.createStyle.returns(featurePoint.getStyle());

            const highlightObject = {styleId: "customStyle", layer: {id: "layerId"}},
                feature = featurePoint,
                expectedStyle = featurePoint.getStyle(),
                returnFirst = true,
                result = await highlightFeature.fetchAndApplyStyle({commit, dispatch}, {highlightObject, feature, returnFirst});

            expect(result).to.equal(expectedStyle);
            sinon.assert.calledWith(styleList.returnStyleObject, highlightObject.styleId);
            sinon.assert.calledWith(createStyle.createStyle, sinon.match.any, feature, false, Config.wfsImgPath);
        });

        it("should return null and log a warning if style is not found", async () => {
            styleList.returnStyleObject.returns(undefined);

            const highlightObject = {styleId: "nonexistentStyle", layer: {id: "layerId"}},
                feature = featurePoint,
                consoleWarnSpy = sinon.spy(console, "warn"),
                result = await highlightFeature.fetchAndApplyStyle({commit, dispatch}, {highlightObject, feature});

            expect(result).to.be.null;
            sinon.assert.calledWith(consoleWarnSpy, `Style not found for styleId: ${highlightObject.styleId}`);

            consoleWarnSpy.restore();
        });
    });
});
