<script>
import Multiselect from "vue-multiselect";

export default {
    name: "StatisticDashboardFilter",
    components: {
        Multiselect
    },
    props: {
        category: {
            type: Array,
            required: false,
            default: () => []
        },
        timeStepsFilter: {
            type: Object,
            required: false,
            default: undefined
        },
        subCategory: {
            type: Array,
            required: false,
            default: () => []
        },
        areas: {
            type: Array,
            required: false,
            default: () => []
        }
    },
    data () {
        return {
            dropdownCategorySelected: "",
            dropdownAreaSelected: [],
            dropdownTimeSelected: [],
            dropdownSubcategory: []
        };
    },
    computed: {
        classObject: function () {
            return {
                active: this.isActive && !this.error,
                "text-danger": this.error && this.error.type === "fatal"
            };
        }
    },
    methods: {

        /**
         * Add or remove sub category.
         * @param {String} name - The name of the subcategory.
         * @returns {void}
         */
        toggleSubCategory (name) {
            if (!this.dropdownSubcategory.includes(name)) {
                this.dropdownSubcategory.push(name);
            }
            else {
                this.removeCategory(name);
            }
        },

        /**
         * Remove existing subCategory
         * @param {String} name the name of the subcategory
         * @returns {Object[]} Array of selected subcategories
         */
        removeCategory (name) {
            this.dropdownSubcategory = this.dropdownSubcategory.filter(badge => badge !== name);
            return this.dropdownSubcategory;
        },

        /**
         * Reset all sub categories
         * @returns {Object[]} Array of selected subcategories
         * @returns {void}
         */
        resetCategories () {
            this.dropdownSubcategory = [];
        }

    }
};
</script>

<template>
    <div>
        <h5 class="heading-dashboard">
            {{ dropdownCategorySelected }} - Dashboard
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
                        v-model="dropdownCategorySelected"
                        :options="category"
                        :searchable="false"
                        :close-on-select="true"
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
                        for="areafilter"
                    >{{ $t("common:modules.tools.statisticDashboard.label.area") }}
                    </label>
                    <Multiselect
                        id="areafilter"
                        v-model="dropdownAreaSelected"
                        :multiple="true"
                        :options="areas"
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
                        v-model="dropdownTimeSelected"
                        :multiple="true"
                        :options="Object.values(timeStepsFilter)"
                        :searchable="false"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :show-labels="false"
                        :allow-empty="false"
                        :preselect-first="true"
                    />
                </div>
            </div>
            <div class="row align-items-end gx-1">
                <div class="col col-md-auto py-1">
                    <label
                        class="col-form-label-sm"
                        for="dropdownButton"
                    >
                        {{ $t("common:modules.tools.statisticDashboard.label.subcategory") }}</label>
                    <div class="dropdown">
                        <button
                            class="btn btn-sm btn-primary rounded-pill lh-1 me-2"
                            :v-model="dropdownSubcategory"
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
                                v-for="name in subCategory"
                                :key="name"
                                class="dropdown-line"
                            >
                                <button
                                    type="button"
                                    class="btn btn-link btn-sm px-2 py-2 dropdown-item"
                                    :class="dropdownSubcategory.includes(name) ? 'selected' : ''"
                                    @click="toggleSubCategory(name)"
                                >
                                    {{ name }}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col col-md-auto py-1">
                    <button
                        v-for="index in dropdownSubcategory"
                        :key="index"
                        class="btn btn-sm btn-outline-secondary lh-1 rounded-pill shadow-none mt-1 me-2 btn-pb"
                        aria-label="Close"
                        @click="removeCategory(index)"
                    >
                        {{ index }}
                        <i class="bi bi-x fs-5 align-middle" />
                    </button>
                </div>
                <div
                    v-if="dropdownSubcategory.length !== 0"
                    class="col col-md-auto py-1"
                >
                    <button
                        id="reset-button"
                        type="button"
                        class="btn btn-link btn-sm p-0"
                        @click="resetCategories()"
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

    .dropdown-menu > li > .dropdown-item:hover, .dropdown-menu > li > .dropdown-item:focus, .dropdown-menu > li > .dropdown-item:active, .selected {
        background-color: $light_blue;
        color: #FFFFFF;
    }

    .btn-outline-secondary, label {
        color: $dark_grey;
    }

    .btn-pb {
        padding-bottom: 2px;
    }
</style>

<style lang="scss">
@import "~variables";

.filtercontainer .multiselect, .filtercontainer .multiselect__input, .filtercontainer .multiselect__single {
    font-family: inherit;
    font-size: 11px;
}
.filtercontainer .multiselect__tags, .filtercontainer .multiselect__tag {
  min-height: 20px;
  font-size: 11px;
}

.filtercontainer .multiselect__tag {
    border-radius: 25px;
}

.filtercontainer .multiselect__option--selected.multiselect__option--highlight,
.filtercontainer .multiselect__option--selected.multiselect__option--highlight:after,
.filtercontainer .multiselect__option:after,
.filtercontainer .multiselect__option--selected,
.filtercontainer .multiselect__option--selected:after,
.filtercontainer .multiselect__tag
 {
  background: $light_blue;
  color: #fff;
  font-weight: normal;
}

.filtercontainer .multiselect__option--highlight,
.filtercontainer .multiselect__option--highlight:after {
    background: #D1D1D1;
    color: #000000;
}

</style>
