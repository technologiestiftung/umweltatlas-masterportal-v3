<script>
import IconButton from "../../buttons/components/IconButton.vue";
import LightButton from "../../buttons/components/LightButton.vue";
import InputText from "../../inputs/components/InputText.vue";

export default {
    name: "PaginationControl",
    components: {
        IconButton,
        LightButton,
        InputText
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
    computed: {
        /**
         * Calculate the input width based on the total pages
         */
        inputWidth () {
            const maxDigits = this.totalPages.toString().length;

            return Math.max(maxDigits, 2);
        }
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
        <!-- Desktop/Tablet View -->
        <div class="pagination-wrapper desktop-view">
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

            <div
                v-if="showGoToPage"
                class="go-to-page"
            >
                <div
                    class="input-container"
                    :title="$t('common:modules.pagination.input.tooltip')"
                    :style="{ '--input-width': inputWidth }"
                >
                    <InputText
                        :id="'pagination-input'"
                        :label="''"
                        :placeholder="$t('common:modules.pagination.input.placeholder')"
                        :value="tempPage.toString()"
                        type="text"
                        :class-obj="{ 'pagination-input': true }"
                        :input="(value) => { if (/^\d*$/.test(value)) tempPage = value }"
                        :change="(value) => { if (/^\d+$/.test(value)) tempPage = Number(value) }"
                        @keydown="handleInputKeydown"
                    />
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

        <!-- Mobile View -->
        <div class="pagination-wrapper mobile-view">
            <div class="mobile-nav-container">
                <IconButton
                    :aria="$t('common:modules.pagination.aria.previous')"
                    icon="bi bi-chevron-left"
                    :disabled="currentPage === 1"
                    :interaction="() => changePage(currentPage - 1)"
                />

                <div class="mobile-page-info">
                    <div class="current-page-display">
                        <span class="page-number">{{ currentPage }}</span>
                        <span class="page-separator">/</span>
                        <span class="total-pages">{{ totalPages }}</span>
                    </div>
                    <div class="page-dots">
                        <div
                            v-for="dot in Math.min(totalPages, 5)"
                            :key="dot"
                            class="page-dot"
                            :class="{ 'active': dot === currentPage || (totalPages > 5 && dot === 5 && currentPage >= 5) }"
                        />
                    </div>
                </div>

                <IconButton
                    :aria="$t('common:modules.pagination.aria.next')"
                    icon="bi bi-chevron-right"
                    :disabled="currentPage === totalPages"
                    :interaction="() => changePage(currentPage + 1)"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import 'variables';

.pagination-controls {
    display: flex;
    align-items: center;
    margin: 0.625rem 0;
    width: 100%;
    overflow: visible;
}

.pagination-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    height: 2.5rem;
    width: 100%;
    max-width: 100%;
    overflow: visible;
    flex-wrap: wrap;
}

.desktop-view {
    display: flex;
}

.mobile-view {
    display: none;
    flex-direction: column;
    gap: 0.75rem;
    height: auto;
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
    padding: 0 0.0625rem;
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
    gap: 0.03125rem;
    flex-wrap: nowrap;
    width: max-content;
    min-width: 100%;
    justify-content: center;
}

.go-to-page {
    order: 4;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 2.5rem;
    flex-shrink: 0;
    margin-left: 0.25rem;
    min-width: 0;

    :deep(.form-floating) {
        margin-bottom: 0;
        min-width: fit-content;

        .form-control.pagination-input {
            text-align: center;
            width: calc(var(--input-width, 3) * 1ch + 1.5rem);
            min-width: 3rem;
            max-width: 8rem;
        }
    }
}.input-container {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: fit-content;
}

.go-button {
    flex-shrink: 0;
}

.mobile-nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.mobile-page-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    margin: 0 1rem;
}

.current-page-display {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-weight: 500;
    color: $primary;

    .page-number {
        font-size: 1.5rem;
        font-weight: 600;
    }

    .page-separator {
        font-size: 1rem;
        color: $dark_grey;
    }

    .total-pages {
        font-size: 1rem;
        color: $dark_grey;
    }
}

.page-dots {
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.page-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $light_grey;
    transition: all 0.2s ease;

    &.active {
        background: $primary;
        transform: scale(1.5);
    }
}

@media (max-width: 768px) {
    .desktop-view {
        display: none;
    }

    .mobile-view {
        display: flex;
    }

    .pagination-controls {
        padding: 0.75rem 0.5rem;
    }
}

@media (max-width: 480px) {
    .mobile-nav-container {
        max-width: 260px;
        padding: 0.375rem 0.75rem;
    }

    .current-page-display .page-number {
        font-size: 1.375rem;
    }

    .pagination-controls {
        padding: 0.5rem 0.25rem;
    }
}

@media (max-width: 360px) {
    .mobile-nav-container {
        max-width: 240px;
        padding: 0.25rem 0.5rem;
    }

    .current-page-display .page-number {
        font-size: 1.25rem;
    }
}
</style>
