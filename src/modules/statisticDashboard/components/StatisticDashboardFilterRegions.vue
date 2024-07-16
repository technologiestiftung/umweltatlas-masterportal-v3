<script>
import Multiselect from "vue-multiselect";
import {mapGetters, mapMutations} from "vuex";
import {rawLayerList} from "@masterportal/masterportalapi";
import getOAFFeature from "../../../shared/js/api/oaf/getOAFFeature";
import {getUniqueValuesFromFetchedFeatures as getUniqueValuesFromOAF} from "../../filter/utils/fetchAllOafProperties";
import FetchDataHandler from "../js/fetchData.js";
import {
    equalTo as equalToFilter,
    or as orFilter
} from "ol/format/filter";
import {getFeaturePOST} from "../../../shared/js/api/wfs/getFeature.js";
import WFS from "ol/format/WFS";
import sortBy from "../../../shared/js/utils/sortBy";

export default {
    name: "StatisticDashboardFilterRegions",
    components: {
        Multiselect
    },
    props: {
        regions: {
            type: Array,
            required: true
        },
        selectedLevel: {
            type: Object,
            required: false,
            default: () => {
                return {};
            }
        }
    },

    computed: {
        ...mapGetters("Maps", ["projection"])
    },

    methods: {
        ...mapMutations("Modules/StatisticDashboard", ["setSelectedRegions"]),

        /**
         * Checks whether the region has child.
         * @param {Object} region - The region to be checked.
         * @returns {Boolean} True if it has child otherwise false.
         */
        hasRegionChild (region) {
            return Object.prototype.hasOwnProperty.call(region, "child");
        },

        /**
         * Gets the regions sorted with the selected ones first.
         * @param {Object[]} regions The regions array.
         * @param {Object[]} selectedRegions The selected regions.
         * @returns {Object[]} the regions sorted.
         */
        getRegionsSorted (regions, selectedRegions) {
            if (!regions?.length || !Array.isArray(selectedRegions)) {
                return [];
            }
            const notSelectedRegions = regions.filter(region => !selectedRegions.some(selectedRegion => selectedRegion.label === region.label)),
                sortedRegions = sortBy([...selectedRegions, ...notSelectedRegions], "value");

            return sortedRegions;
        },

        /**
         * Sets the selected value(s) to the region and updates the values of its child under certain conditions.
         * @param {Object[]} value - The value to select.
         * @param {Object} region - The region.
         * @returns {void}
         */
        async setSelectedValuesToRegion (value, region) {
            region.selectedValues = value;

            if (!this.hasRegionChild(region)) {
                this.setSelectedRegions(region.selectedValues);
            }
            else if (this.hasRegionChild(region) && !region.selectedValues.length) {
                region.child.values = [];
                this.setSelectedValuesToRegion([], region.child);
            }
            else {
                const {url, collection, typ, featureType, featureNS} = rawLayerList.getLayerWhere({id: this.selectedLevel.layerId});
                let uniqueValues;

                if (typ === "OAF") {
                    const filter = this.getFilterOAF(region.attrName, region.selectedValues),
                        features = await getOAFFeature.getOAFFeatureGet(url, collection, 400, filter, this.selectedLevel.oafRequestCRS, this.selectedLevel.oafRequestCRS, [region.child.attrName], true),
                        fetchedProperties = features.map(feature => feature?.properties);

                    uniqueValues = getUniqueValuesFromOAF(fetchedProperties, [region.child.attrName], true);
                }
                else {
                    const payload = {
                            featureTypes: [featureType],
                            featureNS: featureNS,
                            srsName: this.projection.getCode(),
                            propertyNames: [region.child.attrName],
                            filter: this.getFilterWFS(region.attrName, region.selectedValues)
                        },
                        features = await getFeaturePOST(url, payload, error => {
                            console.error(error);
                        }),
                        olFeatures = new WFS().readFeatures(features),
                        attributesWithType = await FetchDataHandler.getAttributesWithType(url, [region.child.attrName], featureType);

                    uniqueValues = FetchDataHandler.getUniqueValuesFromFeatures(olFeatures, attributesWithType);
                }

                region.child.values = Object.keys(uniqueValues[region.child.attrName]).map(key => {
                    return {label: key, value: key};
                });

                if (region.child.selectedValues.length) {
                    const udpatedSelectedValues = this.updatesRegionSelectedValues(region.child.selectedValues, region.child.values);

                    this.setSelectedValuesToRegion(udpatedSelectedValues, region.child);
                }

            }
        },

        /**
         * Checks whether the selected values still exist in the value list.
         * If not, they are removed and an updated list is returned.
         * @param {Object[]} selectedValues - Current list of selected values.
         * @param {Object[]} values - The value list.
         * @returns {Object[]} Updated list of selected values.
         */
        updatesRegionSelectedValues (selectedValues, values) {
            const updatedSelectedValues = [];

            selectedValues.forEach(selectedValue => {
                const stillExist = values.findIndex(value => value.label === selectedValue.label);

                if (stillExist !== -1) {
                    updatedSelectedValues.push(selectedValue);
                }
            });

            return updatedSelectedValues;
        },

        /**
         * Updates the top level region selected values.
         * @param {Object} region - The top level region.
         * @param {Object} value - Value to add or remove.
         * @returns {void}
         */
        updatesTopLevelRegionSelectedValues (value, region) {
            const selectedValues = region.selectedValues,
                indexOfValue = selectedValues.map(selectedValue => selectedValue.value).indexOf(value.value);

            if (indexOfValue !== -1) {
                selectedValues.splice(indexOfValue, 1);
            }
            else {
                selectedValues.push(value);
            }
            this.setSelectedValuesToRegion(selectedValues, region);
        },

        /**
         * Gets an oaf filter for given list and property.
         * If given list has more than one entry the function returns an or Filter.
         * @param {String} propertyName - The propertyName to create a filter for.
         * @param {String[]} list - The list to create a filter for.
         * @returns {String} The oaf filter.
         */
        getFilterOAF (propertyName, list) {
            let filter = "";

            list.forEach((value, idx) => {
                filter += `${propertyName}='${value.value}'`;
                if (idx < list.length - 1) {
                    filter += " OR ";
                }
            });
            return filter;
        },

        /**
         * Gets a wfs filter for given list and property.
         * If given list has more than one entry the function returns an
         * Or Filter otherwise an EqualTo Filter.
         * @param {String} propertyName - The propertyName to create a filter for.
         * @param {String[]} list - The list to create a filter for.
         * @returns {ol/format/filter} The filter.
         */
        getFilterWFS (propertyName, list) {
            const filterArray = list.map(entry => equalToFilter(propertyName, entry.value));

            return filterArray.length > 1 ? orFilter(...filterArray) : filterArray[0];
        },

        /**
         * Sets or resets the "active-button" class if the given value is selected.
         * @param {Object} value - The value that is checked.
         * @param {Object[]} selectedValues - The selected values.
         * @returns {String} The css class.
         */
        toggleButtonActive (value, selectedValues) {
            const indexOfValue = selectedValues.map(selectedValue => selectedValue.value).indexOf(value.value);

            if (indexOfValue !== -1) {
                return "active-button";
            }
            return "";
        }
    }
};
</script>

<template>
    <template
        v-for="(region, index) in regions"
        :key="region.attrName"
    >
        <div
            v-if="hasRegionChild(region) && index === 0"
            class="col-sm-12 mb-2"
        >
            <label
                class="col-form-label-sm mb-1"
                :for="'top-region-filter-' + index"
            >
                {{ region.name }}
            </label>
            <br>
            <button
                v-for="(value, idx) in region.values"
                :id="'top-region-filter' + index"
                :key="idx"
                class="btn btn-sm btn-outline-secondary lh-1 rounded-pill me-2 mb-2 p-2"
                :class="toggleButtonActive(value, region.selectedValues)"
                @click="updatesTopLevelRegionSelectedValues(value, region)"
            >
                {{ value.label }}
            </button>
        </div>
        <div
            v-else
            class="col-sm-12 mb-2"
        >
            <label
                class="col-form-label-sm mb-1"
                :for="'region-filter-' + index"
            >
                {{ region.name }}
            </label>
            <Multiselect
                :id="'region-filter' + index"
                :model-value="region.selectedValues"
                :multiple="true"
                :options="getRegionsSorted(region.values, region.selectedValues)"
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
                @update:model-value="setSelectedValuesToRegion($event, region)"
            >
                <template #clear>
                    <div class="multiselect__clear">
                        <i class="bi bi-search" />
                    </div>
                </template>
            </Multiselect>
        </div>
    </template>
</template>

<style lang="scss" scoped>
@import "~variables";
    .active-button {
        background: $light-blue;
        color: $black;
        border-color: $light-blue;
    }
</style>

