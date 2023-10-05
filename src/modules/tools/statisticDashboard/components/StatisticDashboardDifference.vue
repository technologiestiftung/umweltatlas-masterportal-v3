<script>
import Multiselect from "vue-multiselect";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersStatisticDashboard";
import mutations from "../store/mutationsStatisticDashboard";
import isObject from "../../../../utils/isObject";
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
            savedReferenceData: {},
            buttonGroupReference: [{
                name: i18next.t("common:modules.tools.statisticDashboard.label.year")
            },
            {
                name: i18next.t("common:modules.tools.statisticDashboard.label.area")
            }]
        };
    },
    computed: {
        ...mapGetters("Tools/StatisticDashboard", Object.keys(getters)),

        selectedValue: {
            get () {
                return this.selectedReferenceData.value;
            },
            set (value) {
                this.setSelectedReferenceData({
                    "type": this.referenceType,
                    "value": value
                });
                if (!Array.isArray(value)) {
                    this.$emit("showDifference", false);
                }
            }
        },

        referenceType: {
            get () {
                return this.selectedReferenceData?.type ? this.selectedReferenceData.type : "date";
            },
            set (value) {
                this.selectedValue = [];
                this.optionData = this.referenceData[value];
                this.setSelectedReferenceData({
                    "type": value,
                    "value": []
                });
            }
        },

        preCheckedValue () {
            return this.referenceType === "date" ? i18next.t("common:modules.tools.statisticDashboard.label.year") : i18next.t("common:modules.tools.statisticDashboard.label.area");
        }

    },
    watch: {
        selectedReferenceData (newVal, oldVal) {
            if (Array.isArray(newVal?.value) && !newVal.value.length && isObject(oldVal?.value) && oldVal.value.value) {
                this.savedReferenceData = oldVal;
            }
            else if (Array.isArray(newVal?.value) && !newVal.value.length && typeof oldVal?.value === "string") {
                this.savedReferenceData = oldVal;
            }
            else if (isObject(newVal?.value) && newVal.value.value) {
                this.savedReferenceData = newVal;
            }
        }
    },
    created () {
        document.addEventListener("click", this.handleClickOutside);
        this.optionData = this.referenceData[this.referenceType];
    },
    beforeDestroy () {
        document.removeEventListener("click", this.handleClickOutside);
        if (Array.isArray(this.selectedReferenceData?.value) && !this.selectedReferenceData.value.length) {
            this.setSelectedReferenceData(this.savedReferenceData);
        }
    },
    methods: {
        ...mapMutations("Tools/StatisticDashboard", Object.keys(mutations)),

        /**
        * Set the referenceType by given button name.
        * @param {String} value The name of clicked button.
        * @returns {void}
        */
        handleReference (value) {
            this.referenceType = value === "Jahr" ? "date" : "region";
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
            this.$emit("showDifference", false);
        }
    }
};
</script>

<template>
    <div class="col-md-4">
        <div class="row">
            <div class="col-md-12">
                <h4>{{ $t("common:modules.tools.statisticDashboard.reference.title") }}</h4>
            </div>
            <div class="col-md-12">
                <span>
                    {{ $t("common:modules.tools.statisticDashboard.reference.description") }}
                </span>
            </div>
            <div class="col-md-12">
                <StatisticSwitcher
                    :buttons="buttonGroupReference"
                    :pre-checked-value="preCheckedValue"
                    group="referenceGroup"
                    @showView="handleReference"
                />
            </div>
            <div class="col-md-12">
                <Multiselect
                    id="reference-value"
                    v-model="selectedValue"
                    :multiple="false"
                    :options="optionData"
                    :searchable="false"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :show-labels="false"
                    :allow-empty="true"
                    :preselect-first="false"
                    :placeholder="$t('common:modules.tools.statisticDashboard.reference.placeholder')"
                    :label="referenceType==='date'? 'label': ''"
                    :track-by="referenceType==='date'? 'label': ''"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~/css/mixins.scss";
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
