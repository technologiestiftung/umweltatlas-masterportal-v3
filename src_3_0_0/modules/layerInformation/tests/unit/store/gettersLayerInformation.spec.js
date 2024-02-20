import {expect} from "chai";
import getters from "../../../store/gettersLayerInformation";

describe("src_3_0_0/modules/layerInformation/store/gettersLayerInformation.js", () => {

    it("urlParams", () => {
        const state = {
                layerInfo: {
                    id: "id"
                }},
            urlParamsState = getters.urlParams(state);

        expect(urlParamsState).to.be.an("object");
        expect(urlParamsState.layerInfo).to.be.an("object");
        expect(urlParamsState.layerInfo.id).to.be.equals("id");
    });

});
