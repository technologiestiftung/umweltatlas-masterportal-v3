<script>
import {getChartColor} from "../js/formatResult";

/**
 * Pie chart drawn as inline SVG arc paths - no charting library. A category
 * covering the whole result is drawn as a plain circle, because an arc from
 * 0 to 360 degrees would collapse into nothing.
 * @module addons/wfsAnalyzer/components/AnalysisPieChart
 */
const size = 220,
    radius = 100;

export default {
    name: "AnalysisPieChart",
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
        },
        /** Formats a share for display. */
        formatShare: {
            type: Function,
            required: true
        }
    },
    data () {
        return {
            size,
            radius,
            center: size / 2
        };
    },
    computed: {
        /**
         * @returns {Boolean} true if one category covers everything.
         */
        isSingleSlice () {
            return this.categories.length === 1 || this.categories.some((category) => category.share >= 0.9999);
        },

        /**
         * Turns the shares into arc paths, starting at the top and going
         * clockwise.
         * @returns {Object[]} the slices as {path, color, category}.
         */
        slices () {
            let currentAngle = -90;

            return this.categories.map((category, index) => {
                const sweep = category.share * 360,
                    slice = {
                        path: this.describeSlice(currentAngle, currentAngle + sweep),
                        color: getChartColor(index),
                        category
                    };

                currentAngle += sweep;

                return slice;
            });
        }
    },
    methods: {
        getChartColor,

        /**
         * Builds the path of a single pie slice.
         * @param {Number} startAngle start angle in degrees.
         * @param {Number} endAngle end angle in degrees.
         * @returns {String} the SVG path.
         */
        describeSlice (startAngle, endAngle) {
            const start = this.getPointOnCircle(startAngle),
                end = this.getPointOnCircle(endAngle),
                largeArc = endAngle - startAngle > 180 ? 1 : 0;

            return [
                `M ${this.center} ${this.center}`,
                `L ${start.x} ${start.y}`,
                `A ${this.radius} ${this.radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
                "Z"
            ].join(" ");
        },

        /**
         * @param {Number} angle angle in degrees.
         * @returns {Object} the point as {x, y}.
         */
        getPointOnCircle (angle) {
            const radians = (angle * Math.PI) / 180;

            return {
                x: Number((this.center + this.radius * Math.cos(radians)).toFixed(2)),
                y: Number((this.center + this.radius * Math.sin(radians)).toFixed(2))
            };
        }
    }
};
</script>

<template>
    <div class="wfs-analyzer-pie">
        <svg
            :viewBox="`0 0 ${size} ${size}`"
            class="wfs-analyzer-pie-svg"
            role="img"
            :aria-label="$t('additional:modules.wfsAnalyzer.result.pieLabel')"
        >
            <circle
                v-if="isSingleSlice"
                :cx="center"
                :cy="center"
                :r="radius"
                :fill="getChartColor(0)"
            />
            <path
                v-for="slice in slices"
                v-else
                :key="slice.category.label"
                :d="slice.path"
                :fill="slice.color"
                stroke="#fff"
                stroke-width="1"
            >
                <title>{{ slice.category.label }}: {{ formatValue(slice.category.value) }}</title>
            </path>
        </svg>

        <ul class="wfs-analyzer-legend">
            <li
                v-for="(category, index) in categories"
                :key="category.label"
                class="wfs-analyzer-legend-item"
            >
                <span
                    class="wfs-analyzer-swatch"
                    :style="{backgroundColor: getChartColor(index)}"
                />
                <span class="wfs-analyzer-legend-label">{{ category.label }}</span>
                <span class="wfs-analyzer-legend-value text-muted">
                    {{ formatShare(category.share) }}&nbsp;%
                </span>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.wfs-analyzer-pie-svg {
    display: block;
    width: 100%;
    max-width: 220px;
    height: auto;
    margin: 0 auto 10px;
}

.wfs-analyzer-legend {
    list-style: none;
    padding: 0;
    margin: 0;
}

.wfs-analyzer-legend-item {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 12px;
    margin-bottom: 3px;
}

.wfs-analyzer-swatch {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    transform: translateY(1px);
}

.wfs-analyzer-legend-label {
    flex: 1 1 auto;
    overflow-wrap: anywhere;
}

.wfs-analyzer-legend-value {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
</style>
