<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import FlatButton from "@shared/modules/buttons/components/FlatButton.vue";
import GraphicalSelect from "@shared/modules/graphicalSelect/components/GraphicalSelect.vue";
import SpinnerItem from "@shared/modules/spinner/components/SpinnerItem.vue";

export default {
    name: "LayerListView",
    components: {
        GraphicalSelect,
        FlatButton,
        SpinnerItem
    },
    data () {
        return {
            supportedLayerTypes: ["WFS", "OAF", "GeoJSON"],
            unsupportedRenderers: ["WEBGL"]
        };
    },
    computed: {
        ...mapGetters(["visibleLayerConfigs", "ignoredKeys"]),
        ...mapGetters("Modules/GraphicalSelect", [
            "selectedAreaGeoJson"
        ]),
        ...mapGetters("Modules/FeatureLister", [
            "layer",
            "loading"
        ]),
        /**
         * Returns the visible vector layers that are supported by the feature lister.
         * @returns {Array} - An array of objects containing the name and id of each visible vector layer.
         */
        visibleVectorLayers () {
            return this.visibleLayerConfigs
                .filter(layer => this.supportedLayerTypes.includes(layer.typ) && !this.unsupportedRenderers.includes(layer.renderer?.toUpperCase()))
                .map(layer => ({
                    name: layer.name,
                    id: layer.id,
                    typ: layer.typ
                }));
        }
    },
    watch: {
        /**
          * Watches for changes in the selected area GeoJSON (indicates that the graphicalSelect was used) and updates the selected area accordingly.
        */
        selectedAreaGeoJson (newValue) {
            this.setSelectedArea(newValue);
        },
        /**
         * Watches for changes in the layer and resets the selected area if the layer type is OAF.
         * OAF layers are not yet supported for graphical selection, so we switch to the list view.
         */
        layer (newValue) {
            if (newValue && newValue.typ === "OAF") {
                this.setSelectedArea(null);
                this.switchToList();
            }
        }
    },
    methods: {
        ...mapMutations("Modules/FeatureLister", [
            "setLayer",
            "setSelectedArea"
        ]),
        ...mapActions("Modules/FeatureLister", [
            "switchToList"
        ]),
        /**
         * Checks if the given layer is the currently selected layer.
         * @param {Object} visibleLayer - The layer to check.
         * @returns {Boolean} - True if the layer is selected, false otherwise.
         */
        isSelectedLayer (visibleLayer = {}) {
            return this.layer && this.layer.id === visibleLayer.id;
        }
    }
};

</script>


<template>
    <ul
        v-for="visibleLayer in visibleVectorLayers"
        id="feature-lister-themes-ul"
        :key="'module-feature-lister-' + visibleLayer.id"
        class="nav flex-column"
    >
        <li
            :id="'feature-lister-layer-' + visibleLayer.id"
            class="nav-item"
            role="presentation"
        >
            <a
                href="#"
                :class="['nav-link', {'selected-layer': isSelectedLayer(visibleLayer)}]"
                @click.prevent="setLayer(visibleLayer)"
            >{{ visibleLayer.name }}</a>
        </li>
    </ul>
    <div
        v-if="layer && layer.typ === 'WFS'"
    >
        <GraphicalSelect
            ref="graphicalSelection"
            :label="$t('common:modules.featureLister.spatialSelection')"
        />
        <FlatButton
            id="module-feature-lister-show-more"
            :aria-label="$t('common:modules.featureLister.continueButton')"
            type="button"
            :text="$t('common:modules.featureLister.continueButton')"
            :icon="'bi-list'"
            :interaction="switchToList"
        />
    </div>
    <SpinnerItem
        v-if="loading"
    />
</template>

<style lang="scss" scoped>
 @import "~variables";

.selected-layer {
    font-weight: bold;
    background-color: $light_blue;
    color: $accent_contrast;
    border-radius: 4px;
    margin-bottom: 1em;
}
</style>
