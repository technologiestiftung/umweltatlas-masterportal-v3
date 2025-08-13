import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import PaginationControl from "../../../components/PaginationControl.vue";
import LightButton from "../../../../buttons/components/LightButton.vue";
import IconButton from "../../../../buttons/components/IconButton.vue";
import InputText from "../../../../inputs/components/InputText.vue";

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
            lightButtons = wrapper.findAllComponents(LightButton),
            activeButton = lightButtons.find(button => button.props("customclass") === "active");

        expect(activeButton).to.exist;
        expect(activeButton.props("text")).to.equal("2");
    });

    it("should have next and previous buttons", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages}
            }),
            iconButtons = wrapper.findAllComponents(IconButton),
            prevButton = iconButtons.find(button => button.props("icon") === "bi bi-chevron-left"),
            nextButton = iconButtons.find(button => button.props("icon") === "bi bi-chevron-right");

        expect(iconButtons.length).to.be.at.least(2);

        expect(prevButton).to.exist;
        expect(nextButton).to.exist;
    });

    it("should disable previous button on first page", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 1, totalPages}
            }),
            iconButtons = wrapper.findAllComponents(IconButton),
            prevButton = iconButtons.find(button => button.props("icon") === "bi bi-chevron-left");

        expect(prevButton).to.exist;
        expect(prevButton.props("disabled")).to.be.true;
    });

    it("should disable next button on last page", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: totalPages, totalPages}
            }),
            iconButtons = wrapper.findAllComponents(IconButton),
            nextButton = iconButtons.find(button => button.props("icon") === "bi bi-chevron-right");

        expect(nextButton).to.exist;
        expect(nextButton.props("disabled")).to.be.true;
    });

    it("should show 'Go to page' input when showGoToPage is true", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages, showGoToPage: true, goToPageText}
            }),
            goToPage = wrapper.find(".go-to-page"),
            inputText = wrapper.findComponent(InputText);

        expect(goToPage.exists()).to.be.true;
        expect(inputText.exists()).to.be.true;
    });

    it("should not show 'Go to page' input when showGoToPage is false", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages, showGoToPage: false}
            }),
            goToPage = wrapper.find(".go-to-page");

        expect(goToPage.exists()).to.be.false;
    });

    it("should emit page-change event when a page is clicked", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage, totalPages}
            }),
            lightButtons = wrapper.findAllComponents(LightButton),
            pageButton = lightButtons.find(button => button.props("text") === "1");

        expect(pageButton).to.exist;
        await pageButton.props("interaction")();
        expect(wrapper.emitted("page-change")).to.exist;
        expect(wrapper.emitted("page-change")[0][0]).to.equal(1);
    });

    it("should show dots for pagination when there are many pages", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 5, totalPages: 20}
            }),
            visiblePages = wrapper.vm.determineVisiblePages();

        expect(visiblePages).to.deep.equal([1, "...", 5, "...", 20]);
    });

    it("should handle Enter key on input field", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 2, totalPages: 10, showGoToPage: true}
            }),
            inputTextComponent = wrapper.findComponent(InputText),
            inputElement = inputTextComponent.find("input");

        wrapper.vm.tempPage = "5";
        await inputElement.trigger("keydown", {key: "Enter"});

        expect(wrapper.emitted("page-change")).to.exist;
        expect(wrapper.emitted("page-change")[0][0]).to.equal(5);
    });

    it("should validate numeric input through InputText component", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 2, totalPages: 10, showGoToPage: true}
            }),
            inputText = wrapper.findComponent(InputText);

        expect(inputText.exists()).to.be.true;
        expect(inputText.props("value")).to.equal("2");
        expect(inputText.props("placeholder")).to.equal("common:modules.pagination.input.placeholder");
        expect(inputText.props("type")).to.equal("text");
    });

    it("should show tooltip on input container", async () => {
        const wrapper = mount(PaginationControl, {
                props: {currentPage: 2, totalPages: 10, showGoToPage: true}
            }),
            inputContainer = wrapper.find(".input-container");

        expect(inputContainer.exists()).to.be.true;
        expect(inputContainer.attributes("title")).to.equal("common:modules.pagination.input.tooltip");
    });

    describe("validateAndChangePage method", () => {
        it("should emit page-change with valid page number", async () => {
            const wrapper = mount(PaginationControl, {
                props: {currentPage: 3, totalPages: 10}
            });

            wrapper.vm.tempPage = "5";
            await wrapper.vm.validateAndChangePage();

            expect(wrapper.emitted("page-change")).to.exist;
            expect(wrapper.emitted("page-change")[0][0]).to.equal(5);
            expect(wrapper.vm.tempPage).to.equal(5);
        });

        it("should handle NaN input and use current page", async () => {
            const wrapper = mount(PaginationControl, {
                props: {currentPage: 3, totalPages: 10}
            });

            wrapper.vm.tempPage = "abc";
            await wrapper.vm.validateAndChangePage();

            expect(wrapper.emitted("page-change")).to.exist;
            expect(wrapper.emitted("page-change")[0][0]).to.equal(3);
            expect(wrapper.vm.tempPage).to.equal(3);
        });

        it("should clamp page number to minimum of 1", async () => {
            const wrapper = mount(PaginationControl, {
                props: {currentPage: 3, totalPages: 10}
            });

            wrapper.vm.tempPage = "0";
            await wrapper.vm.validateAndChangePage();

            expect(wrapper.emitted("page-change")).to.exist;
            expect(wrapper.emitted("page-change")[0][0]).to.equal(1);
            expect(wrapper.vm.tempPage).to.equal(1);
        });

        it("should clamp page number to maximum of totalPages", async () => {
            const wrapper = mount(PaginationControl, {
                props: {currentPage: 3, totalPages: 10}
            });

            wrapper.vm.tempPage = "15";
            await wrapper.vm.validateAndChangePage();

            expect(wrapper.emitted("page-change")).to.exist;
            expect(wrapper.emitted("page-change")[0][0]).to.equal(10);
            expect(wrapper.vm.tempPage).to.equal(10);
        });

        it("should handle negative numbers and clamp to 1", async () => {
            const wrapper = mount(PaginationControl, {
                props: {currentPage: 3, totalPages: 10}
            });

            wrapper.vm.tempPage = "-5";
            await wrapper.vm.validateAndChangePage();

            expect(wrapper.emitted("page-change")).to.exist;
            expect(wrapper.emitted("page-change")[0][0]).to.equal(1);
            expect(wrapper.vm.tempPage).to.equal(1);
        });
    });

    describe("determineVisiblePages method", () => {
        it("should show all pages when totalPages <= 7", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 3, totalPages: 5}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, 2, 3, 4, 5]);
        });

        it("should show all pages when totalPages = 7", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 4, totalPages: 7}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, 2, 3, 4, 5, 6, 7]);
        });

        it("should show correct pages when currentPage <= 3", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 1, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, 2, 3, "...", 10]);
        });

        it("should show correct pages when currentPage = 3", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 3, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, 2, 3, "...", 10]);
        });

        it("should show correct pages when currentPage >= totalPages - 2", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 8, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 8, 9, 10]);
        });

        it("should show correct pages when currentPage = totalPages", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 10, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 8, 9, 10]);
        });

        it("should show correct pages for middle pages", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 5, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 5, "...", 10]);
        });

        it("should handle edge case with totalPages = 8 and currentPage = 4", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 4, totalPages: 8}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 4, "...", 8]);
        });

        it("should handle edge case with totalPages = 8 and currentPage = 6", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 6, totalPages: 8}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 6, 7, 8]);
        });
    });
});
