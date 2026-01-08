import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import UrlInput from "../../../components/UrlInput.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/urlInput/components/UrlInput.vue", () => {

    it("should render an UrlInput", async () => {
        const wrapper = mount(UrlInput, {
                props: {layerUrl: "id"}
            }),
            input = wrapper.find(".ua-url-input");

        expect(input.exists()).to.be.true;
    });

});
