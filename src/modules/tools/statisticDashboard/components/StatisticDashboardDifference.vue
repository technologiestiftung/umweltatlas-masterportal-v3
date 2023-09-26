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
                name: "Jahr"
            },
            {
                name: "Gebiet"
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
            }
        },

        referenceType: {
            get () {
                return this.selectedReferenceData?.type ? this.selectedReferenceData.type : "year";
            },
            set (value) {
                this.selectedValue = [];
                this.optionData = this.referenceData[value];
                this.setSelectedReferenceData({
                    "type": value,
                    "value": []
                });
            }
        }
    },
    watch: {
        selectedReferenceData (oldVal, newVal) {
            if (Array.isArray(oldVal?.value) && !oldVal.value.length && isObject(newVal.value) && newVal.value.value) {
                this.savedReferenceData = newVal;
            }
            else if (isObject(oldVal.value) && oldVal.value.value) {
                this.savedReferenceData = oldVal;
            }
        }
    },
    created () {
        this.optionData = this.referenceData[this.referenceType];
    },
    beforeDestroy () {
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
            this.referenceType = value === "Jahr" ? "year" : "area";
        }
    }
};
</script>

<template>
    <div class="col-md-4">
        <div class="row">
            <span
                ref="close-icon"
                class="bootstrap-icon"
                role="button"
                tabindex="0"
                @click="$emit('showDifference', false)"
                @keydown="$emit('showDifference', false)"
            >
                <i class="bi-x-lg" />
            </span>
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
                    :label="referenceType==='year'? 'label': ''"
                    :track-by="referenceType==='year'? 'label': ''"
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
