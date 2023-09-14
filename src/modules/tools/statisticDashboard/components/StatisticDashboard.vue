<script>
import {mapGetters, mapMutations} from "vuex";
import TableComponent from "../../../../share-components/table/components/TableComponent.vue";
import {getComponent} from "../../../../utils/getComponent";
import isObject from "../../../../utils/isObject";
import ToolTemplate from "../../ToolTemplate.vue";
import getters from "../store/gettersStatisticDashboard";
import GridComponent from "./StatisticGridComponent.vue";
import mutations from "../store/mutationsStatisticDashboard";
import Controls from "./StatisticDashboardControls.vue";
import StatisticFilter from "./StatisticDashboardFilter.vue";
import FetchDataHandler from "../utils/fetchData.js";
import StatisticsHandler from "../utils/handleStatistics.js";
import {rawLayerList} from "@masterportal/masterportalapi";
import {getFeaturePOST} from "../../../../api/wfs/getFeature";
import ChartProcessor from "../utils/chartProcessor.js";
import {
    and as andFilter,
    equalTo as equalToFilter,
    or as orFilter
} from "ol/format/filter";
import dayjs from "dayjs";
import WFS from "ol/format/WFS";

export default {
    name: "StatisticDashboard",
    components: {
        ToolTemplate,
        TableComponent,
        GridComponent,
        Controls,
        StatisticFilter
    },
    data () {
        return {
            tableData: [],
            testFixedData: {
                items: [
                    ["Bergedorf", 1234, 1234],
                    ["Wandsbek", 23456, 1234],
                    ["Altona", 23475, 1234]
                ]
            },
            selectMode: "column",
            showHeader: true,
            sortable: true,
            categories: null,
            statisticsByCategory: false,
            loadedFilterData: false,
            timeStepsFilter: [],
            regions: [],
            areCategoriesGrouped: false,
            dates: [],
            selectedLevel: undefined,
            sortedRows: [],
            currentChart: {},
            chartCounts: 0,
            showTable: true,
            showChart: false,
            showGrid: false,
            controlDescription: [{
                title: "Trappatoni 1",
                content: "Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind."
            },
            {
                title: "Trappatoni 2 ",
                content: "Ich lese nicht sehr viele Zeitungen, aber ich habe gehört viele Situationen."
            },
            {
                title: "Trappatoni 3 ",
                content: "Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler."
            }],
            referenceTag: undefined
        };
    },
    computed: {
        ...mapGetters("Tools/StatisticDashboard", Object.keys(getters)),
        ...mapGetters("Maps", ["projection"])
    },
    watch: {
        selectedReferenceData (val) {
            if (isObject(val?.value) && typeof val.value.value === "string") {
                this.referenceTag = val.value.value;
            }
            else if (val?.value === null) {
                this.referenceTag = undefined;
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    async mounted () {
        this.selectedLevel = this.data[0];
        const uniqueValues = await this.getUniqueValuesForLevel(this.selectedLevel),
            selectedLevelRegionNameAttribute = this.getSelectedLevelRegionNameAttribute(this.selectedLevel),
            selectedLevelDateAttribute = this.getSelectedLevelDateAttribute(this.selectedLevel);

        if (uniqueValues[selectedLevelRegionNameAttribute.attrName] && uniqueValues[selectedLevelDateAttribute.attrName]) {
            this.regions = Object.keys(uniqueValues[selectedLevelRegionNameAttribute.attrName]);
            this.dates = Object.keys(uniqueValues[selectedLevelDateAttribute.attrName]);
            this.timeStepsFilter = this.getTimestepsMerged(this.selectedLevel?.timeStepsFilter, uniqueValues[selectedLevelDateAttribute.attrName], selectedLevelDateAttribute.inputFormat, selectedLevelDateAttribute.outputFormat);
        }
        this.areCategoriesGrouped = StatisticsHandler.hasOneGroup(this.getSelectedLevelStatisticsAttributes(this.selectedLevel));
        this.categories = StatisticsHandler.getCategoriesFromStatisticAttributes(this.getSelectedLevelStatisticsAttributes(this.selectedLevel), this.areCategoriesGrouped);
        this.loadedFilterData = true;
    },
    methods: {
        ...mapMutations("Tools/StatisticDashboard", Object.keys(mutations)),

        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Gets the unique values for the inputs of the filter for the given level.
         * @param {Object} level The level to get the unique values for.
         * @param {Object} level.mappingFilter The mapping object which holds the configuration of the time attribute and region name attribute.
         * @param {Object} level.timeAttribute The config object for the time attribute.
         * @param {String} level.timeAttribute.attrName The attrName of the time attribute.
         * @param {String} level.timeAttribute.inputFormat The format of the incoming date.
         * @param {String} level.timeAttribute.outputFormat The format in which the date should be displayed to the user.
         * @param {Object} level.regionNameAttribute The config object of the region name attribute.
         * @param {String} level.regionNameAttribute.attrName The attrName of the region name attribute.
         * @returns {Object} An object with the time and region attrName as key and an unique value list as value.
         */
        async getUniqueValuesForLevel (level) {
            if (!isObject(level) || !isObject(level.mappingFilter) || !isObject(level.mappingFilter.timeAttribute) || !isObject(level.mappingFilter.regionNameAttribute)) {
                return {};
            }
            const layerId = level.layerId,
                timeAttribute = level.mappingFilter.timeAttribute.attrName,
                timeInputFormat = level.mappingFilter.timeAttribute.inputFormat,
                timeOutputFormat = level.mappingFilter.timeAttribute.outputFormat,
                regionNameAttribute = level.mappingFilter.regionNameAttribute.attrName;
            let uniqueValues = null;

            uniqueValues = await FetchDataHandler.getUniqueValues(layerId, [timeAttribute, regionNameAttribute], timeInputFormat, timeOutputFormat);
            return uniqueValues;
        },

        /**
         * Gets the time steps for the filter. It will merge the unique list with the given
         * configured time steps if they are configured.
         * @param {Object} timeSteps The time steps object with {Number: Label}.
         * @param {Object} uniqueList The list as object with {value: true}.
         * @param {String} inputFormat The input format for the date.
         * @param {String} outputFormat The format to transform the date to.
         * @returns {Object[]} The merged time steps.
         */
        getTimestepsMerged (timeSteps, uniqueList, inputFormat, outputFormat) {
            const result = [];
            let uniqueListAsArray = [];

            if (isObject(uniqueList)) {
                uniqueListAsArray = Object.keys(uniqueList);
                uniqueListAsArray.forEach(uniqueTime => {
                    result.push({value: uniqueTime, label: dayjs(uniqueTime, inputFormat).format(outputFormat)});
                });
            }
            if (isObject(timeSteps)) {
                Object.entries(timeSteps).forEach(([key, value]) => {
                    const uniqueTime = key === "all" ? uniqueListAsArray : uniqueListAsArray.slice(Number(`-${key}`));

                    if (Array.isArray(uniqueTime) && uniqueTime.length) {
                        result.push({value: uniqueTime, label: value});
                    }
                });
            }
            return result;
        },

        /**
         * Sets the statistics selected in the filter.
         * @param {String} categoryName - The category name.
         * @returns {void}
         */
        setStatisticsByCategory (categoryName) {
            this.statisticsByCategory = StatisticsHandler.getStatisticsByCategory(categoryName, this.getSelectedLevelStatisticsAttributes(this.selectedLevel));
        },

        /**
         * Sets the sorted rows.
         * @param {Array[]} value - An array of arrays of sorted rows.
         * @returns {void}
         */
        setSortedRows (value) {
            this.sortedRows = value;
        },

        /**
         * Handles the filter settings and starts a POST request based on given settings.
         * @param {String[]} filteredStatistics The statistics.
         * @param {String[]} regions The regions.
         * @param {String[]} dates The dates.
         * @returns {void}
         */
        async handleFilterSettings (filteredStatistics, regions, dates) {
            this.tableData = [];

            const statsKeys = StatisticsHandler.getStatsKeysByName(this.statisticsByCategory, filteredStatistics),
                selectedLayer = this.getRawLayerByLayerId(this.selectedLevel.layerId),
                selectedLevelRegionNameAttribute = this.getSelectedLevelRegionNameAttribute(this.selectedLevel),
                selectedLevelDateAttribute = this.getSelectedLevelDateAttribute(this.selectedLevel),
                payload = {
                    featureTypes: [selectedLayer.featureType],
                    featureNS: selectedLayer.featureNS,
                    srsName: this.projection.getCode(),
                    propertyNames: [...statsKeys, selectedLevelRegionNameAttribute.attrName, selectedLevelDateAttribute.attrName],
                    filter: this.getFilter(regions, dates)
                },
                response = await getFeaturePOST(selectedLayer.url, payload, error => {
                    console.error(error);
                }),
                features = new WFS().readFeatures(response);

            this.statisticsData = this.prepareStatisticsData(features, filteredStatistics, regions, dates, selectedLevelDateAttribute, selectedLevelRegionNameAttribute);
            this.tableData = this.getTableData(this.statisticsData);
            this.chartCounts = filteredStatistics.length;
            this.handleChartData(filteredStatistics, regions, dates, this.statisticsData);
        },

        /**
         * Handles chart data and resets the showGrid property.
         * @param {String[]} filteredStatistics The statistics.
         * @param {String[]} regions The regions.
         * @param {String[]} dates The dates.
         * @param {Object} preparedData The prepared data.
         * @returns {void}
         */
        handleChartData (filteredStatistics, regions, dates, preparedData) {
            const directionBarChart = regions.length < 5 ? "vertical" : "horizontal";

            this.showGrid = false;
            if (filteredStatistics.length > 1) {
                this.prepareGridCharts(filteredStatistics, preparedData, directionBarChart, dates.length > 1);
            }
            else if (regions.length >= 1) {
                this.$nextTick(() => {
                    if (dates.length > 1) {
                        this.prepareChartData(filteredStatistics[0], preparedData[filteredStatistics[0]], undefined, "line");
                        return;
                    }
                    this.prepareChartData(filteredStatistics[0], preparedData[filteredStatistics[0]], undefined, "bar", directionBarChart);
                });
            }
        },
        /**
         * Prepares the charts for the grid and also creates canvas elements for each chart to render on.
         * @param {String[]} filteredStatistics The statistics.
         * @param {Object} preparedData The prepared data.
         * @param {String[]} direction - Direction of bar chart.
         * @param {Boolean} renderAsLine Flag to render line charts. Default is false.
         * @returns {void}
         */
        prepareGridCharts (filteredStatistics, preparedData, direction, renderAsLine = false) {
            this.showGrid = true;
            this.$nextTick(() => {
                filteredStatistics.forEach((statistic, idx) => {
                    const ctx = this.$refs["chart" + (idx + 1)];

                    if (renderAsLine) {
                        this.prepareChartData(statistic, preparedData[statistic], ctx, "line");
                        return;
                    }
                    this.prepareChartData(statistic, preparedData[statistic], ctx, "bar", direction);
                });
            });
        },
        /**
         * Prepares the chart and also handles the destruction of previuos charts.
         * @param {String} topic The topic of the chart.
         * @param {Object} preparedData The data.
         * @param {HTMLElement} canvas The canvas to render the chart on.
         * @param {String} type The type. Can be bar or line.
         * @param {String} direction The direction of the bar chart.
         * @returns {void}
         */
        prepareChartData (topic, preparedData, canvas, type, direction) {
            const chart = canvas || this.$refs.chart;

            if (typeof this.currentChart[topic] !== "undefined") {
                this.currentChart[topic].chart.destroy();
            }
            this.currentChart[topic] = {};
            if (type === "line") {
                this.currentChart[topic].chart = ChartProcessor.createLineChart(topic, preparedData, chart);
            }
            else if (type === "bar") {
                this.currentChart[topic].chart = ChartProcessor.createBarChart(topic, preparedData, direction, chart);
            }
        },

        /**
         * Gets the filter based on given regions and dates array.
         * Gets an Or Filter if one of them has more than one entry.
         * Gets an And Filter if both of them has entries.
         * Gets an EqualTo Filter if one of them has only one entry.
         * @param {String[]} regions The regions.
         * @param {String[]} dates The dates.
         * @returns {ol/format/filter} The filter.
         */
        getFilter (regions, dates) {
            if (!Array.isArray(regions) || !Array.isArray(dates)) {
                return undefined;
            }
            const regionAttrName = this.getSelectedLevelRegionNameAttribute(this.selectedLevel)?.attrName,
                dateAttrName = this.getSelectedLevelDateAttribute(this.selectedLevel)?.attrName;

            if (regions.length === this.regions.length) {
                if (dates.length === this.dates.length) {
                    return undefined;
                }
                return this.getFilterForList(dates, dateAttrName);
            }
            else if (dates.length === this.dates.length) {
                return this.getFilterForList(regions, regionAttrName);
            }
            return andFilter(this.getFilterForList(dates, dateAttrName), this.getFilterForList(regions, regionAttrName));
        },
        /**
         * Gets the filter for given list and property.
         * If given list has more than one entry the function returns an
         * Or Filter otherwise an EqualTo Filter.
         * @param {String[]} list The list to create a filter for.
         * @param {String} propertyName The propertyName to create a filter for.
         * @returns {ol/format/filter} The filter.
         */
        getFilterForList (list, propertyName) {
            if (!Array.isArray(list) || typeof propertyName !== "string") {
                return undefined;
            }

            const filterArray = list.map(entry => equalToFilter(propertyName, entry));

            return filterArray.length > 1 ? orFilter(...filterArray) : filterArray[0];
        },

        /**
         * Gets the data for the table from the prepared statistics.
         * @param {Object} statisticsData - Prepared statistical data.
         * @returns {Object[]} Data for table with header and items.
         */
        getTableData (statisticsData) {
            const headers = [],
                data = [];

            Object.keys(statisticsData).forEach(statData => {
                const items = [];

                Object.entries(statisticsData[statData]).forEach(([region, years]) => {
                    items.push([region, ...Object.values(years).reverse()]);
                    if (headers.length === 0) {
                        headers.push("Gebiet", ...Object.keys(years).reverse());
                    }
                });
                data.push({
                    headers,
                    items
                });
            });
            return data;
        },

        /**
         * Prepares the statistical data from the features.
         * @param {Object} features - The configured statistics.
         * @param {String[]} statistics - The key to the statistic whose value is being looked for.
         * @param {String[]} regions - The regions of the statistic wanted.
         * @param {String[]} dates - The dates of the statsitic wanted.
         * @param {String} dateAttribute - The configured date attribute.
         * @param {String} regionAttribute - The configured region attribute.
         * @returns {Object} The prepared statistical data.
         */
        prepareStatisticsData (features, statistics, regions, dates, dateAttribute, regionAttribute) {
            const data = {};

            statistics.forEach(stat => {
                const statsKey = StatisticsHandler.getStatsKeysByName(this.statisticsByCategory, [stat])[0];

                data[stat] = {};
                regions.forEach(region => {
                    data[stat][region] = {};
                    dates.forEach(date => {
                        const formatedDate = dayjs(date).format(dateAttribute.outputFormat),
                            regionKey = regionAttribute.attrName,
                            dateKey = dateAttribute.attrName;

                        data[stat][region][formatedDate] = this.getStatisticValue(features, statsKey, region, regionKey, date, dateKey);
                    });
                });
            });
            return data;
        },

        /**
         * Finds the feature based on the region and the date.
         * Returns the corresponding value of the passed statistic from the feature.
         * @param {Object} features - The configured statistics.
         * @param {String[]} statisticKey - The key to the statistic whose value is being looked for.
         * @param {String} region - The region of the statistic wanted.
         * @param {String} regionKey - The key to the region.
         * @param {String} date - The date of the statsitic wanted.
         * @param {String} dateKey - The key to the date.
         * @returns {String} The value of the given statistic.
         */
        getStatisticValue (features, statisticKey, region, regionKey, date, dateKey) {
            const foundFeature = features.find(feature => {
                return feature.get(regionKey) === region && feature.get(dateKey) === date;
            });

            return foundFeature?.get(statisticKey) || "-";
        },

        /**
         * Gets the currently selected layer by the given level.
         * @param {String} layerId The layer id.
         * @returns {Object} The layer.
         */
        getRawLayerByLayerId (layerId) {
            return rawLayerList.getLayerWhere({id: layerId}) || {};
        },

        /**
         * Gets the region attribute object by the given level.
         * @param {Object} level The level object.
         * @returns {Object} The region attribute object.
         */
        getSelectedLevelRegionNameAttribute (level) {
            return level?.mappingFilter?.regionNameAttribute || {};
        },

        /**
         * Gets the date attribute by the given level.
         * @param {Object} level The level object.
         * @returns {Object} The time attribute object.
         */
        getSelectedLevelDateAttribute (level) {
            return level?.mappingFilter?.timeAttribute || {};
        },

        /**
         * Gets the statistic attributes by the given level.
         * @param {Object} level The level object.
         * @returns {Object} The statistics attribute object.
         */
        getSelectedLevelStatisticsAttributes (level) {
            return level?.mappingFilter.statisticsAttributes || {};
        },

        /**
         * Removes the reference data
         * @returns {void}
         */
        removeReference () {
            this.setSelectedReferenceData({});
            this.referenceTag = undefined;
        },
        /**
         * Toggles between chart and table.
         * @returns {void}
         */
        toggleChartTable () {
            this.showChart = !this.showChart;
            this.showTable = !this.showTable;
        }
    }
};
</script>

<template>
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        class="static-dashboard"
    >
        <template #toolBody>
            <div class="row justify-content-between">
                <div class="col-md-4">
                    <h4>{{ $t("common:modules.tools.statisticDashboard.headings.mrhstatistics") }}</h4>
                </div>
                <div class="col-md-auto">
                    <div class="btn-group btn-group-sm me-2">
                        <input
                            id="btnradio3"
                            type="radio"
                            class="btn-check"
                            name="btnradioArea"
                            autocomplete="off"
                            checked
                        >
                        <label
                            class="btn btn-outline-primary"
                            for="btnradio3"
                            role="button"
                            tabindex="0"
                        >{{ $t("common:modules.tools.statisticDashboard.label.communities") }}
                        </label>
                        <input
                            id="btnradio4"
                            type="radio"
                            class="btn-check"
                            name="btnradioArea"
                            autocomplete="off"
                        >
                        <label
                            class="btn btn-outline-primary"
                            for="btnradio4"
                            role="button"
                            tabindex="0"
                        >
                            {{ $t("common:modules.tools.statisticDashboard.label.districts") }}
                        </label>
                    </div>
                </div>
            </div>
            <StatisticFilter
                v-if="loadedFilterData"
                :categories="categories"
                :are-categories-grouped="areCategoriesGrouped"
                :statistics="statisticsByCategory"
                :time-steps-filter="timeStepsFilter"
                :regions="regions"
                @changeCategory="setStatisticsByCategory"
                @changeFilterSettings="handleFilterSettings"
            />
            <div
                v-else
                class="d-flex justify-content-center"
            >
                <div
                    class="spinner-border spinner-color"
                    role="status"
                >
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <hr>
            <Controls
                :descriptions="controlDescription"
                @showChart="toggleChartTable"
                @showTable="toggleChartTable"
            />
            <div
                v-if="typeof referenceTag === 'string'"
                class="reference-tag"
            >
                <span>{{ $t("common:modules.tools.statisticDashboard.reference.tagLabel") }}: </span>
                <button
                    class="btn btn-sm btn-outline-secondary lh-1 rounded-pill shadow-none mt-1 me-2 btn-pb"
                    aria-label="Close"
                    @click="removeReference()"
                    @keydown.enter="removeReference()"
                >
                    {{ referenceTag }}
                    <i class="bi bi-x fs-5 align-middle" />
                </button>
            </div>
            <div v-show="showTable">
                <div v-if="!showGrid">
                    <TableComponent
                        v-for="(data, index) in tableData"
                        :key="index"
                        :data="data"
                        :fixed-data="testFixedData"
                        :select-mode="selectMode"
                        :show-header="showHeader"
                        :sortable="sortable"
                        @setSortedRows="setSortedRows"
                    />
                </div>
                <GridComponent
                    v-else
                    :dates="tableData"
                >
                    <template
                        slot="containers"
                        slot-scope="props"
                    >
                        <TableComponent
                            :data="props.data"
                            :fixed-data="testFixedData"
                            :select-mode="selectMode"
                            :show-header="showHeader"
                            :sortable="sortable"
                            @setSortedRows="setSortedRows"
                        />
                    </template>
                </GridComponent>
            </div>
            <div v-show="showChart">
                <canvas
                    v-if="!showGrid"
                    ref="chart"
                    class="chart-container"
                />
                <GridComponent
                    v-else
                    :charts-count="chartCounts"
                >
                    <template
                        slot="chartContainers"
                        slot-scope="props"
                    >
                        <canvas
                            :ref="'chart' + props.data.id"
                        />
                    </template>
                </GridComponent>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";

.reference-tag {
    float: right;
    margin-top: -20px;
    display: inline-flex;
    > span {
        padding-top: 9px;
        margin-right: 5px;
    }
    button {
        color: $dark_grey;
    }
}
</style>
