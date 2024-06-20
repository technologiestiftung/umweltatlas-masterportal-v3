<script>
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import InputText from "../../../shared/modules/inputs/components/InputText.vue";
export default {
    name: "StatisticDashboardLegend",
    components: {
        FlatButton,
        InputText
    },
    emits: ["changeLegendView"],
    data () {
        return {
            classification: [`${this.$t("common:modules.statisticDashboard.legend.equalIntervals")}`, `${this.$t("common:modules.statisticDashboard.legend.quantile")}`, `${this.$t("common:modules.statisticDashboard.legend.customized")}`],
            customColorPalette: [{label: "Blau", colorCode: "#35A9CE"}, {label: "Grün", colorCode: "#1CB82B"}, {label: "Rot", colorCode: "EE0FF2"}, {label: "Orange", colorCode: "#FAB505"}],
            opacity: ["50%", "60%", "70%", "80%", "90%", "100%"],
            selectClassification: `${this.$t("common:modules.statisticDashboard.legend.equalIntervals")}`,
            selectNumberOfClasses: 2,
            selectColor: "#ffffff"
        };
    },
    computed: {
        numberOfClasses () {
            return Number(this.selectNumberOfClasses);
        }
    }
};
</script>

<template>
    <div>
        <h5 class="mb-5">
            {{ $t('common:modules.statisticDashboard.legend.editClassification') }}
        </h5>
        <div class="form-floating mb-5">
            <select
                id="classification"
                v-model="selectClassification"
                class="form-select"
            >
                <option
                    v-for="(selected, i) in classification"
                    :key="i"
                    :value="selected"
                    :selected="selected"
                >
                    {{ selected }}
                </option>
            </select>
            <label for="classification">
                {{ $t('common:modules.statisticDashboard.legend.classification') }}
            </label>
        </div>
        <div class="mb-5">
            <label
                for="class-range"
                class="form-label"
            >{{ $t('common:modules.statisticDashboard.legend.numberOfClasses') + ': ' + selectNumberOfClasses }} </label>
            <input
                id="class-range"
                v-model="selectNumberOfClasses"
                type="range"
                class="form-range"
                :min="2"
                :max="8"
            >
            <div class="row justify-content-between">
                <div class="col col-1 ">
                    2
                </div>
                <div class="col col-1">
                    8
                </div>
            </div>
        </div>
        <div v-if="selectClassification !== 'benutzerdefiniert'">
            <div class="form-floating mb-5">
                <select
                    id="custom-color-palette"
                    class="form-select"
                >
                    <option
                        v-for="(color, i) in customColorPalette"
                        :key="i"
                        :value="color"
                        :selected="color"
                    >
                        {{ color.label }}
                    </option>
                </select>
                <label for="custom-color-palette">
                    {{ $t('common:modules.statisticDashboard.legend.colorPalette') }}
                </label>
            </div>
        </div>
        <div
            v-else
            class="mb-5"
        >
            <div
                v-for="index in numberOfClasses"
                id="value-ranges"
                :key="index"
                class="row"
            >
                <InputText
                    :id="'value-range' + index"
                    :label="$t('common:modules.statisticDashboard.legend.range') + ' ' + index"
                    :class="['col', 'col-3']"
                    :placeholder="$t('common:modules.statisticDashboard.legend.range')"
                    type="number"
                    :input="() => event"
                />
                <div
                    class="col col-auto align-self-center my-0"
                >
                    {{ $t('common:modules.statisticDashboard.legend.betweenValues') }}
                </div>
                <InputText
                    :id="'value-range2' + index"
                    :label="$t('common:modules.statisticDashboard.legend.range') + ' ' + index"
                    :class="['col', 'col-3']"
                    :placeholder="$t('common:modules.statisticDashboard.legend.range')"
                    type="number"
                    :input="() => event"
                />
                <InputText
                    :id="'color-range' + index"
                    :model="selectColor"
                    :label="$t('common:modules.statisticDashboard.legend.color')"
                    :class="['col-3', 'ms-md-auto']"
                    :placeholder="$t('common:modules.statisticDashboard.legend.color')"
                    type="color"
                    value="#ffffff"
                    :input="() => selectColor"
                />
            </div>
        </div>
        <div class="form-floating mb-5">
            <select
                id="opacity"
                class="form-select"
            >
                <option
                    v-for="(select, i) in opacity"
                    :key="i"
                    :value="select"
                    :selected="select"
                >
                    {{ select }}
                </option>
            </select>
            <label for="color-palette">
                {{ $t('common:modules.statisticDashboard.legend.opacity') }}
            </label>
        </div>
        <div class="d-flex justify-content-center">
            <FlatButton
                id="back-to-dashboard"
                :aria-label="$t('common:modules.statisticDashboard.legend.back')"
                :text="$t('common:modules.statisticDashboard.legend.back')"
                :icon="'bi bi-check-lg'"
                :class="''"
                :interaction="() => $emit('changeLegendView')"
            />
        </div>
        <div class="d-flex justify-content-center">
            <FlatButton
                id="reset-legend"
                :aria-label="$t('common:modules.statisticDashboard.legend.reset')"
                :text="$t('common:modules.statisticDashboard.legend.reset')"
                :icon="'bi bi-x-circle'"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#class-range {
    accent-color:  $secondary;
    width: 100%;
    appearance: auto;
}

</style>
