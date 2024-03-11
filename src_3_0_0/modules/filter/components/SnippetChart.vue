<script>
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import BarchartItem from "../../../shared/modules/charts/components/BarchartItem.vue";

/**
* Snippet Chart
* @module modules/SnippetChart
* @vue-data {Boolean} isVisible - true if the component should be rendered.
* @vue-data {Boolean} isEmpty - true if the data contain only zeroes or no data available.
* @vue-prop {Object} api - The api.
* @vue-prop {String|Boolean} title - The title of the chart.
* @vue-prop {Array} filteredItems - The list of filtered items (ol features).
* @vue-prop {Object} chartConfig - The config for the chart.
* @vue-prop {String} alternativeTextForEmptyChart - The text to show if the chart is empty.
*/
export default {
    name: "SnippetChart",
    components: {
        BarchartItem
    },
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        alternativeTextForEmptyChart: {
            type: String,
            required: false,
            default: ""
        },
        filteredItems: {
            type: Array,
            required: false,
            default: () => []
        },
        chartConfig: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            isVisible: false,
            isEmpty: false
        };
    },
    computed: {
        titleText () {
            if (typeof this.title === "string") {
                return translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        alternativeText () {
            return translateKeyWithPlausibilityCheck(this.alternativeTextForEmptyChart, key => this.$t(key));
        }
    },
    watch: {
        filteredItems: {
            handler (items) {
                this.isVisible = false;
                this.isEmpty = true;
                if (items.length && this.api !== null) {
                    this.api.filter({
                        rules: [{
                            attrName: this.api.service.filter.attrName,
                            operator: this.api.service.filter.operator,
                            value: items[0].get(this.api.service.filter.attrName)
                        }]
                    },
                    this.addChartData,
                    error => {
                        console.warn(error);
                    });
                }
                this.isVisible = true;
            },
            deep: true
        }
    },
    methods: {
        /**
         * Adds the data for the chart to the chart config.
         * Afterwards the chart is set to visible.
         * @param {Object} filterAnswer - The resulting filterAnswer
         * @returns{void}
         */
        addChartData (filterAnswer) {
            const feature = filterAnswer.items[0];

            if (feature) {
                this.chartConfig.data.datasets.forEach(dataset => {
                    dataset.data = [];

                    dataset.featureAttributes.forEach(attr => {
                        dataset.data.push(feature.get(attr));
                        if (this.isEmpty && feature.get(attr) > 0) {
                            this.isEmpty = false;
                        }
                    });
                });
            }
        }

    }
};
</script>

<template>
    <div
        v-if="isVisible"
    >
        <h6 v-if="title">
            {{ titleText }}
        </h6>
        <BarchartItem
            v-if="chartConfig.type === 'bar' && !isEmpty"
            :given-options="chartConfig.options"
            :data="chartConfig.data"
        />
        <span
            v-if="isEmpty"
        >
            {{ alternativeText }}
        </span>
    </div>
</template>
