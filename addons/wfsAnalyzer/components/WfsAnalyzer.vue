<script>
import i18next from "i18next";
import {mapActions, mapGetters, mapMutations} from "vuex";
import AnalysisPieChart from "./AnalysisPieChart.vue";
import AnalysisTable from "./AnalysisTable.vue";
import FilterValueInput from "./FilterValueInput.vue";
import {formatNumber, formatPercent, getAreaUnit, groupCategories} from "../js/formatResult";
import {buildCsv, downloadCsv} from "../js/exportCsv";

/**
 * Lets the user pick one of the layers currently switched on in the map and
 * analyse one of its attributes - by counting features or by summing their
 * area, optionally restricted to an area such as a district.
 * @module addons/wfsAnalyzer/components/WfsAnalyzer
 */
export default {
    name: "WfsAnalyzer",
    components: {
        AnalysisPieChart,
        AnalysisTable,
        FilterValueInput
    },
    data () {
        return {
            showExtraFilter: false,
            extraFilterEnabled: false
        };
    },
    computed: {
        ...mapGetters("Modules/WfsAnalyzer", [
            "analyseAttribute",
            "analyseAttributeCandidates",
            "analysisError",
            "analysisStatus",
            "areaAttribute",
            "areaAttributeCandidates",
            "areaFilterAttributes",
            "attributesStatus",
            "canAnalyse",
            "canAnalyseByArea",
            "categoryColors",
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
            "presetAnalyseAttribute",
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
         * Keeps the count on screen while it is being refreshed, as long as
         * there is a previous one to show.
         * @returns {Boolean} true if the feature count should be rendered.
         */
        showFeatureCount () {
            return this.featureCountStatus === "ready" ||
                (this.featureCountStatus === "loading" && this.featureCount !== null);
        },

        /**
         * Says why the analysis cannot be started yet. A button that is greyed
         * out without a reason is the most frustrating part of a form.
         * @returns {String} the hint, or an empty string when everything is set.
         */
        startHint () {
            if (this.analysisStatus === "running") {
                return "";
            }
            if (this.analyseAttribute === "") {
                return this.$t("additional:modules.wfsAnalyzer.analysis.needsAttribute");
            }
            if (this.mode === "area" && this.areaAttribute === "") {
                return this.$t("additional:modules.wfsAnalyzer.analysis.needsAreaAttribute");
            }

            return "";
        },

        /**
         * The heading over the result. It names the area the numbers belong to,
         * because the same attribute gives very different numbers per district.
         * @returns {String} the heading.
         */
        resultTitle () {
            if (this.filterValue !== "") {
                return this.$t("additional:modules.wfsAnalyzer.result.titleInArea", {
                    attribute: this.analyseAttributeLabel,
                    area: this.filterValue
                });
            }

            return this.$t("additional:modules.wfsAnalyzer.result.title", {
                attribute: this.analyseAttributeLabel
            });
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
    beforeUnmount () {
        // The highlight belongs to the open tool, not to the map.
        this.hideAnalysedArea();
    },
    methods: {
        ...mapActions("Modules/WfsAnalyzer", [
            "checkWfsAvailability",
            "hideAnalysedArea",
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
         * Formats a share, in the same locale as every other number.
         * @param {Number} share the share between 0 and 1.
         * @returns {String} the formatted percentage.
         */
        formatShare (share) {
            return formatPercent(share, i18next.language || "de");
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
         * Offers the full result as a CSV. Every category is written, also the
         * ones the pie chart pools into "other".
         * @returns {void}
         */
        downloadResult () {
            const isArea = this.result?.unit === "area",
                unit = this.$t(`additional:modules.wfsAnalyzer.units.${this.areaUnit.key}`),
                csv = buildCsv({
                    categories: isArea
                        ? this.namedCategories.map((category) => ({
                            ...category,
                            value: category.value / this.areaUnit.factor
                        }))
                        : this.namedCategories,
                    total: isArea ? this.result.total / this.areaUnit.factor : this.result.total,
                    decimals: isArea ? 2 : 0,
                    headers: {
                        category: this.$t("additional:modules.wfsAnalyzer.result.category"),
                        value: isArea
                            ? `${this.$t("additional:modules.wfsAnalyzer.mode.area")} (${unit})`
                            : this.$t("additional:modules.wfsAnalyzer.mode.count"),
                        share: `${this.$t("additional:modules.wfsAnalyzer.result.share")} (%)`,
                        total: this.$t("additional:modules.wfsAnalyzer.result.total")
                    }
                });

            downloadCsv(csv, `${this.analyseAttributeLabel}_${this.filterValue || "gesamt"}`);
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
            <div class="form-floating mb-3">
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
                <label for="wfs-analyzer-layer-select">
                    {{ $t("additional:modules.wfsAnalyzer.layerSelectLabel") }}
                </label>
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
                        <div class="form-floating">
                            <select
                                id="wfs-analyzer-filter-attribute"
                                class="form-select"
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
                                    {{ getAttributeLabel(attribute) }}
                                </option>
                            </select>
                            <label for="wfs-analyzer-filter-attribute">
                                {{ $t("additional:modules.wfsAnalyzer.filter.areaLabel") }}
                            </label>
                        </div>

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
                        <div class="form-floating">
                            <!--
                                A preset pins the attribute: the control keeps
                                its place in the form but is switched off, and
                                loses the arrow that would promise a choice.
                            -->
                            <select
                                id="wfs-analyzer-analyse-attribute"
                                class="form-select"
                                :class="{'wfs-analyzer-fixed-select': presetAnalyseAttribute}"
                                :disabled="Boolean(presetAnalyseAttribute)"
                                :value="analyseAttribute"
                                @change="onAnalyseAttributeChange"
                            >
                                <!-- No empty option either: it would offer to unset what is set. -->
                                <option
                                    v-if="!presetAnalyseAttribute"
                                    value=""
                                >
                                    {{ $t("additional:modules.wfsAnalyzer.analysis.attributePlaceholder") }}
                                </option>
                                <option
                                    v-for="attribute in analyseAttributeCandidates"
                                    :key="attribute.name"
                                    :value="attribute.name"
                                >
                                    {{ getAttributeLabel(attribute) }}
                                </option>
                            </select>
                            <label for="wfs-analyzer-analyse-attribute">
                                {{ $t("additional:modules.wfsAnalyzer.analysis.attributeLabel") }}
                            </label>
                        </div>
                        <p
                            v-if="presetAnalyseAttribute"
                            class="form-text mt-1 mb-0"
                        >
                            {{ $t("additional:modules.wfsAnalyzer.analysis.attributeMatchesMap") }}
                        </p>
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
                            class="btn-group w-100"
                            role="group"
                        >
                            <button
                                v-for="option in ['area','count']"
                                :id="`wfs-analyzer-mode-${option}`"
                                :key="option"
                                type="button"
                                class="btn"
                                :class="mode === option ? 'btn-primary' : 'wfs-analyzer-segment'"
                                @click="selectMode(option)"
                            >
                                {{ $t(`additional:modules.wfsAnalyzer.mode.${option}`) }}
                            </button>
                        </div>

                        <template v-if="mode === 'area' && needsAreaAttributeChoice">
                            <div class="form-floating mt-2">
                                <select
                                    id="wfs-analyzer-area-attribute"
                                    class="form-select"
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
                                <label for="wfs-analyzer-area-attribute">
                                    {{ $t("additional:modules.wfsAnalyzer.mode.areaAttributeLabel") }}
                                </label>
                            </div>
                        </template>
                    </div>

                    <!--
                        Optional additional filter - not shown for now. The
                        store side stays in place, so switching the flag below
                        brings it back.
                    -->
                    <div
                        v-if="extraFilterEnabled"
                        class="mb-3"
                    >
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
                            <div class="form-floating">
                                <select
                                    id="wfs-analyzer-extra-attribute"
                                    class="form-select"
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
                                <label for="wfs-analyzer-extra-attribute">
                                    {{ $t("additional:modules.wfsAnalyzer.filter.extraTitle") }}
                                </label>
                            </div>

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

                    <!--
                        The only live feedback in the form, so it gets an icon
                        and room to breathe instead of sitting flush on the
                        button. While the count is being refreshed the previous
                        one stays visible, dimmed - letting it vanish would take
                        away the very feedback it provides.
                    -->
                    <p
                        v-if="showFeatureCount"
                        class="d-flex align-items-center mb-3 wfs-analyzer-feature-count"
                        :class="{'text-muted': featureCountStatus === 'loading'}"
                        role="status"
                    >
                        <span
                            v-if="featureCountStatus === 'loading'"
                            class="spinner-border spinner-border-sm me-2 flex-shrink-0"
                            aria-hidden="true"
                        />
                        <i
                            v-else
                            class="bi bi-database me-2 flex-shrink-0"
                        />
                        <span>
                            {{ $t("additional:modules.wfsAnalyzer.analysis.featureCount", {count: formatCount(featureCount)}) }}
                        </span>
                    </p>

                    <div
                        v-if="exceedsMaxFeatures"
                        class="alert alert-warning py-2 small"
                        role="status"
                    >
                        {{ $t("additional:modules.wfsAnalyzer.analysis.manyFeatures", {max: formatCount(settings.maxFeatures)}) }}
                    </div>

                    <button
                        id="wfs-analyzer-start"
                        type="button"
                        class="btn btn-primary btn-lg w-100"
                        :disabled="!canAnalyse || analysisStatus === 'running'"
                        @click="runAnalysis()"
                    >
                        <span
                            v-if="analysisStatus === 'running'"
                            class="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                        />
                        {{ $t("additional:modules.wfsAnalyzer.analysis.start") }}
                    </button>
                    <p
                        v-if="startHint"
                        class="form-text text-center mt-1 mb-0"
                    >
                        {{ startHint }}
                    </p>

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
                                {{ resultTitle }}
                            </h6>
                            <p class="small text-muted mb-2">
                                {{ $t("additional:modules.wfsAnalyzer.result.summary", {
                                    categories: result.categories.length,
                                    total: formatValue(result.total)
                                }) }}
                            </p>

                            <div
                                class="btn-group w-100 mb-3"
                                role="group"
                                :aria-label="$t('additional:modules.wfsAnalyzer.result.viewLabel')"
                            >
                                <button
                                    v-for="view in ['table', 'pie']"
                                    :key="view"
                                    type="button"
                                    class="btn"
                                    :class="resultView === view ? 'btn-primary' : 'wfs-analyzer-segment'"
                                    @click="setResultView(view)"
                                >
                                    {{ $t(`additional:modules.wfsAnalyzer.result.view.${view}`) }}
                                </button>
                            </div>

                            <AnalysisPieChart
                                v-if="resultView === 'pie'"
                                :categories="chartCategories"
                                :format-value="formatValue"
                                :format-share="formatShare"
                                :category-colors="categoryColors"
                            />
                            <AnalysisTable
                                v-else
                                :categories="namedCategories"
                                :total="result.total"
                                :value-header="valueHeader"
                                :format-value="formatValue"
                                :format-share="formatShare"
                                :category-colors="categoryColors"
                            />

                            <p
                                v-if="resultView !== 'table' && chartCategories.length < namedCategories.length"
                                class="form-text mb-0"
                            >
                                {{ $t("additional:modules.wfsAnalyzer.result.groupedHint") }}
                            </p>

                            <button
                                id="wfs-analyzer-download"
                                type="button"
                                class="btn wfs-analyzer-segment w-100 mt-3"
                                @click="downloadResult"
                            >
                                <i class="bi bi-download me-2" />
                                {{ $t("additional:modules.wfsAnalyzer.result.download") }}
                            </button>
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

/*
 * The segmented controls cannot use .btn-outline-primary: the portal's $primary
 * is a very light mint (#edf8f4), which leaves the unselected half almost
 * invisible on white. The radius clashes too - .btn-primary is given 16px by
 * the theme while the outline variant keeps Bootstrap's default, so the two
 * halves of one control end up differently rounded.
 *
 * Hence an explicit segment style in the theme's own dark green, and one radius
 * for the whole group: round on the outside, flat where the halves meet.
 */
$wfs-analyzer-accent: #1a4435;
$wfs-analyzer-radius: 16px;

.btn-group {
    .btn {
        flex: 1 1 0;
        border: 1px solid $wfs-analyzer-accent;
        border-radius: 0;
        font-weight: 500;
    }

    .btn:first-child {
        border-top-left-radius: $wfs-analyzer-radius;
        border-bottom-left-radius: $wfs-analyzer-radius;
    }

    .btn:last-child {
        border-top-right-radius: $wfs-analyzer-radius;
        border-bottom-right-radius: $wfs-analyzer-radius;
    }
}

.wfs-analyzer-feature-count {
    font-size: 14px;
}

/*
 * The attribute is fixed by a preset. Bootstrap draws the arrow of a select as
 * a background image, so taking it away means removing that image - and the
 * space it was indented for.
 */
.wfs-analyzer-fixed-select {
    background-image: none;
    padding-right: 0.75rem;
}

.wfs-analyzer-segment {
    background-color: #fff;
    color: $wfs-analyzer-accent;

    &:hover,
    &:focus {
        background-color: rgba(26, 68, 53, 0.08);
        color: $wfs-analyzer-accent;
    }
}

/*
 * A disabled button should still look like a button. Bootstrap's default
 * opacity fades it to the point of looking broken.
 */
.btn:disabled,
.btn.disabled {
    opacity: 1;
    color: #41464b;
    background-color: #dee2e6;
    border-color: #adb5bd;
}
</style>
