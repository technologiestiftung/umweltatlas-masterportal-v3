<script>
export default {
    name: "PaginationControl",
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
        },
        /**
         * The placeholder text for the temporary page input
         */
        goToPageText: {
            type: String,
            default: ""
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
            <button
                class="pagination-arrow"
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
            >
                <i class="bi bi-chevron-left" />
            </button>
            <button
                v-for="page in determineVisiblePages()"
                :key="page"
                class="pagination-button"
                :class="{ active: page === currentPage }"
                :disabled="page === '...'"
                @click="changePage(page)"
            >
                {{ page }}
            </button>
            <button
                class="pagination-arrow"
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
            >
                <i class="bi bi-chevron-right" />
            </button>
            <div
                v-if="showGoToPage"
                class="go-to-page"
            >
                <input
                    v-model.number="tempPage"
                    type="text"
                    class="page-input"
                    @keypress="onlyAllowNumbers"
                >
                <button
                    class="go-button"
                    @click="validateAndChangePage"
                >
                    {{ goToPageText }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import 'variables';

.pagination-controls {
    display: flex;
    justify-content: center;
    margin: 10px 0;
}

.pagination-container {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
    margin: 10px 0;
}

.pagination-arrow {
    background-color: $light_grey;
    border: 1px solid $dark_grey;
    font-size: 1.2em;
    color: $dark_blue;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
}
.pagination-arrow:hover {
    background-color: $white;
}
.pagination-arrow:disabled {
    color: $light_grey;
    cursor: not-allowed;
    border-color: $light_grey;
}

.pagination-button {
    background-color: $light_grey;
    border: 1px solid $dark_grey;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    color: $dark_blue;
    min-width: 32px;
}
.pagination-button:hover {
    background-color: $white;
}
.pagination-button.active {
    background-color: $dark_blue;
    color: $white;
    border-color: $dark_blue;
    font-weight: bold;
}
.pagination-button:disabled {
    color: $light_grey;
    cursor: not-allowed;
    border-color: $light_grey;
}

.go-to-page {
    display: flex;
    align-items: center;
    margin-left: 8px;
    gap: 5px;
}

.page-input {
    width: 40px;
    text-align: center;
    border: 1px solid $dark_grey;
    border-radius: 4px;
    padding: 5px;
}

.go-button {
    font-size: 0.9em;
    padding: 5px 10px;
    background-color: $dark_blue;
    color: $white;
    border: 1px solid $dark_blue;
    border-radius: 4px;
    font-weight: bold;
}
.go-button:hover {
    background-color: $light_blue;
    border-color: $light_blue;
}
</style>
