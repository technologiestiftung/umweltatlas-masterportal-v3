<script>
import {getChartColor} from "../js/formatResult";

/**
 * Horizontal bar chart built from plain elements - no charting library. The
 * bars are sized relative to the largest category so small shares stay
 * visible.
 * @module addons/wfsAnalyzer/components/AnalysisBarChart
 */
export default {
    name: "AnalysisBarChart",
    props: {
        /** Categories as {label, value, share}. */
        categories: {
            type: Array,
            required: true
        },
        /** Formats a value for display. */
        formatValue: {
            type: Function,
            required: true
        }
    },
    computed: {
        /**
         * @returns {Number} the largest value, used as the bar scale.
         */
        maxValue () {
            return this.categories.reduce((max, category) => Math.max(max, category.value), 0);
        }
    },
    methods: {
        getChartColor,

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
    <div class="wfs-analyzer-bars">
        <div
            v-for="(category, index) in categories"
            :key="category.label"
            class="wfs-analyzer-bar-row"
        >
            <div class="d-flex justify-content-between align-items-baseline">
                <span class="wfs-analyzer-bar-label">
                    {{ category.label }}
                </span>
                <span class="wfs-analyzer-bar-value ms-2">
                    {{ formatValue(category.value) }}
                    <span class="text-muted">({{ (category.share * 100).toFixed(1) }}&nbsp;%)</span>
                </span>
            </div>
            <div
                class="wfs-analyzer-bar-track"
                role="img"
                :aria-label="`${category.label}: ${formatValue(category.value)}`"
            >
                <div
                    class="wfs-analyzer-bar-fill"
                    :style="{width: getBarWidth(category.value) + '%', backgroundColor: getChartColor(index)}"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wfs-analyzer-bar-row {
    margin-bottom: 8px;
}

.wfs-analyzer-bar-label {
    font-size: 12px;
    line-height: 1.25;
    overflow-wrap: anywhere;
}

.wfs-analyzer-bar-value {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.wfs-analyzer-bar-track {
    height: 10px;
    margin-top: 2px;
    border-radius: 2px;
    background-color: rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.wfs-analyzer-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.2s ease-out;
}
</style>
