import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
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

    describe("onlyAllowNumbers method", () => {
        it("should allow numeric characters", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 1, totalPages: 10}
                }),
                event = {
                    charCode: 49, // ASCII code for '1'
                    preventDefault: () => {
                        // Empty function for testing
                    }
                },
                preventDefaultSpy = sinon.spy(event, "preventDefault");

            wrapper.vm.onlyAllowNumbers(event);

            expect(preventDefaultSpy.called).to.be.false;
        });

        it("should prevent non-numeric characters", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 1, totalPages: 10}
                }),
                event = {
                    charCode: 65, // ASCII code for 'A'
                    preventDefault: () => {
                        // Empty function for testing
                    }
                },
                preventDefaultSpy = sinon.spy(event, "preventDefault");

            wrapper.vm.onlyAllowNumbers(event);

            expect(preventDefaultSpy.called).to.be.true;
        });

        it("should prevent special characters", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 1, totalPages: 10}
                }),
                event = {
                    charCode: 33, // ASCII code for '!'
                    preventDefault: () => {
                        // Empty function for testing
                    }
                },
                preventDefaultSpy = sinon.spy(event, "preventDefault");

            wrapper.vm.onlyAllowNumbers(event);

            expect(preventDefaultSpy.called).to.be.true;
        });

        it("should allow all digits 0-9", () => {
            const wrapper = mount(PaginationControl, {
                props: {currentPage: 1, totalPages: 10}
            });

            // Test all digits 0-9
            for (let i = 48; i <= 57; i++) { // ASCII codes 48-57 are digits 0-9
                const event = {
                        charCode: i,
                        preventDefault: () => {
                            // Empty function for testing
                        }
                    },
                    preventDefaultSpy = sinon.spy(event, "preventDefault");

                wrapper.vm.onlyAllowNumbers(event);

                expect(preventDefaultSpy.called).to.be.false;
            }
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

        it("should show correct pages when currentPage <= 2", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 1, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, 2, "...", 10]);
        });

        it("should show correct pages when currentPage = 2", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 2, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, 2, "...", 10]);
        });

        it("should show correct pages when currentPage > totalPages - 2", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 9, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 9, 10]);
        });

        it("should show correct pages when currentPage = totalPages", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 10, totalPages: 10}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 9, 10]);
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

        it("should handle edge case with totalPages = 8 and currentPage = 7", () => {
            const wrapper = mount(PaginationControl, {
                    props: {currentPage: 7, totalPages: 8}
                }),
                visiblePages = wrapper.vm.determineVisiblePages();

            expect(visiblePages).to.deep.equal([1, "...", 7, 8]);
        });
    });
});
