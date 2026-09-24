<script>
import {getChartColor} from "../js/formatResult";

/**
 * Lists every category of the result, with a bar next to each row so the
 * proportions can be read at a glance without leaving the table. Unlike the
 * pie chart this is never reduced to a top-n selection.
 * @module addons/wfsAnalyzer/components/AnalysisTable
 */
export default {
    name: "AnalysisTable",
    props: {
        /** Categories as {label, value, share}. */
        categories: {
            type: Array,
            required: true
        },
        /** Sum of all category values. */
        total: {
            type: Number,
            required: true
        },
        /** Header of the value column. */
        valueHeader: {
            type: String,
            required: true
        },
        /** Formats a value for display. */
        formatValue: {
            type: Function,
            required: true
        },
        /** Formats a share for display. */
        formatShare: {
            type: Function,
            required: true
        },
        /** Colour per category label, taken from the map legend. */
        categoryColors: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        /**
         * The bars are scaled to the largest category, not to the total, so a
         * result of many small shares stays readable.
         * @returns {Number} the largest value.
         */
        maxValue () {
            return this.categories.reduce((max, category) => Math.max(max, category.value), 0);
        }
    },
    methods: {
        /**
         * The colour the map uses for this category, or the neutral shade when
         * the legend says nothing about it.
         * @param {Object} category the category.
         * @param {Number} index position in the list.
         * @returns {String} the colour.
         */
        getCategoryColor (category, index) {
            // A legend class brings its own colour; two classes may share a
            // name and still be drawn differently on the map.
            return category.color || this.categoryColors[category.label] || getChartColor(index);
        },

        /**
         * @param {Number} value the value of a category.
         * @returns {Number} the bar width in percent of the widest bar.
         */
        getBarWidth (value) {
            return this.maxValue > 0 ? (value / this.maxValue) * 100 : 0;
        }
    }
};
</script>

<template>
    <div class="table-responsive">
        <table class="table table-sm wfs-analyzer-table mb-0">
            <thead>
                <tr>
                    <th scope="col">
                        {{ $t("additional:modules.wfsAnalyzer.result.category") }}
                    </th>
                    <th
                        scope="col"
                        class="wfs-analyzer-bar-column"
                    >
                        <span class="visually-hidden">
                            {{ $t("additional:modules.wfsAnalyzer.result.proportion") }}
                        </span>
                    </th>
                    <th
                        scope="col"
                        class="text-end"
                    >
                        {{ valueHeader }}
                    </th>
                    <th
                        scope="col"
                        class="text-end"
                    >
                        {{ $t("additional:modules.wfsAnalyzer.result.share") }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(category, index) in categories"
                    :key="category.label"
                >
                    <td>{{ category.label }}</td>
                    <td class="wfs-analyzer-bar-column">
                        <div
                            class="wfs-analyzer-bar-track"
                            role="img"
                            :aria-label="`${category.label}: ${formatValue(category.value)}`"
                        >
                            <div
                                class="wfs-analyzer-bar-fill"
                                :style="{width: getBarWidth(category.value) + '%', backgroundColor: getCategoryColor(category, index)}"
                            />
                        </div>
                    </td>
                    <td class="text-end wfs-analyzer-number">
                        {{ formatValue(category.value) }}
                    </td>
                    <td class="text-end wfs-analyzer-number">
                        {{ formatShare(category.share) }}&nbsp;%
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="fw-bold">
                    <td>{{ $t("additional:modules.wfsAnalyzer.result.total") }}</td>
                    <td class="wfs-analyzer-bar-column" />
                    <td class="text-end wfs-analyzer-number">
                        {{ formatValue(total) }}
                    </td>
                    <td class="text-end wfs-analyzer-number">
                        {{ formatShare(1) }}&nbsp;%
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style lang="scss" scoped>
.wfs-analyzer-table {
    font-size: 12px;

    td, th {
        vertical-align: middle;
    }
}

.wfs-analyzer-number {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.wfs-analyzer-bar-column {
    width: 34%;
    min-width: 60px;
}

.wfs-analyzer-bar-track {
    height: 8px;
    border-radius: 2px;
    background-color: rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.wfs-analyzer-bar-fill {
    height: 100%;
    border-radius: 2px;
}
</style>
