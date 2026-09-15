<script>
import i18next from "i18next";
import {mapActions, mapGetters, mapMutations} from "vuex";
import AnalysisBarChart from "./AnalysisBarChart.vue";
import AnalysisPieChart from "./AnalysisPieChart.vue";
import AnalysisTable from "./AnalysisTable.vue";
import FilterValueInput from "./FilterValueInput.vue";
import {formatNumber, getAreaUnit, groupCategories} from "../js/formatResult";

/**
 * Lets the user pick one of the layers currently switched on in the map and
 * analyse one of its attributes - by counting features or by summing their
 * area, optionally restricted to an area such as a district.
 * @module addons/wfsAnalyzer/components/WfsAnalyzer
 */
export default {
    name: "WfsAnalyzer",
    components: {
        AnalysisBarChart,
        AnalysisPieChart,
        AnalysisTable,
        FilterValueInput
    },
    data () {
        return {
            showWhyInfo: false,
            showExtraFilter: false
        };
    },
    computed: {
        ...mapGetters("Modules/WfsAnalyzer", [
            "analyseAttribute",
            "analysisError",
            "analysisStatus",
            "areaAttribute",
            "areaAttributeCandidates",
            "areaFilterAttributes",
            "attributesStatus",
            "canAnalyse",
            "canAnalyseByArea",
            "checkStatus",
            "errorMessage",
            "exceedsMaxFeatures",
            "extraFilterAttribute",
            "extraFilterAttributes",
            "extraFilterValue",
            "featureCount",
            "featureCountStatus",
            "filterAttribute",
            "filterValue",
            "hasCurrentResult",
            "isAnalysable",
            "mode",
            "needsAreaAttributeChoice",
            "reason",
            "result",
            "resultView",
            "selectableAttributes",
            "selectableLayers",
            "selectedLayerId",
            "settings",
            "valuesFor"
        ]),

        /**
         * @returns {Boolean} true while the WFS lookup is running.
         */
        isChecking () {
            return this.checkStatus === "checking";
        },

        /**
         * Covers both waits before the form can be shown: the WFS lookup and the
         * attribute request that follows it.
         * @returns {Boolean} true while either is running.
         */
        isLoading () {
            return this.isChecking || (this.isAnalysable && this.attributesStatus === "loading");
        },

        /**
         * @returns {String} the readable name of the analysed attribute.
         */
        analyseAttributeLabel () {
            const attribute = this.selectableAttributes
                .find((candidate) => candidate.name === this.analyseAttribute);

            return attribute ? attribute.title : this.analyseAttribute;
        },

        /**
         * @returns {String} the translated explanation why the layer has no WFS.
         */
        unavailableText () {
            const key = this.reason === "" ? "noMatchingFeatureType" : this.reason;

            return this.$t(`additional:modules.wfsAnalyzer.unavailable.${key}`);
        },

        /**
         * @returns {Object} the unit used to display areas as {factor, key}.
         */
        areaUnit () {
            return getAreaUnit(this.result?.total || 0);
        },

        /**
         * @returns {String} the header of the value column.
         */
        valueHeader () {
            return this.result?.unit === "area"
                ? `${this.$t("additional:modules.wfsAnalyzer.mode.area")} (${this.$t(`additional:modules.wfsAnalyzer.units.${this.areaUnit.key}`)})`
                : this.$t("additional:modules.wfsAnalyzer.mode.count");
        },

        /**
         * The categories shown in the charts. Long tails are pooled so the
         * charts stay readable; the table always shows everything.
         * @returns {Object[]} the categories for the charts.
         */
        chartCategories () {
            return groupCategories(
                this.namedCategories,
                this.settings.maxChartCategories,
                this.$t("additional:modules.wfsAnalyzer.result.otherCategories")
            );
        },

        /**
         * Replaces empty attribute values with a readable placeholder.
         * @returns {Object[]} the categories with a label.
         */
        namedCategories () {
            return (this.result?.categories || []).map((category) => ({
                ...category,
                label: category.label === ""
                    ? this.$t("additional:modules.wfsAnalyzer.result.noValue")
                    : category.label
            }));
        }
    },
    watch: {
        /**
         * Keeps the dropdown in sync with the map: layers switched off while the
         * tool is open must not stay selected, and a single remaining layer is
         * picked automatically - there is nothing to choose.
         * @returns {void}
         */
        selectableLayers: {
            handler () {
                this.syncSelection();
                this.selectOnlyLayer();
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        ...mapActions("Modules/WfsAnalyzer", [
            "checkWfsAvailability",
            "loadValuesFor",
            "runAnalysis",
            "selectExtraFilterAttribute",
            "selectExtraFilterValue",
            "selectFilterAttribute",
            "selectFilterValue",
            "selectLayer",
            "selectMode",
            "syncSelection"
        ]),
        ...mapMutations("Modules/WfsAnalyzer", [
            "setAnalyseAttribute",
            "setAreaAttribute",
            "setResultView",
            "resetResult"
        ]),

        /**
         * Picks the only analysable layer there is, so the user does not have to
         * confirm a choice of one.
         * @returns {void}
         */
        selectOnlyLayer () {
            if (this.selectedLayerId === "" && this.selectableLayers.length === 1) {
                this.selectLayer(this.selectableLayers[0].id);
            }
        },

        /**
         * Formats a value of the result, including the unit for areas.
         * @param {Number} value the value.
         * @returns {String} the formatted value.
         */
        formatValue (value) {
            const locale = i18next.language || "de";

            if (this.result?.unit === "area") {
                return `${formatNumber(value / this.areaUnit.factor, locale, 2)} ${this.$t(`additional:modules.wfsAnalyzer.units.${this.areaUnit.key}`)}`;
            }

            return formatNumber(value, locale, 0);
        },

        /**
         * Formats a plain number, e.g. the feature count.
         * @param {Number} value the value.
         * @returns {String} the formatted number.
         */
        formatCount (value) {
            return formatNumber(value, i18next.language || "de", 0);
        },

        /**
         * Label of an attribute: the name documented in the WFS schema plus the
         * technical name, which is what ends up in the requests.
         * @param {Object} attribute the attribute as {name, title}.
         * @returns {String} the label.
         */
        getAttributeLabel (attribute) {
            return attribute.title && attribute.title !== attribute.name
                ? `${attribute.title} (${attribute.name})`
                : attribute.name;
        },

        /**
         * Handles a change of the layer dropdown.
         * @param {Event} event the change event.
         * @returns {void}
         */
        onLayerChange (event) {
            this.selectLayer(event.target.value);
        },

        /**
         * Handles a change of the attribute that is analysed.
         * @param {Event} event the change event.
         * @returns {void}
         */
        onAnalyseAttributeChange (event) {
            this.setAnalyseAttribute(event.target.value);
            this.resetResult();
        },

        /**
         * Handles a change of the area attribute.
         * @param {Event} event the change event.
         * @returns {void}
         */
        onAreaAttributeChange (event) {
            this.setAreaAttribute(event.target.value);
            this.resetResult();
        }
    }
};
</script>

<template>
    <div
        id="wfs-analyzer"
        class="d-flex flex-column"
    >
        <div
            v-if="selectableLayers.length === 0"
            class="alert alert-info mb-0"
            role="status"
        >
            <i class="bi bi-info-circle me-2" />
            {{ $t("additional:modules.wfsAnalyzer.noActiveLayers") }}
        </div>

        <template v-else>
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <label
                        class="form-label mb-1"
                        for="wfs-analyzer-layer-select"
                    >
                        {{ $t("additional:modules.wfsAnalyzer.layerSelectLabel") }}
                    </label>
                    <button
                        id="wfs-analyzer-why-toggle"
                        type="button"
                        class="btn btn-link btn-sm p-0 text-decoration-none"
                        :aria-expanded="showWhyInfo"
                        aria-controls="wfs-analyzer-why-info"
                        @click="showWhyInfo = !showWhyInfo"
                    >
                        <i class="bi bi-info-circle me-1" />
                        {{ $t("additional:modules.wfsAnalyzer.whyMissing.toggle") }}
                    </button>
                </div>
                <select
                    id="wfs-analyzer-layer-select"
                    class="form-select"
                    :value="selectedLayerId"
                    @change="onLayerChange"
                >
                    <option value="">
                        {{ $t("additional:modules.wfsAnalyzer.layerSelectPlaceholder") }}
                    </option>
                    <option
                        v-for="layer in selectableLayers"
                        :key="layer.id"
                        :value="layer.id"
                    >
                        {{ layer.name }}
                    </option>
                </select>
                <p
                    v-if="showWhyInfo"
                    id="wfs-analyzer-why-info"
                    class="form-text mb-0"
                >
                    {{ $t("additional:modules.wfsAnalyzer.whyMissing.text") }}
                </p>
            </div>

            <div
                v-if="isLoading"
                class="d-flex align-items-center mb-0"
                role="status"
            >
                <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                />
                {{ $t("additional:modules.wfsAnalyzer.checking") }}
            </div>

            <div
                v-else-if="hasCurrentResult && checkStatus === 'unavailable'"
                class="alert alert-warning mb-0"
                role="status"
            >
                <h6 class="alert-heading">
                    <i class="bi bi-exclamation-triangle-fill me-2" />
                    {{ $t("additional:modules.wfsAnalyzer.unavailable.title") }}
                </h6>
                <p class="mb-0">
                    {{ unavailableText }}
                </p>
            </div>

            <div
                v-else-if="hasCurrentResult && checkStatus === 'error'"
                class="alert alert-danger mb-0"
                role="alert"
            >
                <h6 class="alert-heading">
                    <i class="bi bi-x-circle-fill me-2" />
                    {{ $t("additional:modules.wfsAnalyzer.error.title") }}
                </h6>
                <p class="mb-2">
                    {{ $t("additional:modules.wfsAnalyzer.error.text") }}
                </p>
                <p
                    v-if="errorMessage"
                    class="mb-2 small text-break"
                >
                    {{ errorMessage }}
                </p>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="checkWfsAvailability()"
                >
                    {{ $t("additional:modules.wfsAnalyzer.error.retry") }}
                </button>
            </div>

            <!-- analysis -->
            <div
                v-if="isAnalysable && !isLoading"
                id="wfs-analyzer-analysis"
                class="d-flex flex-column"
            >
                <div
                    v-if="attributesStatus === 'error'"
                    class="alert alert-danger mb-0"
                    role="alert"
                >
                    {{ $t("additional:modules.wfsAnalyzer.analysis.attributesError") }}
                </div>

                <template v-else-if="attributesStatus === 'ready'">
                    <!-- area -->
                    <div
                        v-if="areaFilterAttributes.length > 0"
                        class="mb-3"
                    >
                        <label
                            class="form-label"
                            for="wfs-analyzer-filter-attribute"
                        >
                            {{ $t("additional:modules.wfsAnalyzer.filter.areaLabel") }}
                        </label>
                        <select
                            id="wfs-analyzer-filter-attribute"
                            class="form-select form-select-sm"
                            :value="filterAttribute"
                            @change="selectFilterAttribute($event.target.value)"
                        >
                            <option value="">
                                {{ $t("additional:modules.wfsAnalyzer.filter.wholeLayer") }}
                            </option>
                            <option
                                v-for="attribute in areaFilterAttributes"
                                :key="attribute.name"
                                :value="attribute.name"
                            >
                                {{ attribute.title }}
                            </option>
                        </select>

                        <FilterValueInput
                            v-if="filterAttribute !== ''"
                            id="wfs-analyzer-filter-value"
                            class="mt-2"
                            :label="$t('additional:modules.wfsAnalyzer.filter.valueLabel')"
                            :value="filterValue"
                            :value-state="valuesFor(filterAttribute)"
                            @load="loadValuesFor(filterAttribute)"
                            @change="selectFilterValue"
                        />
                    </div>

                    <!-- what to analyse -->
                    <div class="mb-3">
                        <label
                            class="form-label"
                            for="wfs-analyzer-analyse-attribute"
                        >
                            {{ $t("additional:modules.wfsAnalyzer.analysis.attributeLabel") }}
                        </label>
                        <select
                            id="wfs-analyzer-analyse-attribute"
                            class="form-select form-select-sm"
                            :value="analyseAttribute"
                            @change="onAnalyseAttributeChange"
                        >
                            <option value="">
                                {{ $t("additional:modules.wfsAnalyzer.analysis.attributePlaceholder") }}
                            </option>
                            <option
                                v-for="attribute in selectableAttributes"
                                :key="attribute.name"
                                :value="attribute.name"
                            >
                                {{ getAttributeLabel(attribute) }}
                            </option>
                        </select>
                    </div>

                    <!-- count or area -->
                    <div
                        v-if="canAnalyseByArea"
                        class="mb-3"
                    >
                        <span class="form-label d-block">
                            {{ $t("additional:modules.wfsAnalyzer.mode.title") }}
                        </span>
                        <div
                            class="btn-group btn-group-sm"
                            role="group"
                        >
                            <button
                                v-for="option in ['count', 'area']"
                                :id="`wfs-analyzer-mode-${option}`"
                                :key="option"
                                type="button"
                                class="btn"
                                :class="mode === option ? 'btn-primary' : 'btn-outline-primary'"
                                @click="selectMode(option)"
                            >
                                {{ $t(`additional:modules.wfsAnalyzer.mode.${option}`) }}
                            </button>
                        </div>

                        <template v-if="mode === 'area' && needsAreaAttributeChoice">
                            <label
                                class="form-label mt-2"
                                for="wfs-analyzer-area-attribute"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.mode.areaAttributeLabel") }}
                            </label>
                            <select
                                id="wfs-analyzer-area-attribute"
                                class="form-select form-select-sm"
                                :value="areaAttribute"
                                @change="onAreaAttributeChange"
                            >
                                <option
                                    v-for="attribute in areaAttributeCandidates"
                                    :key="attribute.name"
                                    :value="attribute.name"
                                >
                                    {{ getAttributeLabel(attribute) }}
                                </option>
                            </select>
                        </template>
                    </div>

                    <!-- optional additional filter -->
                    <div class="mb-3">
                        <button
                            id="wfs-analyzer-extra-toggle"
                            type="button"
                            class="btn btn-link btn-sm p-0 text-decoration-none"
                            :aria-expanded="showExtraFilter"
                            aria-controls="wfs-analyzer-extra-filter"
                            @click="showExtraFilter = !showExtraFilter"
                        >
                            <i
                                class="bi me-1"
                                :class="showExtraFilter ? 'bi-chevron-down' : 'bi-chevron-right'"
                            />
                            {{ $t("additional:modules.wfsAnalyzer.filter.extraTitle") }}
                        </button>

                        <div
                            v-if="showExtraFilter"
                            id="wfs-analyzer-extra-filter"
                            class="mt-2"
                        >
                            <select
                                id="wfs-analyzer-extra-attribute"
                                class="form-select form-select-sm"
                                :value="extraFilterAttribute"
                                @change="selectExtraFilterAttribute($event.target.value)"
                            >
                                <option value="">
                                    {{ $t("additional:modules.wfsAnalyzer.filter.extraAttributePlaceholder") }}
                                </option>
                                <option
                                    v-for="attribute in extraFilterAttributes"
                                    :key="attribute.name"
                                    :value="attribute.name"
                                >
                                    {{ getAttributeLabel(attribute) }}
                                </option>
                            </select>

                            <FilterValueInput
                                v-if="extraFilterAttribute !== ''"
                                id="wfs-analyzer-extra-value"
                                class="mt-2"
                                :label="$t('additional:modules.wfsAnalyzer.filter.valueLabel')"
                                :value="extraFilterValue"
                                :value-state="valuesFor(extraFilterAttribute)"
                                @load="loadValuesFor(extraFilterAttribute)"
                                @change="selectExtraFilterValue"
                            />
                        </div>
                    </div>

                    <p
                        v-if="featureCountStatus === 'ready'"
                        class="small mb-2"
                    >
                        {{ $t("additional:modules.wfsAnalyzer.analysis.featureCount", {count: formatCount(featureCount)}) }}
                    </p>

                    <div
                        v-if="exceedsMaxFeatures"
                        class="alert alert-warning py-2 small"
                        role="status"
                    >
                        {{ $t("additional:modules.wfsAnalyzer.analysis.manyFeatures", {max: formatCount(settings.maxFeatures)}) }}
                    </div>

                    <button
                        type="button"
                        class="btn btn-primary btn-sm align-self-start"
                        :disabled="!canAnalyse || analysisStatus === 'running'"
                        @click="runAnalysis()"
                    >
                        <span
                            v-if="analysisStatus === 'running'"
                            class="spinner-border spinner-border-sm me-1"
                            aria-hidden="true"
                        />
                        {{ $t("additional:modules.wfsAnalyzer.analysis.start") }}
                    </button>

                    <div
                        v-if="analysisStatus === 'error'"
                        class="alert alert-danger mt-3 mb-0"
                        role="alert"
                    >
                        <p class="mb-1">
                            {{ $t("additional:modules.wfsAnalyzer.analysis.failed") }}
                        </p>
                        <p
                            v-if="analysisError"
                            class="mb-0 small text-break"
                        >
                            {{ analysisError }}
                        </p>
                    </div>

                    <!-- result -->
                    <div
                        v-if="analysisStatus === 'ready' && result"
                        class="mt-3 pt-3 border-top"
                    >
                        <div
                            v-if="result.categories.length === 0"
                            class="alert alert-info mb-0"
                            role="status"
                        >
                            {{ $t("additional:modules.wfsAnalyzer.result.empty") }}
                        </div>

                        <template v-else>
                            <h6 class="mb-1">
                                {{ $t("additional:modules.wfsAnalyzer.result.title", {attribute: analyseAttributeLabel}) }}
                            </h6>
                            <p class="small text-muted mb-2">
                                {{ $t("additional:modules.wfsAnalyzer.result.summary", {
                                    categories: result.categories.length,
                                    total: formatValue(result.total)
                                }) }}
                            </p>

                            <div
                                class="btn-group btn-group-sm mb-3"
                                role="group"
                                :aria-label="$t('additional:modules.wfsAnalyzer.result.viewLabel')"
                            >
                                <button
                                    v-for="view in ['bar', 'pie', 'table']"
                                    :key="view"
                                    type="button"
                                    class="btn"
                                    :class="resultView === view ? 'btn-primary' : 'btn-outline-primary'"
                                    @click="setResultView(view)"
                                >
                                    {{ $t(`additional:modules.wfsAnalyzer.result.view.${view}`) }}
                                </button>
                            </div>

                            <AnalysisBarChart
                                v-if="resultView === 'bar'"
                                :categories="chartCategories"
                                :format-value="formatValue"
                            />
                            <AnalysisPieChart
                                v-else-if="resultView === 'pie'"
                                :categories="chartCategories"
                                :format-value="formatValue"
                            />
                            <AnalysisTable
                                v-else
                                :categories="namedCategories"
                                :total="result.total"
                                :value-header="valueHeader"
                                :format-value="formatValue"
                            />

                            <p
                                v-if="resultView !== 'table' && chartCategories.length < namedCategories.length"
                                class="form-text mb-0"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.result.groupedHint") }}
                            </p>
                        </template>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
#wfs-analyzer {
    padding: 10px;
}
</style>
