import {expect} from "chai";
import Feature from "ol/Feature.js";
import InterfaceVectorTilesIntern from "../../../interfaces/interface.vectortiles.intern";
import sinon from "sinon";

describe("src/modules/tools/filter/interfaces/utils/interface.wfs.intern.js", () => {
    let interfaceVectorTilesIntern = null;

    beforeEach(() => {
        interfaceVectorTilesIntern = new InterfaceVectorTilesIntern(false, {
            getFeaturesByLayerId: false,
            isFeatureInMapExtent: false,
            isFeatureInGeometry: false
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
});
