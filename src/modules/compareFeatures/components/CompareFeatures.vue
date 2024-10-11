<script>
import * as constants from "../store/constantsCompareFeatures";
import TableComponent from "../../../shared/modules/table/components/TableComponent.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";

export default {
    name: "CompareFeatures",
    components: {
        TableComponent
    },
    data () {
        return {
            iconEmptyStar: constants.iconEmptyStar,
            iconYellowStar: constants.iconYellowStar,
            sortable: true
        };
    },
    computed: {
        ...mapGetters("Modules/CompareFeatures", ["hasFeatures", "hasMultipleLayers", "active", "selectedLayer", "preparedListDisplayTable", "selectableLayers"]),
        selected: {
            get () {
                return this.$store.state.Modules.CompareFeatures.selectedLayer;
            },
            set (newValue) {
                this.selectLayerWithFeatures(newValue);
            }
        }
    },
    methods: {
        ...mapActions("Modules/CompareFeatures", ["removeFeatureFromTable"]),
        ...mapMutations("Modules/CompareFeatures", ["selectLayerWithFeatures"]),

        removeItem (idFeature, idLayer) {
            this.removeFeatureFromTable({idFeature, idLayer});
        }
    }
};
</script>

<template
    lang="html"
    class="template"
>
    <div
        id="compare-features"
    >
        <div
            v-if="hasMultipleLayers"
            id="tool-compareFeatures-select-container"
        >
            <hr>
            <div class="form-floating mb-3">
                <select
                    id="tool-compareFeatures-select"
                    v-model="selected"
                    class="form-select"
                >
                    <option
                        v-for="(layer, i) in selectableLayers"
                        :key="i"
                        :value="layer.layerId"
                    >
                        {{ layer.layerName }}
                    </option>
                </select>
                <label
                    for="tool-compareFeatures-select"
                >
                    {{ $t("common:modules.compareFeatures.topicsSelection") }}
                </label>
            </div>
        </div>
    </div>
    <div>
        <div
            v-if="!hasFeatures"
            id="tool-compareFeatures-no-features"
        >
            <hr>
            <p class="bold">
                {{ $t("common:modules.compareFeatures.noFeatures.nothingSelected", {objects:
                    $t("common:modules.compareFeatures.noFeatures.objectName")}) }}
            </p>
            <br>
            <p
                v-html="$t('common:modules.compareFeatures.noFeatures.info', {iconEmptyStar, iconYellowStar, interpolation: {escapeValue: false}})"
            />
        </div>

        <TableComponent
            v-if="hasFeatures && !hasMultipleLayers"
            id="tool-compareFeatures-comparisonListSingleLayer"
            :data="preparedListDisplayTable[Object.keys(preparedListDisplayTable)[0]]"
            :sortable="true"
            :filterable="true"
            :downloadable="true"
            :removable="true"
            :enable-settings="true"
            @removeItem="removeItem"
        />
        <TableComponent
            v-if="active && hasMultipleLayers"
            id="tool-compareFeatures-comparisonListMultipleLayers"
            :data="preparedListDisplayTable[selectedLayer]"
            :sortable="true"
            :filterable="true"
            :show-header="true"
            :downloadable="true"
            :removable="true"
            :enable-settings="true"
            @removeItem="removeItem"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#tool-compareFeatures-no-features {
    padding: 15px;
    padding-top: 0;

    p {
        line-height: 22px;

        &:first-child {
            font-size: $font_size_big;
        }
    }
}
</style>
