import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import * as searchAddress from "@masterportal/masterportalapi/src/searchAddress";
import {fetchRoutingGazetteerGeosearch} from "../../../../utils/geosearch/routing-gazetteer-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-locationFinder-geosearch.js", () => {
    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingLocationFinderGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(searchAddress, "search").returns(
                new Promise((resolve) => resolve([
                    {
                        geometry: {
                            type: "Point",
                            coordinates: [511114.73, 5397800.69]
                        },
                        name: "Gottschalkring 1"
                    },
                    {
                        geometry: {
                            type: "Point",
                            coordinates: [515643.21, 5404093.73]
                        },
                        name: "An der Marienanlage 11"
                    }
                ])
                )
            );

            const result = await fetchRoutingGazetteerGeosearch(
                    "testsearch"
                ),
                expectedResult = [new RoutingGeosearchResult(
                    [511114.73, 5397800.69],
                    "Gottschalkring 1",
                    "25832"
                ),
                new RoutingGeosearchResult(
                    [515643.21, 5404093.73],
                    "An der Marienanlage 11",
                    "25832"
                )
                ];

            expect(result).deep.to.eql(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(searchAddress, "search").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                })
                )
            );

            try {
                await fetchRoutingGazetteerGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
});
