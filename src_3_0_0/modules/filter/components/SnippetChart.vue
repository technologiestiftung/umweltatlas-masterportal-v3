<script>
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import BarchartItem from "../../../shared/modules/charts/components/BarchartItem.vue";

/**
* Snippet Chart
* @module modules/SnippetChart
* @vue-prop {Object} api - The api.
* @vue-prop {String|Boolean} title - The title of the chart.
* @vue-prop {Array} filteredItems - The list of filtered items (ol features).
* @vue-prop {Object} chartConfig - The config for the chart.
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
            isVisible: false
        };
    },
    computed: {
        titleText () {
            if (typeof this.title === "string") {
                return translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        }
    },
    watch: {
        filteredItems: {
            handler (items) {
                this.isVisible = false;
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
                    });
                });
                this.isVisible = true;
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
            v-if="chartConfig.type === 'bar'"
            :given-options="chartConfig.options"
            :data="chartConfig.data"
        />
    </div>
</template>
