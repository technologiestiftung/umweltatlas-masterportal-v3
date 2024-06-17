<script>
import Multiselect from "vue-multiselect";
import isObject from "../../../shared/js/utils/isObject";
import {mapGetters, mapMutations} from "vuex";
import AccordionItem from "../../../shared/modules/accordion/components/AccordionItem.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";

export default {
    name: "StatisticDashboardFilter",
    components: {
        Multiselect,
        AccordionItem,
        FlatButton
    },
    props: {
        categories: {
            type: Array,
            required: false,
            default: () => []
        },
        areCategoriesGrouped: {
            type: Boolean,
            required: false,
            default: false
        },
        timeStepsFilter: {
            type: Array,
            required: false,
            default: () => []
        },
        statistics: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        regions: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    emits: ["changeCategory", "changeFilterSettings", "resetStatistics", "toggleFilter"],

    computed: {
        /**
         * Gets the names of the statistics.
         * @returns {Object[]} The names.
         */
        statisticsNames () {
            if (this.statistics) {
                return Object.keys(this.statistics).map(key => {
                    return {
                        key: key,
                        name: this.statistics[key]?.name
                    };
                });
            }
            return [];
        },

        /**
         * Gets the names of the selected statistics
         * @returns {Object[]} The selected names.
         */
        selectedStatisticsNames () {
            if (this.statistics) {
                return Object.keys(this.selectedStatistics).map(key => {
                    return {
                        key: key,
                        name: this.statistics[key]?.name
                    };
                });
            }
            return [];
        },

        ...mapGetters("Modules/StatisticDashboard", ["selectedCategories", "selectedRegions", "selectedRegionsValues", "selectedDates", "selectedDatesValues", "selectedStatistics", "selectedReferenceData"])
    },

    watch: {
        /**
         * Resets the statistics and emits the name of the selected category.
         * @param {Object} value - The selected category.
         * @returns {void}
         */
        selectedCategories: {
            handler (value) {
                this.setSelectedStatistics({});
                this.$emit("changeCategory", value?.name);
            },
            deep: true
        },

        selectedStatistics: {
            handler (value) {
                this.emitFilterSettings(value, this.selectedRegionsValues, this.selectedDatesValues);
            },
            deep: true
        },
        selectedDates: {
            handler () {
                this.emitFilterSettings(this.selectedStatistics, this.selectedRegionsValues, this.selectedDatesValues);
            },
            deep: true
        },
        selectedRegions: {
            handler () {
                this.emitFilterSettings(this.selectedStatistics, this.selectedRegionsValues, this.selectedDatesValues);
            },
            deep: true
        }
    },

    mounted () {
        this.emitFilterSettings(this.selectedStatistics, this.selectedRegionsValues, this.selectedDatesValues);
    },

    methods: {
        ...mapMutations("Modules/StatisticDashboard", ["setSelectedCategories", "setSelectedRegions", "setSelectedDates", "setSelectedStatistics"]),

        /**
         * Checks if all filter settings are selected.
         * @param {Object[]} statistics - The selected statistics.
         * @param {String[]} regions - The names of the selected regions.
         * @param {Object[]} dates - The selected dates.
         * @return {Number} 1 if true otherwise 0.
         */
        allFilterSettingsSelected (statistics, regions, dates) {
            return isObject(statistics) && Object.keys(statistics).length && regions.length && dates.length;
        },

        /**
         * Emits the filter settings if all are selected.
         * @param {Object[]} statistics - The selected statistics.
         * @param {String[]} regions - The names of the selected regions.
         * @param {Object[]} dates - The selected dates.
         * @return {void}
         */
        emitFilterSettings (statistics, regions, dates) {
            if (this.allFilterSettingsSelected(statistics, regions, dates)) {
                this.$emit("changeFilterSettings", regions, dates, this.selectedReferenceData);
            }
            else {
                this.$emit("resetStatistics");
            }
        },

        /**
         * Adds the given statistics
         * @param {Object[]} statistics - The statistics to add.
         * @returns {void}
         */
        addStatisticToSelect (statistics) {
            this.setSelectedStatistics({});
            statistics.forEach(statistic => {
                this.selectedStatistics[statistic?.key] = this.statistics[statistic?.key];
            });
        }
    }
};
</script>

<template>
    <div>
        <h4 class="mb-1">
            {{ $t("common:modules.statisticDashboard.headings.addFilter") }}
        </h4>
        <AccordionItem
            id="filter-accordion-statistic"
            title="Statistiken"
            :is-open="true"
            :font-size="'font-size-base'"
        >
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="categoryfilter"
                >
                    {{ $t("common:modules.statisticDashboard.label.category") }}</label>
                <Multiselect
                    id="categoryfilter"
                    :model-value="selectedCategories"
                    :options="categories"
                    :searchable="true"
                    :close-on-select="true"
                    :show-labels="false"
                    :allow-empty="true"
                    :multiple="false"
                    :group-values="areCategoriesGrouped ? 'categories' : ''"
                    :group-label="areCategoriesGrouped ? 'name' : ''"
                    :group-select="false"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    track-by="name"
                    label="name"
                    @update:model-value="setSelectedCategories"
                />
            </div>
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="dropdownButton"
                >
                    {{ $t("common:modules.statisticDashboard.label.statistics") }}
                </label>
                <Multiselect
                    id="statisticfilter"
                    :model-value="selectedStatisticsNames"
                    :options="statisticsNames"
                    :searchable="true"
                    :close-on-select="true"
                    :show-labels="false"
                    :allow-empty="true"
                    :multiple="true"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    :limit="3"
                    :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                    track-by="key"
                    label="name"
                    @update:model-value="addStatisticToSelect"
                />
            </div>
        </AccordionItem>
        <AccordionItem
            id="filter-accordion-region"
            title="Gebiete"
            :is-open="true"
            :font-size="'font-size-base'"
        >
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="categoryfilter"
                >
                    {{ $t("common:modules.statisticDashboard.label.area") }}</label>
                <Multiselect
                    id="areafilter"
                    :model-value="selectedRegions"
                    :multiple="true"
                    :options="regions"
                    :searchable="false"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :show-labels="false"
                    :limit="3"
                    :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                    :allow-empty="true"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    label="label"
                    track-by="label"
                    @update:model-value="setSelectedRegions"
                />
            </div>
        </AccordionItem>
        <AccordionItem
            id="filter-accordion-date"
            title="Jahre"
            :is-open="true"
            :font-size="'font-size-base'"
        >
            <div class="col-sm-12">
                <label
                    class="col-form-label-sm"
                    for="timefilter"
                >
                    {{ $t("common:modules.statisticDashboard.label.year") }}</label>
                <Multiselect
                    id="timefilter"
                    :model-value="selectedDates"
                    :multiple="true"
                    :options="timeStepsFilter"
                    :searchable="false"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :show-labels="false"
                    :limit="3"
                    :limit-text="count => count + ' ' + $t('common:modules.statisticDashboard.label.more')"
                    :allow-empty="true"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    label="label"
                    track-by="label"
                    @update:model-value="setSelectedDates"
                />
            </div>
        </AccordionItem>
        <div class="col-md-12 d-flex justify-content-center mt-2">
            <FlatButton
                :aria-label="$t('common:modules.statisticDashboard.button.back')"
                :interaction="() => $emit('toggleFilter')"
                :text="$t('common:modules.statisticDashboard.button.back')"
                :icon="'bi-check2'"
            />
        </div>
    </div>
</template>

<style lang="scss">
@import "~variables";

.static-dashboard .multiselect, .static-dashboard .multiselect__tags {
    font-family: inherit;
    font-size: 11px;
}

.static-dashboard .multiselect__strong{
    font-family: "MasterPortalFont Bold";
}

.static-dashboard .multiselect__tag {
        border-radius: 25px;
        padding-top: 5px;
        .multiselect__tag-icon:hover {
            background-color: $dark-blue;
        }
}

.static-dashboard .multiselect__option--selected.multiselect__option--highlight,
.static-dashboard .multiselect__option--selected.multiselect__option--highlight:after,
.static-dashboard .multiselect__option:after,
.static-dashboard .multiselect__option--selected,
.static-dashboard .multiselect__option--selected:after,
.static-dashboard .multiselect__tag {
  background: $light-blue;
  color: $black;
  font-weight: normal;
}

.static-dashboard .multiselect__option--highlight,
.static-dashboard .multiselect__option--highlight:after {
    background: $dark-blue;
}

.static-dashboard .multiselect__select {
    height: 30px;
}
</style>
