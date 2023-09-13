<script>
import Multiselect from "vue-multiselect";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersStatisticDashboard";
import mutations from "../store/mutationsStatisticDashboard";

export default {
    name: "StatisticDashboardDifference",
    components: {
        Multiselect
    },
    props: {
        referenceData: {
            type: Object,
            required: true
        }
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
    created () {
        this.optionData = this.referenceData[this.referenceType];
    },
    methods: {
        ...mapMutations("Tools/StatisticDashboard", Object.keys(mutations))
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
                <div class="btn-group btn-group-sm me-2">
                    <input
                        id="reference-year"
                        v-model="referenceType"
                        type="radio"
                        class="btn-check"
                        name="btnradioDifference"
                        value="year"
                        autocomplete="off"
                    >
                    <label
                        class="btn btn-outline-primary"
                        for="reference-year"
                        role="button"
                        tabindex="0"
                    >{{ $t("common:modules.tools.statisticDashboard.label.year") }}
                    </label>
                    <input
                        id="reference-area"
                        v-model="referenceType"
                        type="radio"
                        class="btn-check"
                        name="btnradioDifference"
                        value="area"
                        autocomplete="off"
                    >
                    <label
                        class="btn btn-outline-primary"
                        for="reference-area"
                        role="button"
                        tabindex="0"
                    >
                        {{ $t("common:modules.tools.statisticDashboard.label.area") }}
                    </label>
                </div>
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
                    label="label"
                    track-by="value"
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
        background-color: $primary;
    }
}
.btn-group {
    margin-top: 0.5rem;
    margin-bottom: 0.8rem;
}
</style>
