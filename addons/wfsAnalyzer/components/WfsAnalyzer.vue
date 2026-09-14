<script>
import i18next from "i18next";
import {mapActions, mapGetters, mapMutations} from "vuex";
import AnalysisBarChart from "./AnalysisBarChart.vue";
import AnalysisPieChart from "./AnalysisPieChart.vue";
import AnalysisTable from "./AnalysisTable.vue";
import {formatNumber, getAreaUnit, groupCategories} from "../js/formatResult";

/**
 * Lets the user pick one of the layers currently switched on in the map,
 * verifies that the layer is also published as a WFS and then analyses one of
 * its attributes - either by counting features or by summing their area.
 * @module addons/wfsAnalyzer/components/WfsAnalyzer
 */
export default {
    name: "WfsAnalyzer",
    components: {
        AnalysisBarChart,
        AnalysisPieChart,
        AnalysisTable
    },
    computed: {
        ...mapGetters("Modules/WfsAnalyzer", [
            "analyseAttribute",
            "analysisError",
            "analysisStatus",
            "areaAttribute",
            "attributesStatus",
            "canAnalyse",
            "checkStatus",
            "errorMessage",
            "exceedsMaxFeatures",
            "featureCount",
            "featureCountStatus",
            "featureType",
            "filterAttribute",
            "filterValue",
            "filterValues",
            "filterValuesStatus",
            "filterValuesTruncated",
            "hasCurrentResult",
            "isAnalysable",
            "mode",
            "otherAreaAttributes",
            "otherFilterAttributes",
            "reason",
            "result",
            "resultView",
            "selectableLayers",
            "selectedLayerId",
            "settings",
            "suggestedAreaAttributes",
            "suggestedFilterAttributes",
            "selectableAttributes",
            "wfsUrl"
        ]),

        /**
         * @returns {Boolean} true while the WFS lookup is running.
         */
        isChecking () {
            return this.checkStatus === "checking";
        },

        /**
         * Covers both waits the user has to sit through before the form can be
         * shown: the WFS lookup and the attribute request that follows it.
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
         * tool is open must not stay selected.
         * @returns {void}
         */
        selectableLayers: {
            handler () {
                this.syncSelection();
            },
            deep: true
        }
    },
    methods: {
        ...mapActions("Modules/WfsAnalyzer", [
            "checkWfsAvailability",
            "loadFilterValues",
            "runAnalysis",
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
         * Label of an attribute in the selects: the name documented in the WFS
         * schema plus the technical name, which is what ends up in the requests.
         * Falls back to the technical name alone where the service documents
         * nothing.
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
        <p class="mb-3">
            {{ $t("additional:modules.wfsAnalyzer.intro") }}
        </p>

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
                <label
                    class="form-label"
                    for="wfs-analyzer-layer-select"
                >
                    {{ $t("additional:modules.wfsAnalyzer.layerSelectLabel") }}
                </label>
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
            </div>

            <!--
                One indicator for both waits - checking the WFS and loading its
                attributes - so there is no flicker between the two phases. It
                disappears as soon as the form below is ready. A successful check
                is not announced: only a layer that cannot be analysed is worth a
                message.
            -->
            <div
                v-if="isLoading"
                class="d-flex align-items-center mb-0"
                role="status"
            >
                <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                />
                {{ isChecking
                    ? $t("additional:modules.wfsAnalyzer.checking")
                    : $t("additional:modules.wfsAnalyzer.analysis.loadingAttributes") }}
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
                class="mt-3 pt-3 border-top"
            >
                <h6>{{ $t("additional:modules.wfsAnalyzer.analysis.title") }}</h6>

                <div
                    v-if="attributesStatus === 'error'"
                    class="alert alert-danger mb-0"
                    role="alert"
                >
                    {{ $t("additional:modules.wfsAnalyzer.analysis.attributesError") }}
                </div>

                <template v-else-if="attributesStatus === 'ready'">
                    <!-- step 1: restrict the area of interest -->
                    <fieldset class="mb-3">
                        <legend class="wfs-analyzer-legend-title">
                            {{ $t("additional:modules.wfsAnalyzer.filter.title") }}
                        </legend>
                        <p class="form-text mt-0 mb-2">
                            {{ $t("additional:modules.wfsAnalyzer.filter.hint") }}
                        </p>

                        <label
                            class="form-label"
                            for="wfs-analyzer-filter-attribute"
                        >
                            {{ $t("additional:modules.wfsAnalyzer.filter.attributeLabel") }}
                        </label>
                        <select
                            id="wfs-analyzer-filter-attribute"
                            class="form-select form-select-sm mb-2"
                            :value="filterAttribute"
                            @change="selectFilterAttribute($event.target.value)"
                        >
                            <option value="">
                                {{ $t("additional:modules.wfsAnalyzer.filter.wholeLayer") }}
                            </option>
                            <optgroup
                                v-if="suggestedFilterAttributes.length > 0"
                                :label="$t('additional:modules.wfsAnalyzer.filter.suggested')"
                            >
                                <option
                                    v-for="attribute in suggestedFilterAttributes"
                                    :key="attribute.name"
                                    :value="attribute.name"
                                >
                                    {{ getAttributeLabel(attribute) }}
                                </option>
                            </optgroup>
                            <optgroup
                                v-if="otherFilterAttributes.length > 0"
                                :label="$t('additional:modules.wfsAnalyzer.filter.allAttributes')"
                            >
                                <option
                                    v-for="attribute in otherFilterAttributes"
                                    :key="attribute.name"
                                    :value="attribute.name"
                                >
                                    {{ getAttributeLabel(attribute) }}
                                </option>
                            </optgroup>
                        </select>

                        <template v-if="filterAttribute !== ''">
                            <label
                                class="form-label"
                                for="wfs-analyzer-filter-value"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.filter.valueLabel") }}
                            </label>
                            <input
                                id="wfs-analyzer-filter-value"
                                class="form-control form-control-sm"
                                type="text"
                                list="wfs-analyzer-filter-values"
                                :value="filterValue"
                                :placeholder="$t('additional:modules.wfsAnalyzer.filter.valuePlaceholder')"
                                @change="selectFilterValue($event.target.value)"
                            >
                            <datalist id="wfs-analyzer-filter-values">
                                <option
                                    v-for="value in filterValues"
                                    :key="value"
                                    :value="value"
                                />
                            </datalist>

                            <button
                                v-if="filterValuesStatus !== 'ready'"
                                type="button"
                                class="btn btn-sm btn-outline-secondary mt-2"
                                :disabled="filterValuesStatus === 'loading'"
                                @click="loadFilterValues()"
                            >
                                <span
                                    v-if="filterValuesStatus === 'loading'"
                                    class="spinner-border spinner-border-sm me-1"
                                    aria-hidden="true"
                                />
                                {{ $t("additional:modules.wfsAnalyzer.filter.loadValues") }}
                            </button>
                            <div
                                v-if="filterValuesStatus === 'ready' && filterValuesTruncated"
                                class="alert alert-warning py-2 px-2 mt-2 mb-0 small"
                                role="status"
                            >
                                <i class="bi bi-exclamation-triangle-fill me-1" />
                                {{ $t("additional:modules.wfsAnalyzer.filter.valuesLoadedPartly", {count: filterValues.length}) }}
                            </div>
                            <p
                                v-else-if="filterValuesStatus === 'ready'"
                                class="form-text mb-0"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.filter.valuesLoaded", {count: filterValues.length}) }}
                            </p>
                            <p
                                v-else-if="filterValuesStatus === 'error'"
                                class="form-text mb-0"
                            >
                                <i class="bi bi-exclamation-circle me-1" />
                                {{ $t("additional:modules.wfsAnalyzer.filter.valuesUnavailable") }}
                            </p>
                            <p
                                v-else
                                class="form-text mb-0"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.filter.loadValuesHint") }}
                            </p>
                        </template>
                    </fieldset>

                    <!-- step 2: what to analyse -->
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

                    <!-- step 3: count or area -->
                    <fieldset class="mb-3">
                        <legend class="wfs-analyzer-legend-title">
                            {{ $t("additional:modules.wfsAnalyzer.mode.title") }}
                        </legend>
                        <div class="form-check">
                            <input
                                id="wfs-analyzer-mode-count"
                                class="form-check-input"
                                type="radio"
                                :checked="mode === 'count'"
                                @change="selectMode('count')"
                            >
                            <label
                                class="form-check-label"
                                for="wfs-analyzer-mode-count"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.mode.countLabel") }}
                            </label>
                        </div>
                        <div class="form-check">
                            <input
                                id="wfs-analyzer-mode-area"
                                class="form-check-input"
                                type="radio"
                                :checked="mode === 'area'"
                                :disabled="suggestedAreaAttributes.length === 0 && otherAreaAttributes.length === 0"
                                @change="selectMode('area')"
                            >
                            <label
                                class="form-check-label"
                                for="wfs-analyzer-mode-area"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.mode.areaLabel") }}
                            </label>
                        </div>

                        <template v-if="mode === 'area'">
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
                                <option value="">
                                    {{ $t("additional:modules.wfsAnalyzer.mode.areaAttributePlaceholder") }}
                                </option>
                                <optgroup
                                    v-if="suggestedAreaAttributes.length > 0"
                                    :label="$t('additional:modules.wfsAnalyzer.filter.suggested')"
                                >
                                    <option
                                        v-for="attribute in suggestedAreaAttributes"
                                        :key="attribute.name"
                                        :value="attribute.name"
                                    >
                                        {{ getAttributeLabel(attribute) }}
                                    </option>
                                </optgroup>
                                <optgroup
                                    v-if="otherAreaAttributes.length > 0"
                                    :label="$t('additional:modules.wfsAnalyzer.mode.otherNumeric')"
                                >
                                    <option
                                        v-for="attribute in otherAreaAttributes"
                                        :key="attribute.name"
                                        :value="attribute.name"
                                    >
                                        {{ getAttributeLabel(attribute) }}
                                    </option>
                                </optgroup>
                            </select>
                            <p class="form-text mb-0">
                                {{ $t("additional:modules.wfsAnalyzer.mode.areaAttributeHint") }}
                            </p>
                        </template>
                    </fieldset>

                    <!-- how much data will be loaded -->
                    <p
                        v-if="featureCountStatus === 'ready'"
                        class="small mb-2"
                    >
                        <i class="bi bi-database me-1" />
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
                            <div class="d-flex justify-content-between align-items-baseline mb-2">
                                <h6 class="mb-0">
                                    {{ $t("additional:modules.wfsAnalyzer.result.title", {attribute: analyseAttributeLabel}) }}
                                </h6>
                            </div>
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

.wfs-analyzer-legend-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
}
</style>
