<script>
import Multiselect from "vue-multiselect";
import isObject from "../../../../utils/isObject";

export default {
    name: "StatisticDashboardFilter",
    components: {
        Multiselect
    },
    props: {
        categories: {
            type: Array,
            required: true
        },
        areCategoriesGrouped: {
            type: Boolean,
            required: true
        },
        timeStepsFilter: {
            type: Array,
            required: true
        },
        statistics: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        regions: {
            type: Array,
            required: true
        }
    },
    emits: ["changeCategory", "changeFilterSettings"],
    data () {
        return {
            selectedCategory: undefined,
            selectedRegions: [],
            selectedDates: [],
            selectedStatistics: []
        };
    },
    computed: {
        /**
         * Gets the name of the selected category.
         * @returns {String} The name.
         */
        selectedCategoryName () {
            return typeof this.selectedCategory?.name !== "undefined" ? this.selectedCategory.name : "";
        },

        /**
         * Gets the names of the current available statistics.
         * @returns {String[]} The names.
         */
        statisticsNames () {
            if (!this.statistics) {
                return [];
            }
            return Object.keys(this.statistics).map(key => this.statistics[key].name);
        }
    },
    watch: {
        /**
         * Resets the statistics and emits the name of the selected category.
         * @param {Object} value - The selected category.
         * @returns {void}
         */
        selectedCategory (value) {
            this.resetStatistics();
            this.$emit("changeCategory", value?.name);
        },

        selectedStatistics (value) {
            this.emitFilterSettings(value, this.selectedRegions, this.collectDatesValues(this.selectedDates));
        },
        selectedDates (value) {
            this.emitFilterSettings(this.selectedStatistics, this.selectedRegions, this.collectDatesValues(value));
        },
        selectedRegions (value) {
            this.emitFilterSettings(this.selectedStatistics, value, this.collectDatesValues(this.selectedDates));
        }
    },
    methods: {
        /**
         * Checks if all filter settings are selected.
         * @param {String[]} statistics - The names of the selected statistics.
         * @param {String[]} regions - The names of the selected regions.
         * @param {Object[]} dates - The selected dates.
         * @return {Number} 1 if true otherwise 0.
         */
        allFilterSettingsSelected (statistics, regions, dates) {
            return statistics.length && regions.length && dates.length;
        },

        /**
         * Emits the filter settings if all are selected.
         * @param {String[]} statistics - The names of the selected statistics.
         * @param {String[]} regions - The names of the selected regions.
         * @param {Object[]} dates - The selected dates.
         * @return {void}
         */
        emitFilterSettings (statistics, regions, dates) {
            if (this.allFilterSettingsSelected(statistics, regions, dates)) {
                this.$emit("changeFilterSettings", statistics, regions, dates);
            }
        },

        /**
         * Collects the dates values.
         * @param {Object[]} dates - The selected dates.
         * @return {String[]} The values of the selected dates.
         */
        collectDatesValues (dates) {
            const datesValues = [];

            dates.forEach(date => {
                if (!isObject(date)) {
                    return;
                }
                if (Array.isArray(date.value)) {
                    datesValues.push(...date.value);
                }
                else {
                    datesValues.push(date.value);
                }
            });
            return datesValues;
        },

        /**
         * Add or remove a statistic.
         * @param {String} name - The name of the statistic.
         * @returns {void}
         */
        toggleStatistic (name) {
            if (!this.selectedStatistics.includes(name)) {
                this.selectedStatistics.push(name);
            }
            else {
                this.removeStatistic(name);
            }
        },

        /**
         * Removes an existing statistic.
         * @param {String} name - The name of the statistic.
         * @returns {void}
         */
        removeStatistic (name) {
            this.selectedStatistics = this.selectedStatistics.filter(statisticName => statisticName !== name);
        },

        /**
         * Resets all statistics.
         * @returns {void}
         */
        resetStatistics () {
            this.selectedStatistics = [];
        }
    }
};
</script>

<template>
    <div
        id="accordionFilter"
        class="accordion"
    >
        <div class="accordion-item py-0">
            <h5 class="heading-dashboard">
                <button
                    class="accordion-button my-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseFilter"
                    aria-expanded="true"
                    aria-controls="collapseFilter"
                >
                    {{ $t("common:modules.tools.statisticDashboard.button.filter") }} - {{ selectedCategoryName }}
                </button>
            </h5>
        </div>
        <div
            id="collapseFilter"
            class="accordion-collapse collapse show py-0"
            aria-labelledby="headingFilter"
            data-bs-parent="#accordionExample"
        >
            <div class="accordion-body py-0">
                <div class="filtercontainer text-left mt-1">
                    <div class="row mb-2">
                        <div class="col-md">
                            <label
                                class="col-form-label-sm"
                                for="categoryfilter"
                            >
                                {{ $t("common:modules.tools.statisticDashboard.label.category") }}</label>
                            <Multiselect
                                id="categoryfilter"
                                v-model="selectedCategory"
                                :options="categories"
                                :searchable="true"
                                :close-on-select="true"
                                :show-labels="false"
                                :allow-empty="true"
                                :multiple="false"
                                :group-values="areCategoriesGrouped ? 'categories' : ''"
                                :group-label="areCategoriesGrouped ? 'name' : ''"
                                :group-select="false"
                                :placeholder="$t('common:modules.tools.statisticDashboard.reference.placeholder')"
                                track-by="name"
                                label="name"
                            />
                        </div>
                        <div
                            class="col-md"
                        >
                            <label
                                class="col-form-label-sm"
                                for="areafilter"
                            >{{ $t("common:modules.tools.statisticDashboard.label.area") }}
                            </label>
                            <Multiselect
                                id="areafilter"
                                v-model="selectedRegions"
                                :multiple="true"
                                :options="regions"
                                :searchable="false"
                                :close-on-select="false"
                                :clear-on-select="false"
                                :show-labels="false"
                                :allow-empty="true"
                                :placeholder="$t('common:modules.tools.statisticDashboard.reference.placeholder')"
                            />
                        </div>
                        <div
                            class="col-md"
                        >
                            <label
                                class="col-form-label-sm"
                                for="timefilter"
                            >
                                {{ $t("common:modules.tools.statisticDashboard.label.year") }}</label>
                            <Multiselect
                                id="timefilter"
                                v-model="selectedDates"
                                :multiple="true"
                                :options="timeStepsFilter"
                                :searchable="false"
                                :close-on-select="false"
                                :clear-on-select="false"
                                :show-labels="false"
                                :allow-empty="true"
                                :placeholder="$t('common:modules.tools.statisticDashboard.reference.placeholder')"
                                label="label"
                                track-by="label"
                            />
                        </div>
                    </div>
                    <div class="row align-items-end gx-1">
                        <div class="col col-md-auto py-1">
                            <label
                                class="col-form-label-sm"
                                for="dropdownButton"
                            >
                                {{ $t("common:modules.tools.statisticDashboard.label.statistics") }}</label>
                            <div class="dropdown">
                                <button
                                    class="btn btn-sm btn-primary rounded-pill lh-1 me-2"
                                    :v-model="selectedStatistics"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i class="bi bi-plus fs-6 pe-2" />{{ $t("common:modules.tools.statisticDashboard.button.add") }}
                                </button>
                                <ul
                                    class="dropdown-menu"
                                    aria="dropdownButton"
                                >
                                    <li
                                        v-for="name in statisticsNames"
                                        :key="name"
                                        class="dropdown-line"
                                    >
                                        <button
                                            type="button"
                                            class="btn btn-link btn-sm px-2 py-2 dropdown-item"
                                            :class="selectedStatistics.includes(name) ? 'selected' : ''"
                                            @click="toggleStatistic(name)"
                                        >
                                            {{ name }}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="col col-md-auto py-1">
                            <button
                                v-for="index in selectedStatistics"
                                :key="index"
                                class="btn btn-sm btn-outline-secondary lh-1 rounded-pill shadow-none mt-1 me-2 btn-pb"
                                aria-label="Close"
                                @click="removeStatistic(index)"
                            >
                                {{ index }}
                                <i class="bi bi-x fs-5 align-middle" />
                            </button>
                        </div>
                        <div
                            v-if="selectedStatistics.length !== 0"
                            class="col col-md-auto py-1"
                        >
                            <button
                                id="reset-button"
                                type="button"
                                class="btn btn-link btn-sm p-0"
                                @click="resetStatistics()"
                            >
                                {{ $t("common:modules.tools.statisticDashboard.button.reset") }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .dropdown-menu > li {
        > .dropdown-item {
            &:hover {
                background: $light_grey;
                color: $black;
            }
            &:focus, &:active {
                background-color: $light_blue;
                color: $white;
            }
        }
    }

    .selected {
        background-color: $light_blue;
        color: $white;
    }

    .btn-outline-secondary, label {
        color: $dark_grey;
    }

    .btn-pb {
        padding-bottom: 2px;
    }

    .btn-primary, .btn-primary:enabled, .btn-primary:focus {
        background-color: $light_blue;
    }
    .accordion {
        --bs-border-color: $white;
        .accordion-item{
            border: none;
            height: 4.0em;
        }
        .accordion-button {
            font-family: "MasterPortalFont Bold";
            color: $light_blue;
            font-size: 16px;
            width: auto;
            margin-bottom: 0px;
            --bs-accordion-btn-icon-width: 1em;
                &:not(.collapsed) {
                    background-color: $white;
                }
                &::after {
                    margin-left: 10px;
                }
                &::before {
                    margin-left: 0;
                }
                &:focus {
                    box-shadow: none;
                }
        }
    }
</style>

<style lang="scss">
@import "~variables";

.static-dashboard .multiselect, .filtercontainer .multiselect__input, .filtercontainer .multiselect__single {
    font-family: inherit;
    font-size: 11px;
}
.static-dashboard .multiselect__tags, .filtercontainer .multiselect__tag {
  font-size: 11px;
}

.static-dashboard .multiselect__tag {
    border-radius: 25px;
    padding-top: 5px;
}

.static-dashboard .multiselect__option--selected.multiselect__option--highlight,
.static-dashboard .multiselect__option--selected.multiselect__option--highlight:after,
.static-dashboard .multiselect__option:after,
.static-dashboard .multiselect__option--selected,
.static-dashboard .multiselect__option--selected:after,
.static-dashboard .multiselect__tag
 {
  background: $light_blue;
  color: $white;
  font-weight: normal;
}

.static-dashboard .multiselect__option--highlight,
.static-dashboard .multiselect__option--highlight:after {
    background: $light_grey;
    color: $black;
}

.static-dashboard .multiselect__select {
    height: 30px;
}
</style>
