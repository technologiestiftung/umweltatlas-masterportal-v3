<script>
import {mapGetters} from "vuex";
import draggable from "vuedraggable";
import localeCompare from "../../../js/utils/localeCompare";
import FlatButton from "../../buttons/components/FlatButton.vue";
import ExportButtonCSV from "../../buttons/components/ExportButtonCSV.vue";
import IconButton from "../../buttons/components/IconButton.vue";
import isObject from "../../../js/utils/isObject";

export default {
    name: "TableComponent",
    components: {
        Draggable: draggable,
        FlatButton,
        ExportButtonCSV,
        IconButton
    },
    props: {
        additionalColumnsForDownload: {
            type: Array,
            required: false,
            default () {
                return [];
            }
        },
        data: {
            type: Object,
            required: true
        },
        hits: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        showHeader: {
            type: Boolean,
            required: false,
            default: true
        },
        sortable: {
            type: Boolean,
            required: false,
            default: false
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        downloadable: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data () {
        return {
            currentSorting: {
                columnName: "",
                order: "origin"
            },
            visibleHeadersIndices: [],
            draggableHeader: [],
            visibleHeaders: [],
            fixedColumn: undefined
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),

        editedTable () {
            const table = {
                headers: [],
                items: []
            };

            table.headers = this.visibleHeaders;
            table.items = this.getSortedItems(this.data?.items, this.currentSorting.columnName,
                this.currentSorting.order);
            table.items = table.items.map(item => {
                const newItem = {};

                this.visibleHeaders.forEach(header => {
                    newItem[header.name] = item[header.name];
                });

                return newItem;
            });

            return table;
        }
    },
    watch: {
        data: {
            handler (val) {
                this.draggableHeader = val?.headers;
            },
            immediate: true
        },

        draggableHeader: {
            handler (val) {
                this.visibleHeadersIndices = [];
                val?.forEach(header => {
                    if (!this.visibleHeaders.length || this.isHeaderVisible(header.name)) {
                        this.visibleHeadersIndices.push(header.index);
                    }
                });
            },
            deep: true,
            immediate: true
        },

        visibleHeadersIndices: {
            handler (val) {
                this.visibleHeaders = this.draggableHeader?.filter(header => val.includes(header.index));
            },
            deep: true,
            immediate: true
        }
    },
    methods: {

        /**
         * Gets a specific icon class to the passed order.
         * @param {String} column - The column in which the table is sorted.
         * @returns {String} The icon css class for the given order.
         */
        getIconClassByOrder (column) {
            if (this.currentSorting?.columnName !== column) {
                return "bi-arrow-down-up origin-order";
            }
            if (this.currentSorting.order === "asc") {
                return "bi-arrow-up";
            }
            if (this.currentSorting.order === "desc") {
                return "bi-arrow-down";
            }
            return "bi-arrow-down-up origin-order";
        },
        /**
         * Gets the next sort order.
         * @param {String} order - The order in which the table is sorted.
         * @returns {String} The sort order. Can be origin, desc, asc.
         */
        getNextSortOrder (order) {
            if (order === "origin") {
                return "desc";
            }
            if (order === "desc") {
                return "asc";
            }
            return "origin";
        },
        /**
         * Gets the items sorted by column and order.
         * @param {Object[]} items - The items to sort.
         * @param {String} columnToSort - The column name which is sorted.
         * @param {String} order - The order to sort by. Can be origin, desc, asc.
         * @returns {Object[]} the sorted items.
         */
        getSortedItems (items, columnToSort, order) {
            if (!Array.isArray(items)) {
                return [];
            }
            if (order === "origin") {
                return items;
            }
            const sorted = [...items].sort((a, b) => {
                if (typeof a[columnToSort] === "undefined") {
                    return -1;
                }
                if (typeof b[columnToSort] === "undefined") {
                    return 1;
                }
                return localeCompare(a[columnToSort], b[columnToSort], this.currentLocale, {ignorePunctuation: true});
            });

            return order === "asc" ? sorted : sorted.reverse();
        },
        /**
         * Sets the order and sorts the table by the given column.
         * Sorting by a new column resets the order of the old column.
         * @param {String} columnName - The column to sort by.
         * @returns {void}
         */
        runSorting (columnName) {
            const newSorting = {
                columnName: columnName,
                order: null
            };

            if (newSorting.columnName === this.currentSorting.columnName) {
                newSorting.order = this.getNextSortOrder(this.currentSorting.order);
            }
            else {
                newSorting.order = this.getNextSortOrder("origin");
            }

            this.currentSorting = newSorting;
        },
        /**
         * Returns the edited table data for export.
         * @returns {Object} The edited table data.
         */
        exportTable () {
            const tableToExport = this.editedTable.items;

            this.additionalColumnsForDownload.forEach(column => {
                if (typeof column?.key === "string" && typeof column?.value === "string") {
                    tableToExport.forEach(item => {
                        item[column.key] = column.value;
                    });
                }
            });
            return tableToExport;
        },

        /**
         * Check if the header is visible in the table, if the header is hidden, it could not be draggable.
         * @param {String} name - The column name.
         * @returns {Boolean} true if it is visible
         */
        isHeaderVisible (name) {
            if (typeof name !== "string" || !this.visibleHeaders.length) {
                return false;
            }
            return this.visibleHeaders.some(header => header?.name === name);
        },
        /**
         * Resets the table data to original data.
         * @returns {void}
         */
        resetAll () {
            this.fixedColumn = undefined;
            this.visibleHeadersIndices = [];
            this.data.headers?.forEach(header => {
                this.visibleHeadersIndices.push(header.index);
            });
            this.draggableHeader = this.data?.headers;
            this.currentSorting.order = "origin";
        },

        /**
         * Toggles the fixed column.
         * @param {String} columnName The name of the column.
         * @returns {void}
         */
        toggleColumnFix (columnName) {
            if (typeof columnName !== "string"
                || typeof this.draggableHeader.find(header => header.name === columnName) === "undefined") {
                return;
            }
            if (this.fixedColumn === columnName) {
                this.fixedColumn = undefined;
                return;
            }
            this.fixedColumn = columnName;
            this.moveColumnToFirstPlace(columnName);
        },

        /**
         * Moves the given column by name to the first place in array.
         * @param {String} columnName The name of the column.
         * @returns {void}
         */
        moveColumnToFirstPlace (columnName) {
            if (typeof columnName !== "string") {
                return;
            }
            const draggableCopy = JSON.parse(JSON.stringify(this.draggableHeader));
            let oldIndex = null;

            draggableCopy.forEach(draggableElement => {
                if (!isObject(draggableElement)) {
                    return;
                }
                if (draggableElement.name === columnName) {
                    oldIndex = draggableElement.index;
                    draggableElement.index = 0;
                }
                else if (oldIndex === null) {
                    draggableElement.index += 1;
                }
            });

            this.draggableHeader = draggableCopy.sort((a, b) => a.index - b.index);
        },

        /**
         * Callback function which decides wether if the move is allowed to do or not.
         * Returns false if the move goes above the fixated column.
         * @param {Object} evt The event object. See for more info: https://github.com/SortableJS/vue.draggable.next?tab=readme-ov-file#move
         * @returns {Boolean} false to prevent and true to do nothing.
         */
        preventMoveAboveFixedColumn (evt) {
            if (this.fixedColumn && evt?.draggedContext?.futureIndex === 0) {
                return false;
            }
            return true;
        }
    }
};
</script>

<template>
    <div
        v-if="title"
        class="mb-3 text-center bold fs-4 title"
    >
        {{ title }}
    </div>
    <div
        v-if="hits"
        class="mb-3 hits"
    >
        <div>
            {{ $t(hits) }}
        </div>
        <span class="bold text-secondary">{{ editedTable.items?.length || 0 }}</span>
    </div>
    <div class="btn-toolbar justify-content-between sticky-top bg-white">
        <div class="btn-group">
            <div class="btn-group">
                <FlatButton
                    id="table-settings"
                    aria-label="$t('common:shared.modules.table.settings')"
                    :text="$t('common:shared.modules.table.settings')"
                    :icon="'bi-gear'"
                    :class="'me-3 rounded-pill'"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                />
                <div
                    class="dropdown-menu p-0 border-0 mt-1"
                    @click.stop=""
                >
                    <Draggable
                        v-model="draggableHeader"
                        group="people"
                        class="dragArea no-list ps-0 m-2"
                        tag="ul"
                        item-key="id"
                        handle=".list-group-item-draggable"
                        :move="preventMoveAboveFixedColumn"
                    >
                        <template #item="{ element }">
                            <li
                                :key="element.index"
                                class="list-group-item d-flex justify-content-between align-items-center p-2 rounded"
                                :class="[
                                    'index+' + element.index,
                                    {'list-group-item-draggable': fixedColumn !== element.name && isHeaderVisible(element.name)},
                                    {'pinnedSelectRow': fixedColumn === element.name}]"
                            >
                                <div class="ms-2 me-auto d-flex form-check">
                                    <input
                                        :id="element.name + element.index"
                                        v-model="visibleHeadersIndices"
                                        :value="element.index"
                                        class="me-2 mt-1 form-check-input"
                                        type="checkbox"
                                    >
                                    <label
                                        class="text-nowrap form-check-label"
                                        :for="element.name + element.index"
                                    >
                                        {{ element.name }}
                                    </label>
                                </div>
                                <div class="d-flex align-items-center">
                                    <span class="me-2">
                                        <IconButton
                                            :class-array="['btn-light', 'pinnedButton']"
                                            :interaction="() => toggleColumnFix(element.name)"
                                            :icon="fixedColumn !== element.name ? 'bi bi-pin-angle' : 'bi bi-pin-angle-fill'"
                                            :aria="$t('common:shared.modules.table.fixColumnAriaLabel')"
                                        />
                                    </span>
                                    <span class="me-2">
                                        <i class="bi bi-three-dots-vertical" />
                                    </span>
                                </div>
                            </li>
                        </template>
                    </Draggable>
                </div>
            </div>
            <FlatButton
                id="table-reset"
                aria-label="$t('common:shared.modules.table.reset')"
                :text="$t('common:shared.modules.table.reset')"
                :icon="'bi-x-circle'"
                :class="'me-3 rounded-pill'"
                :interaction="() => resetAll()"
            />
        </div>
        <div
            v-if="downloadable"
            class="btn-group"
        >
            <ExportButtonCSV
                id="table-download"
                class="btn btn-secondary align-items-center mb-3"
                :url="false"
                :data="exportTable()"
                :filename="title"
                :use-semicolon="true"
                :title="$t('common:shared.modules.table.download')"
            />
        </div>
    </div>
    <table class="table table-sm table-hover">
        <thead>
            <tr v-if="showHeader">
                <th
                    v-for="(column, idx) in editedTable.headers"
                    :key="idx"
                    :class="['p-2', fixedColumn === column.name ? 'fixedColumn' : '']"
                >
                    <span class="me-2">{{ column.name }}</span>
                    <span
                        v-if="sortable"
                        class="sortable-icon"
                        role="button"
                        tabindex="0"
                        :class="getIconClassByOrder(column.name)"
                        @click.stop="runSorting(column.name)"
                        @keypress.stop="runSorting(column.name)"
                    />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(item, idx) in editedTable.items"
                :key="idx"
            >
                <td
                    v-for="(entry, columnIdx) in visibleHeaders"
                    :key="columnIdx"
                    :class="['p-2', fixedColumn === entry.name ? 'fixedColumn' : '']"
                >
                    {{ item[entry.name] ? item[entry.name] : "" }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style lang="scss" scoped>
@import "~variables";

.bold {
    font-family: $font_family_accent;
}

.dropdown-menu {
    --bs-dropdown-min-width: 25em;
    li {
        cursor: pointer;
        input:hover {
            cursor: pointer;
        }
        .form-check-label {
            cursor: pointer;
        }
        &:hover {
            background: $light_blue;
        }
    }
}

table {
    table-layout: fixed;
    th {
        width: 15rem;
        position: sticky;
        top: 50px;
        background: $light_blue;
        font-family: $font_family_accent;
        z-index: 2;
        span.sortable-icon {
            cursor: pointer;
        }
    }
    .fixedColumn, th.fixedColumn {
        position: sticky;
        left: 0;
        background-color: $light_blue;
        z-index: 1;
    }
    th.fixedColumn {
        z-index: 3;
    }
}
.pinnedSelectRow {
    background-color: $light_blue;
    & .pinnedButton {
        background-color: $light_blue;
        border: solid $light_blue 1px
    }
    & .pinnedButton:hover {
        background-color: $white;
        border-color: $white;
    }
}
</style>
