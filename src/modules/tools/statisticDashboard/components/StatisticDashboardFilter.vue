<script>
import Multiselect from "vue-multiselect";

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
    emits: ["changeCategory"],
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
            this.$emit("changeCategory", value.name);
        }
    },
    methods: {

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
         * Remove a existing statistic.
         * @param {String} name - The name of the statistic.
         * @returns {void}
         */
        removeStatistic (name) {
            this.selectedStatistics = this.selectedStatistics.filter(statisticName => statisticName !== name);
        },

        /**
         * Reset all statistics.
         * @returns {void}
         */
        resetStatistics () {
            this.selectedStatistics = [];
        }
    }
};
</script>

<template>
    <div>
        <h5 class="heading-dashboard">
            {{ selectedCategoryName }}
        </h5>
        <div class="filtercontainer text-left mt-4">
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
                        :allow-empty="false"
                        :multiple="false"
                        :group-values="areCategoriesGrouped ? 'categories' : ''"
                        :group-label="areCategoriesGrouped ? 'name' : ''"
                        :group-select="false"
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
                        :allow-empty="false"
                        :preselect-first="true"
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
                        :allow-empty="false"
                        :preselect-first="true"
                        label="label"
                        track-by="value"
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
</template>

<style lang="scss" scoped>
    @import "~variables";

    .heading-dashboard {
        font-family: "MasterPortalFont Bold";
        color: $light_blue;
    }

     .dropdown-menu > li > .dropdown-item:focus, .dropdown-menu > li > .dropdown-item:active, .selected {
        background-color: $light_blue;
        color: $white;
    }
    .dropdown-menu > li > .dropdown-item:hover {
        background: $light_grey;
        color: $black;
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
</style>

<style lang="scss">
@import "~variables";

.filtercontainer .multiselect, .filtercontainer .multiselect__input, .filtercontainer .multiselect__single {
    font-family: inherit;
    font-size: 11px;
}
.filtercontainer .multiselect__tags, .filtercontainer .multiselect__tag {
  font-size: 11px;
}

.filtercontainer .multiselect__tag {
    border-radius: 25px;
    padding-top: 5px;
}

.filtercontainer .multiselect__option--selected.multiselect__option--highlight,
.filtercontainer .multiselect__option--selected.multiselect__option--highlight:after,
.filtercontainer .multiselect__option:after,
.filtercontainer .multiselect__option--selected,
.filtercontainer .multiselect__option--selected:after,
.filtercontainer .multiselect__tag
 {
  background: $light_blue;
  color: $white;
  font-weight: normal;
}

.filtercontainer .multiselect__option--highlight,
.filtercontainer .multiselect__option--highlight:after {
    background: $light_grey;
    color: $black;
}

.filtercontainer .multiselect__select {
    height: 30px;
}
</style>
