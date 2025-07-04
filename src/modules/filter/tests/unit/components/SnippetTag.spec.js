import {config, shallowMount} from "@vue/test-utils";
import SnippetTag from "@modules/filter/components/SnippetTag.vue";
import {expect} from "chai";

config.global.mocks.$t = key => key;

describe("src/modules/generalFilter/components/SnippetTag.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetTag, {});

            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.value).to.equal("");
        });
    });
    describe("removeTag", () => {
        it("should emit deleteRule", async () => {
            const wrapper = shallowMount(SnippetTag, {}),
                buttonClick = wrapper.find(".btn-tags");

            buttonClick.trigger("click");
            expect(wrapper.emitted().deleteRule).to.be.an("array").and.to.have.lengthOf(1);
        });
    });
});
