<script>
import IconButton from "../../buttons/components/IconButton.vue";
import LightButton from "../../buttons/components/LightButton.vue";

export default {
    name: "PaginationControl",
    components: {
        IconButton,
        LightButton
    },
    props: {
        /**
         * The current active page
         */
        currentPage: {
            type: Number,
            required: true
        },
        /**
         * The total number of pages
         */
        totalPages: {
            type: Number,
            required: true
        },
        /**
         * Whether to show "Go to page" input
         */
        showGoToPage: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            tempPage: this.currentPage
        };
    },
    watch: {
        /**
         * Watch for changes to currentPage prop and update tempPage
         */
        currentPage (newValue) {
            this.tempPage = newValue;
        }
    },
    methods: {
        /**
         * Handles page change event
         * @param {Number} newPage - The new page to change to
         */
        changePage (newPage) {
            if (newPage < 1 || newPage > this.totalPages) {
                return;
            }
            this.$emit("page-change", newPage);
        },

        /**
         * Validates the temporary page input and changes to that page
         */
        validateAndChangePage () {
            let targetPage = parseInt(this.tempPage, 10);

            if (isNaN(targetPage)) {
                targetPage = this.currentPage;
            }
            else if (targetPage < 1) {
                targetPage = 1;
            }
            else if (targetPage > this.totalPages) {
                targetPage = this.totalPages;
            }

            this.tempPage = targetPage;
            this.$emit("page-change", targetPage);
        },

        /**
         * Handles keyboard events on the input field
         * @param {KeyboardEvent} event - The keyboard event
         */
        handleInputKeydown (event) {
            if (event.key === "Enter") {
                this.validateAndChangePage();
            }
        },

        /**
         * Restricts input to only allow numbers
         * @param {Event} event - The input event
         */
        onlyAllowNumbers (event) {
            const char = String.fromCharCode(event.charCode);

            if (!(/^\d$/).test(char)) {
                event.preventDefault();
            }
        },

        /**
         * Determines the visible pages in a pagination component
         * Always shows consistent structure to prevent button shifting
         * @returns {Array} An array of page numbers or placeholders that should be visible
         */
        determineVisiblePages () {
            const pages = [];

            if (this.totalPages <= 7) {
                for (let i = 1; i <= this.totalPages; i++) {
                    pages.push(i);
                }
            }
            else if (this.currentPage <= 3) {
                pages.push(1, 2, 3, "...", this.totalPages);
            }
            else if (this.currentPage >= this.totalPages - 2) {
                pages.push(1, "...", this.totalPages - 2, this.totalPages - 1, this.totalPages);
            }
            else {
                pages.push(1, "...", this.currentPage, "...", this.totalPages);
            }
            return pages;
        }
    }
};
</script>

<template>
    <div class="pagination-controls">
        <div class="pagination-container">
            <div class="navigation-button-container left-nav">
                <IconButton
                    :aria="$t('common:modules.pagination.aria.previous')"
                    icon="bi bi-chevron-left"
                    :disabled="currentPage === 1"
                    :interaction="() => changePage(currentPage - 1)"
                />
            </div>

            <div class="page-buttons-scroll-container">
                <div class="page-buttons-container">
                    <LightButton
                        v-for="page in determineVisiblePages()"
                        :key="page"
                        :text="page.toString()"
                        :interaction="page === '...' ? () => {} : () => changePage(page)"
                        :customclass="page === currentPage ? 'active' : ''"
                        :disabled="page === '...'"
                    />
                </div>
            </div>

            <div class="navigation-button-container right-nav">
                <IconButton
                    :aria="$t('common:modules.pagination.aria.next')"
                    icon="bi bi-chevron-right"
                    :disabled="currentPage === totalPages"
                    :interaction="() => changePage(currentPage + 1)"
                />
            </div>
        </div>

        <div
            v-if="showGoToPage"
            class="go-to-page"
        >
            <div
                class="input-container"
                :title="$t('common:modules.pagination.input.tooltip')"
            >
                <input
                    id="pagination-input"
                    v-model="tempPage"
                    type="text"
                    class="page-input"
                    :placeholder="$t('common:modules.pagination.input.placeholder')"
                    :aria-label="$t('common:modules.pagination.input.label')"
                    @keydown="handleInputKeydown"
                    @input="event => { if (/^\d*$/.test(event.target.value)) tempPage = event.target.value }"
                    @change="event => { if (/^\d+$/.test(event.target.value)) tempPage = Number(event.target.value) }"
                >
            </div>
            <IconButton
                :aria="$t('common:modules.pagination.aria.go')"
                :title="$t('common:modules.pagination.button.goTooltip')"
                icon="bi bi-check"
                :interaction="validateAndChangePage"
                :class-array="['go-button']"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
@import 'variables';

.pagination-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.625rem 0;
    gap: 0.5rem;
    width: 100%;
    overflow: visible;
}

.pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3125rem;
    height: 2.5rem;
    width: 100%;
    max-width: 100%;
    overflow: visible;
}

.navigation-button-container {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    z-index: 2;
}

.left-nav {
    order: 1;
}

.right-nav {
    order: 3;
}

.page-buttons-scroll-container {
    flex: 1;
    order: 2;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0 0.25rem;
    scrollbar-width: thin;
    scrollbar-color: $dark_grey transparent;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: $dark_grey;
        border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: $secondary;
    }
}

.page-buttons-container {
    display: flex;
    align-items: center;
    gap: 0.3125rem;
    flex-wrap: nowrap;
    width: max-content;
    min-width: 100%;
    justify-content: center;
}

.go-to-page {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.input-container {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: fit-content;
}

.page-input {
    padding: 0.375rem 0.75rem;
    border: 1px solid $dark_grey;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    text-align: center;
    background-color: white;
    min-width: 3rem;
    width: auto;
    flex: 0 0 auto;
    min-width: calc(1ch + 1.5rem);
    width: calc(var(--input-length, 3) * 1ch + 1.5rem);
    max-width: 6rem;

    &:focus {
        outline: none;
        border-color: $secondary;
        box-shadow: 0 0 0 0.2rem rgba($secondary, 0.25);
    }

    &::placeholder {
        color: $placeholder-color;
        text-align: center;
    }
}

.input-label {
    font-size: 0.75rem;
    color: $placeholder-color;
    margin-bottom: 0.25rem;
    text-align: center;
    white-space: nowrap;
}

.go-button {
    flex-shrink: 0;
}

@media (max-width: 768px) {
    .pagination-controls {
        gap: 0.75rem;
        padding: 0 0.5rem;
    }

    .pagination-container {
        gap: 0.25rem;
        padding: 0;
        max-width: calc(100vw - 1rem);
    }

    .navigation-button-container {
        flex-shrink: 0;
        min-width: 2.5rem;
    }

    .page-buttons-scroll-container {
        padding: 0 0.125rem;
        margin: 0 0.125rem;
        scrollbar-width: auto;
        &::-webkit-scrollbar {
            height: 6px;
        }
    }

    .page-buttons-container {
        gap: 0.125rem;
        min-width: auto;
        justify-content: flex-start;
    }

    .go-to-page {
        flex-direction: row;
        gap: 0.25rem;
        height: auto;
        padding: 0.25rem;
        flex-wrap: nowrap;
    }

    .page-input {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        min-width: 2.5rem;
        width: calc(var(--input-length, 3) * 0.9ch + 1rem);
        max-width: 4rem;
    }

    .input-label {
        font-size: 0.7rem;
    }
}

@media (max-width: 480px) {
    .pagination-controls {
        padding: 0 0.25rem;
    }

    .pagination-container {
        gap: 0.125rem;
        max-width: calc(100vw - 0.5rem);
    }

    .navigation-button-container {
        min-width: 2rem;
    }

    .page-buttons-scroll-container {
        padding: 0;
        margin: 0 0.0625rem;
    }

    .page-buttons-container {
        gap: 0.0625rem;
    }

    .page-input {
        min-width: 2rem;
        width: calc(var(--input-length, 3) * 0.8ch + 0.8rem);
        max-width: 3rem;
        font-size: 0.75rem;
        padding: 0.2rem 0.4rem;
    }

    .go-to-page {
        gap: 0.125rem;
    }
}
</style>
