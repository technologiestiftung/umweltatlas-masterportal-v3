<script>
import Multiselect from "vue-multiselect";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersStatisticDashboard";
import mutations from "../store/mutationsStatisticDashboard";
import isObject from "../../../shared/js/utils/isObject";
import StatisticSwitcher from "./StatisticDashboardSwitcher.vue";

export default {
    name: "StatisticDashboardDifference",
    components: {
        Multiselect,
        StatisticSwitcher
    },
    props: {
        referenceData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            buttonGroupReference: [{
                name: i18next.t("common:modules.statisticDashboard.label.year")
            },
            {
                name: i18next.t("common:modules.statisticDashboard.label.area")
            }],
            dateOptions: this.referenceData.date,
            regionOptions: this.referenceData.region,
            selectedDate: "",
            selectedRegion: "",
            referenceType: ""
        };
    },
    computed: {
        ...mapGetters("Modules/StatisticDashboard", Object.keys(getters))
    },
    created () {
        document.addEventListener("click", this.handleClickOutside);
    },
    mounted () {
        this.handleReference(this.buttonGroupReference[0].name);
        if (isObject(this.selectedReferenceData)) {
            if (this.selectedReferenceData.type === "date" && isObject(this.selectedReferenceData.value)) {
                this.selectedDate = this.selectedReferenceData.value;
            }
            else if (this.selectedReferenceData.type === "region") {
                this.handleReference(this.buttonGroupReference[1].name);
                this.selectedRegion = this.selectedReferenceData.value;
            }
        }
    },
    beforeUnmount () {
        document.removeEventListener("click", this.handleClickOutside);
    },
    methods: {
        ...mapMutations("Modules/StatisticDashboard", Object.keys(mutations)),

        /**
        * Set the dropdown type.
        * @param {String} value The name of clicked button.
        * @returns {void}
        */
        handleReference (value) {
            this.referenceType = value;
        },

        /**
         * Close this component when click outside.
         * @param {Event} evt - Click event.
         * @returns {void}
         */
        handleClickOutside (evt) {
            if (evt.target.closest(".difference-button")) {
                return;
            }
            document.querySelector(".dropdown-menu").classList.remove("show");
        },
        /**
         * Updates the emit value.
         * @param {String} type The type which is triggered. Can be either "date" or "region".
         * @returns {void}
         */
        updateSelectedReferenceData (type) {
            let selectedReferenceData;

            if (type === "date") {
                selectedReferenceData = this.selectedDate ? {
                    type: "date",
                    value: this.selectedDate
                } : undefined;
                this.selectedRegion = "";
            }
            else if (type === "region") {
                selectedReferenceData = this.selectedRegion ? {
                    type: "region",
                    value: this.selectedRegion
                } : undefined;
                this.selectedDate = "";
            }

            this.setSelectedReferenceData(selectedReferenceData);
        }
    }
};
</script>

<template>
    <div class="col-md-12">
        <div class="row">
            <div class="col-md-12">
                <h4>{{ $t("common:modules.statisticDashboard.reference.title") }}</h4>
            </div>
            <div class="col-md-12">
                <StatisticSwitcher
                    :buttons="buttonGroupReference"
                    :pre-checked-value="referenceType"
                    group="referenceGroup"
                    @show-view="handleReference"
                />
            </div>
            <div
                v-if="referenceType === buttonGroupReference[0].name"
                class="col-md-12 mt-2"
            >
                <Multiselect
                    v-model="selectedDate"
                    :multiple="false"
                    :options="dateOptions"
                    :searchable="false"
                    :show-labels="false"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    label="label"
                    track-by="label"
                    @select="updateSelectedReferenceData('date')"
                />
            </div>
            <div
                v-else
                class="col-md-12  mt-2"
            >
                <Multiselect
                    id="reference-value"
                    v-model="selectedRegion"
                    :multiple="false"
                    :options="regionOptions"
                    :searchable="false"
                    :show-labels="false"
                    :placeholder="$t('common:modules.statisticDashboard.reference.placeholder')"
                    @select="updateSelectedReferenceData('region')"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.bootstrap-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 8px;
    width: 28px;
    &:hover {
        color: $white;
        background-color: $light_blue;
    }
}
.btn-group {
    margin-top: 0.5rem;
    margin-bottom: 0.8rem;
}
</style>

<style lang="scss">
@import "~variables";

.multiselect, .multiselect__input, .multiselect__single {
    font-family: inherit;
    font-size: 11px;
}
</style>
