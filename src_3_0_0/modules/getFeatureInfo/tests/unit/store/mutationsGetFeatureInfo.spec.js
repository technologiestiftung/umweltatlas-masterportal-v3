import {expect} from "chai";
import mutations from "../../../store/mutationsGetFeatureInfo";

describe("src_3_0_0/modules/getFeatureInfo/store/mutationsGetFeatureInfo.js", () => {
    describe("removeGfiFeatureByLayerId", () => {
        it("removes a gfiFeature by a given layer id", () => {
            const state = {
                gfiFeatures: [
                    {getLayerId: () => "1"},
                    {getLayerId: () => "2"},
                    {getLayerId: () => "3"}
                ]
            };

            mutations.removeGfiFeatureByLayerId(state, "2");
            expect(state.gfiFeatures.length).to.equal(2);
        });
    });
});
