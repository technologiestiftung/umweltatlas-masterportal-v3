import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import PaginationControl from "../../../components/PaginationControl.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/pagination/components/PaginationControl.vue", () => {

    const currentPage = 2,
        totalPages = 10,
        goToPageText = "Go to page";

    it("should render a pagination control", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages}
            }),
            paginationControls = wrapper.find(".pagination-controls");

        expect(paginationControls.exists()).to.be.true;
    });

    it("should display the correct current page", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages}
            }),
            activeButton = wrapper.find(".pagination-button.active");

        expect(activeButton.exists()).to.be.true;
        expect(activeButton.text()).to.equal("2");
    });

    it("should have next and previous buttons", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages}
            }),
            buttons = wrapper.findAll("button.pagination-arrow"),
            prevButton = buttons.length > 0 ? buttons[0] : null,
            nextButton = buttons.length > 1 ? buttons[buttons.length - 1] : null;

        expect(buttons.length).to.be.at.least(2);
        expect(prevButton).to.not.be.null;
        expect(nextButton).to.not.be.null;
    });

    it("should disable previous button on first page", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 1, totalPages}
            }),
            buttons = wrapper.findAll("button.pagination-arrow"),
            prevButton = buttons.length > 0 ? buttons[0] : null;

        expect(prevButton).to.not.be.null;
        expect(prevButton.attributes("disabled")).to.equal("");
    });

    it("should disable next button on last page", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: totalPages, totalPages}
            }),
            buttons = wrapper.findAll("button.pagination-arrow"),
            nextButton = buttons.length > 1 ? buttons[buttons.length - 1] : null;

        expect(nextButton).to.not.be.null;
        expect(nextButton.attributes("disabled")).to.equal("");
    });

    it("should show 'Go to page' input when showGoToPage is true", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages, showGoToPage: true, goToPageText}
            }),
            goToPage = wrapper.find(".go-to-page");

        expect(goToPage.exists()).to.be.true;
    });

    it("should not show 'Go to page' input when showGoToPage is false", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages, showGoToPage: false}
            }),
            goToPage = wrapper.find(".go-to-page");

        expect(goToPage.exists()).to.be.false;
    });

    it("should display the go to page text", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages, showGoToPage: true, goToPageText}
            }),
            goToButton = wrapper.find(".go-button");

        expect(goToButton.text()).to.equal(goToPageText);
    });

    it("should emit page-change event when a page is clicked", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages}
            }),
            pageButton = wrapper.find(".pagination-button:nth-child(2)"); // Second button

        await pageButton.trigger("click");
        expect(wrapper.emitted("page-change")).to.exist;
        expect(wrapper.emitted("page-change")[0][0]).to.exist;
    });

    it("should show dots for pagination when there are many pages", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 5, totalPages: 20}
            }),
            dots = wrapper.findAll(".pagination-button[disabled]");

        expect(dots.length).to.be.at.least(1);
    });
});
