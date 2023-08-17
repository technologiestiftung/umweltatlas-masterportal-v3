import {expect} from "chai";
import Feature from "ol/Feature.js";
import InterfaceVectorTilesIntern from "../../../interfaces/interface.vectortiles.intern";
import sinon from "sinon";
import openlayerFunctions from "../../../utils/openlayerFunctions";
import store from "../../../../../../app-store";

describe("src/modules/tools/filter/interfaces/utils/interface.wfs.intern.js", () => {
    let interfaceVectorTilesIntern = null;

    beforeEach(() => {
        interfaceVectorTilesIntern = new InterfaceVectorTilesIntern(false, {
            getFeaturesByLayerId: false,
            isFeatureInMapExtent: false,
            isFeatureInGeometry: false
        });
    });
    describe("getAttrTypes", () => {
        it("should call onerror function, if layermodel doesn't exist", () => {
            const stubGetLayerByLayerId = sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(null),
                service = {layerId: 1},
                onsuccess = undefined,
                expectedError = new Error("InterfaceVectorTilesIntern.getAttrTypes: cannot find layer model for given layerId 1.");

            interfaceVectorTilesIntern.getAttrTypes(service, onsuccess, error => {
                expect(error).to.deep.equal(expectedError);
                expect(stubGetLayerByLayerId.called).to.be.true;
            });
            sinon.restore();
        });
        it("should call the onsuccess function and return an empty list if no features in current extent", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => []
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };
            interfaceVectorTilesIntern.getAttrTypes({}, attrTypes => {
                expect(attrTypes).to.deep.equal({});
            }, undefined);
            sinon.restore();
        });
        it("should call the onsuccess function with expected result", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => [
                                new Feature({foo: 10, fow: "wow"}),
                                new Feature({fof: "10", flw: "wow"}),
                                new Feature({fee: true, fuu: null})
                            ]
                        };
                    }
                }
            });
            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };
            const expected = {
                foo: "number",
                fow: "string",
                fof: "number",
                flw: "string",
                fee: "boolean",
                fuu: "string"
            };

            interfaceVectorTilesIntern.getAttrTypes({}, attrTypes => {
                expect(attrTypes).to.deep.equal(expected);
            }, undefined);
            sinon.restore();
        });
    });
    describe("getMinMax", () => {
        it("should call onerror function, if layermodel doesn't exist", () => {
            const stubGetLayerByLayerId = sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(null),
                service = {layerId: 1},
                attrName = "foo",
                onsuccess = undefined,
                expectedError = new Error("InterfaceVectorTilesIntern.getMinMax: cannot find layer model for given layerId 1.");

            interfaceVectorTilesIntern.getMinMax(service, attrName, onsuccess, error => {
                expect(error).to.deep.equal(expectedError);
                expect(stubGetLayerByLayerId.called).to.be.true;
            }, false, false);
            sinon.restore();
        });
        it("should call the onsuccess function with {min: false, max:false} param, if no features exists in current extent.", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => []
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expectedObj = {min: false, max: false};

            interfaceVectorTilesIntern.getMinMax(service, attrName, minMaxObj => {
                expect(minMaxObj).to.deep.equal(expectedObj);
            }, onerror, false, false);
            sinon.restore();
        });
        it("should call onsuccess with expected min max result", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => [
                                new Feature({foo: 10, fow: "wow"}),
                                new Feature({foo: 10, fow: "wow"}),
                                new Feature({foo: 30, fow: "wow"}),
                                new Feature({foo: 15, fow: "wow"})
                            ]
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expectedObj = {min: 10, max: 30};

            interfaceVectorTilesIntern.getMinMax(service, attrName, minMaxObj => {
                expect(minMaxObj).to.deep.equal(expectedObj);
            }, onerror, true, true);
            sinon.restore();
        });
    });
    describe("getUniqueValues", () => {
        it("should call onerror function, if layermodel doesn't exist", () => {
            const stubGetLayerByLayerId = sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(null),
                service = {layerId: 1},
                attrName = "foo",
                onsuccess = undefined,
                expectedError = new Error("InterfaceVectorTilesIntern.getUniqueValues: cannot find layer model for given layerId 1.");

            interfaceVectorTilesIntern.getUniqueValues(service, attrName, onsuccess, error => {
                expect(error).to.deep.equal(expectedError);
                expect(stubGetLayerByLayerId.called).to.be.true;
            });
            sinon.restore();
        });
        it("should call the onsuccess function, even if no features exists in current extent.", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => []
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expected = [];

            interfaceVectorTilesIntern.getUniqueValues(service, attrName, uniqueValues => {
                expect(uniqueValues).to.deep.equal(expected);
            }, onerror);
            sinon.restore();
        });
        it("should return unique values if features exists", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => [
                                new Feature({foo: "bar", fow: "wow"}),
                                new Feature({foo: "baz", fow: "wow"}),
                                new Feature({foo: "bar", fow: "wow"})
                            ]
                        };
                    }
                }
            });
            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expected = ["bar", "baz"];

            interfaceVectorTilesIntern.getUniqueValues(service, attrName, uniqueValues => {
                expect(uniqueValues).to.deep.equal(expected);
            }, onerror);
            sinon.restore();
        });
    });
    describe("filterGivenFeatures", () => {
        it("should start the filtering process and return the expected items", () => {
            const feature = new Feature({"foo": "bar"});

            interfaceVectorTilesIntern = new InterfaceVectorTilesIntern({
                startPagingInterval: (filterId, onsuccess) => {
                    onsuccess();
                },
                stopPagingInterval: sinon.stub()
            }, {
                getFeaturesByLayerId: false,
                isFeatureInMapExtent: false,
                isFeatureInGeometry: false
            });
            interfaceVectorTilesIntern.filterGivenFeatures([feature],
                0,
                0,
                {},
                {"snippetId": 0, "startup": false, "fixed": false, "attrName": "foo", "operator": "EQ", "value": ["bar"]},
                undefined,
                false,
                10000,
                () => {
                    expect({
                        service: {},
                        filterId: 0,
                        snippetId: 0,
                        paging: {
                            page: 1,
                            total: 1
                        },
                        items: [feature]
                    });
                });
            sinon.restore();
        });
    });
    describe("checkRules", () => {
        it("should return false the given feature is not valid", () => {
            expect(interfaceVectorTilesIntern.checkRules(undefined)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(null)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(1234)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules("string")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(true)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules([])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({})).to.be.false;
        });
        it("should return false if the given rules are not valid", () => {
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, undefined)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, null)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, 1234)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, "string")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, true)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, {})).to.be.false;
        });
        it("should return true if no rules are given", () => {
            expect(interfaceVectorTilesIntern.checkRules({get: v => v}, [])).to.be.true;
        });
        it("should return false if the rules do not match the attributes of the given feature", () => {
            const feature = {
                get: key => {
                    if (key === "foo") {
                        return 1;
                    }
                    else if (key === "bar") {
                        return "test";
                    }
                    else if (key === "baz") {
                        return 5;
                    }
                    return false;
                }
            };

            expect(interfaceVectorTilesIntern.checkRules(feature, [{attrName: "foo", operator: "EQ", value: 1}])).to.be.true;
            expect(interfaceVectorTilesIntern.checkRules(feature, [{attrName: "foo", operator: "EQ", value: 11}])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(feature, [{attrName: "bar", operator: "IN", value: "es"}])).to.be.true;
            expect(interfaceVectorTilesIntern.checkRules(feature, [{attrName: "bar", operator: "IN", value: "se"}])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(feature, [{attrName: "bar", operator: "IN", value: ["baz", "es"]}])).to.be.true;
            expect(interfaceVectorTilesIntern.checkRules(feature, [{attrName: "bar", operator: "IN", value: ["baz", "se"]}])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(feature, [
                {attrName: ["foo", "baz"], operator: "INTERSECTS", value: [4, 8]},
                {attrName: "bar", operator: "EQ", value: "test"}
            ])).to.be.true;
            expect(interfaceVectorTilesIntern.checkRules(feature, [
                {attrName: ["foo", "baz"], operator: "INTERSECTS", value: [4, 8]},
                {attrName: "bar", operator: "EQ", value: "foobar"}
            ])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRules(feature, [
                {attrName: ["foo", "baz"], operator: "INTERSECTS", value: [6, 8]},
                {attrName: "bar", operator: "EQ", value: "test"}
            ])).to.be.false;
        });
    });
    describe("checkRule", () => {
        it("should return false if anything but a valid rule object is given", () => {
            expect(interfaceVectorTilesIntern.checkRule("undefined")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule("null")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule(1234)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule("string")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule(true)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule(false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule([])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({})).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "OR"})).to.be.false;
        });
        it("should check the operator BETWEEN for a single number value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: -0.00001}, 0, 10)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: 0}, 0, 10)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: 10}, 0, 10)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: 10.00001}, 0, 10)).to.be.false;
        });
        it("should check the operator BETWEEN for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022", "03.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022", "02.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: "04.01.2022", format: "DD.MM.YYYY"}, "01.01.2022", "03.01.2022")).to.be.false;
        });
        it("should check the operator EQ for a single boolean value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: true}, true)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: false}, false)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: true}, false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: false}, true)).to.be.false;
        });
        it("should check the operator EQ for a single string value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: "string"}, "string")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: "string"}, "!string")).to.be.false;
        });
        it("should check the operator EQ for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: "01.02.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
        });
        it("should check the operator NE for a single boolean value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: true}, true)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: false}, false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: true}, false)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: false}, true)).to.be.true;
        });
        it("should check the operator NE for a single string value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: "string"}, "string")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: "string"}, "!string")).to.be.true;
        });
        it("should check the operator NE for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "NE", value: "01.02.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
        });
        it("should check the operator GT for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "GT", value: 4.9999}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GT", value: 5}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GT", value: 5.0001}, 5)).to.be.false;
        });
        it("should check the operator GT for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "GT", value: "01.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GT", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
        });
        it("should check the operator GE for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "GE", value: 4.9999}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GE", value: 5}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GE", value: 5.0001}, 5)).to.be.false;
        });
        it("should check the operator GE for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "GE", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GE", value: "01.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "GE", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
        });
        it("should check the operator LT for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "LT", value: 4.9999}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LT", value: 5}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LT", value: 5.0001}, 5)).to.be.true;
        });
        it("should check the operator LT for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "LT", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LT", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
        });
        it("should check the operator LE for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "LE", value: 4.9999}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LE", value: 5}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LE", value: 5.0001}, 5)).to.be.true;
        });
        it("should check the operator LE for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "LE", value: "01.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LE", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "LE", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
        });
        it("should check the operator IN for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: "bar"}, "foobarbaz")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: "bar"}, "foobaz")).to.be.false;
        });
        it("should check the operator STARTSWITH for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: "foo"}, "foobarbaz")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: "foo"}, "bazbarfoo")).to.be.false;
        });
        it("should check the operator ENDSWITH for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: "foo"}, "foobarbaz")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: "foo"}, "bazbarfoo")).to.be.true;
        });
        it("should check the operator INTERSECTS for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, -1, -0.000001)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, -1, 0)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, 10, 11)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, 10.000001, 11)).to.be.false;

            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, 1, 9)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, 0, 10)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "INTERSECTS", value: [0, 10]}, -1, 11)).to.be.true;
        });
        it("should check the operator BETWEEN for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, -1, -0.000001)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, -1, 0)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, 10, 11)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, 10.000001, 11)).to.be.false;

            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, 1, 9)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, 0, 10)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: [0, 10]}, -1, 11)).to.be.false;
        });
        it("should check the operator BETWEEN for multi date values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "31.11.2021", "02.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "02.01.2022", "05.01.2022")).to.be.true;
        });
        it("should check the operator EQ for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "foobar")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "foo")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "bar")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["foo", "bar", "baz"]}, "baz")).to.be.true;
        });
        it("should check the operator EQ for multi date values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "31.11.2021", "02.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "31.11.2021", "10.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "EQ", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "01.01.2022", "10.01.2022")).to.be.true;
        });
        it("should check the operator IN for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test qux test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test foo test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test bar test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: ["foo", "bar", "baz"]}, "test baz test")).to.be.true;
        });
        it("should check the operator STARTSWITH for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "qux test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "foo test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "bar test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "baz test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test foo")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test bar")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test baz")).to.be.false;
        });
        it("should check the operator ENDSWITH for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "qux test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "foo test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "bar test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "baz test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test foo")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test bar")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test baz")).to.be.true;
        });
        it("should be case insensitive", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: "FOO"}, "foo")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRule({operator: "IN", value: "bar"}, "BAR")).to.be.true;
        });
        it("should return false if featureValue is an array with length more than 2 but has only undefined", () => {
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: "FOO"}, [undefined, undefined, undefined])).to.be.false;
        });
        it("should return true if featureValue is an array with length more than 2 and has a matching rule", () => {
            sinon.stub(interfaceVectorTilesIntern, "checkRuleForAttrName").returns(true);
            expect(interfaceVectorTilesIntern.checkRule({operator: "BETWEEN", value: "FOO"}, [undefined, "foo", undefined])).to.be.true;
            sinon.restore();
        });
    });

    describe("checkRuleForAttrName", () => {
        it("should return false if anything but a valid rule object is given", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName("undefined")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName("null")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName(1234)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName("string")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName(true)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName(false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName([])).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({})).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "OR"})).to.be.false;
        });
        it("should check the operator BETWEEN for a single number value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: -0.00001}, 0)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: 0}, 0)).to.be.true;
        });
        it("should check the operator BETWEEN for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: "02.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.true;
        });
        it("should check the operator EQ for a single boolean value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: true}, true)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: false}, false)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: true}, false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: false}, true)).to.be.false;
        });
        it("should check the operator EQ for a single string value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: "string"}, "string")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: "string"}, "!string")).to.be.false;
        });
        it("should check the operator EQ for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: "01.02.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
        });
        it("should check the operator NE for a single boolean value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: true}, true)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: false}, false)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: true}, false)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: false}, true)).to.be.true;
        });
        it("should check the operator NE for a single string value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: "string"}, "string")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: "string"}, "!string")).to.be.true;
        });
        it("should check the operator NE for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "NE", value: "01.02.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
        });
        it("should check the operator GT for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GT", value: 4.9999}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GT", value: 5}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GT", value: 5.0001}, 5)).to.be.false;
        });
        it("should check the operator GT for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GT", value: "01.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GT", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
        });
        it("should check the operator GE for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GE", value: 4.9999}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GE", value: 5}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GE", value: 5.0001}, 5)).to.be.false;
        });
        it("should check the operator GE for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GE", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GE", value: "01.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "GE", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
        });
        it("should check the operator LT for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LT", value: 4.9999}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LT", value: 5}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LT", value: 5.0001}, 5)).to.be.true;
        });
        it("should check the operator LT for a single date value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LT", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LT", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
        });
        it("should check the operator LE for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LE", value: 4.9999}, 5)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LE", value: 5}, 5)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LE", value: 5.0001}, 5)).to.be.true;
        });
        it("should check the operator LE for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LE", value: "01.01.2022", format: "DD.MM.YYYY"}, "02.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LE", value: "01.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "LE", value: "02.01.2022", format: "DD.MM.YYYY"}, "01.01.2022")).to.be.true;
        });
        it("should check the operator IN for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: "bar"}, "foobarbaz")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: "bar"}, "foobaz")).to.be.false;
        });
        it("should check the operator STARTSWITH for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: "foo"}, "foobarbaz")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: "foo"}, "bazbarfoo")).to.be.false;
        });
        it("should check the operator ENDSWITH for a single value", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: "foo"}, "foobarbaz")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: "foo"}, "bazbarfoo")).to.be.true;
        });
        it("should check the operator INTERSECTS for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "INTERSECTS", value: [0, 10]}, -1)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "INTERSECTS", value: [0, 10]}, 0)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "INTERSECTS", value: [0, 10]}, 10)).to.be.true;

        });
        it("should check the operator BETWEEN for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: [0, 10]}, -1)).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: [0, 10]}, 0)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: [0, 10]}, 10)).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: [0, 10]}, 9)).to.be.true;
        });
        it("should check the operator BETWEEN for multi date values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "31.11.2021", "02.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "BETWEEN", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "02.01.2022", "05.01.2022")).to.be.true;
        });
        it("should check the operator EQ for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["foo", "bar", "baz"]}, "foobar")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["foo", "bar", "baz"]}, "foo")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["foo", "bar", "baz"]}, "bar")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["foo", "bar", "baz"]}, "baz")).to.be.true;
        });
        it("should check the operator EQ for multi date values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "31.11.2021", "02.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "31.11.2021", "10.01.2022")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "EQ", value: ["01.01.2022", "10.01.2022"], format: "DD.MM.YYYY"}, "01.01.2022", "10.01.2022")).to.be.true;
        });
        it("should check the operator IN for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: ["foo", "bar", "baz"]}, "test qux test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: ["foo", "bar", "baz"]}, "test foo test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: ["foo", "bar", "baz"]}, "test bar test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: ["foo", "bar", "baz"]}, "test baz test")).to.be.true;
        });
        it("should check the operator STARTSWITH for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "qux test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "foo test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "bar test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "baz test")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test foo")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test bar")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "STARTSWITH", value: ["foo", "bar", "baz"]}, "test baz")).to.be.false;
        });
        it("should check the operator ENDSWITH for multi values", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "qux test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "foo test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "bar test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "baz test")).to.be.false;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test foo")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test bar")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "ENDSWITH", value: ["foo", "bar", "baz"]}, "test baz")).to.be.true;
        });
        it("should be case insensitive", () => {
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: "FOO"}, "foo")).to.be.true;
            expect(interfaceVectorTilesIntern.checkRuleForAttrName({operator: "IN", value: "bar"}, "BAR")).to.be.true;
        });
    });
});
