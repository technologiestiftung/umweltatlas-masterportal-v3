<script>
import IconButton from "../../buttons/components/IconButton.vue";
import InputText from "../../inputs/components/InputText.vue";
import LightButton from "../../buttons/components/LightButton.vue";

export default {
    name: "PaginationControl",
    components: {
        IconButton,
        InputText,
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
         * @returns {Array} An array of page numbers or placeholders that should be visible
         */
        determineVisiblePages () {
            const pages = [];

            if (this.totalPages <= 7) {
                for (let i = 1; i <= this.totalPages; i++) {
                    pages.push(i);
                }
            }
            else if (this.currentPage <= 2) {
                pages.push(1, 2, "...", this.totalPages);
            }
            else if (this.currentPage > this.totalPages - 2) {
                pages.push(1, "...", this.totalPages - 1, this.totalPages);
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
            <IconButton
                :aria="$t('common:modules.pagination.aria.previous')"
                icon="bi bi-chevron-left"
                :disabled="currentPage === 1"
                :interaction="() => changePage(currentPage - 1)"
            />
            <LightButton
                v-for="page in determineVisiblePages()"
                :key="page"
                :text="page.toString()"
                :interaction="page === '...' ? () => {} : () => changePage(page)"
                :customclass="page === currentPage ? 'active' : (page === '...' ? 'pagination-ellipsis' : '')"
            />
            <IconButton
                :aria="$t('common:modules.pagination.aria.next')"
                icon="bi bi-chevron-right"
                :disabled="currentPage === totalPages"
                :interaction="() => changePage(currentPage + 1)"
            />
            <div
                v-if="showGoToPage"
                class="go-to-page"
            >
                <InputText
                    id="pagination-input"
                    :label="$t('common:modules.pagination.input.label')"
                    :placeholder="$t('common:modules.pagination.input.placeholder')"
                    :value="tempPage.toString()"
                    :type="'text'"
                    :input="val => { if (/^\d*$/.test(val)) tempPage = val }"
                    :change="val => { if (/^\d+$/.test(val)) tempPage = Number(val) }"
                    :class-obj="{ 'page-input': true }"
                />
                <IconButton
                    :aria="$t('common:modules.pagination.aria.go')"
                    icon="bi bi-check"
                    :interaction="validateAndChangePage"
                    :class-array="['go-button', 'ms-2']"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import 'variables';

.pagination-controls {
    display: flex;
    justify-content: center;
    margin: 0.625rem 0;
}

.pagination-container {
    display: flex;
    align-items: center;
    gap: 0.3125rem;
    justify-content: center;
    margin: 0.625rem 0;
    height: 2.5rem;
}

.go-to-page {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
    height: 2.5rem;
}

.pagination-ellipsis {
    color: #000 !important;
    background: $light_grey !important;
    border-color: $dark_grey !important;
    font-weight: normal !important;
    cursor: default !important;
    pointer-events: none !important;
}

:deep(.page-input) {
    min-width: 3rem !important;
    max-width: 5rem !important;
    width: 4rem !important;
}
</style>
