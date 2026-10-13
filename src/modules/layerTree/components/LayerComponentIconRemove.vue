<script>
import {mapActions} from "vuex";
import IconButton from "@shared/modules/buttons/components/IconButton.vue";

/**
 * Represents a remove button for a layer in the layertree.
 * @module modules/layerTree/components/LayerComponentIconRemove
 * @vue-prop {Object} layerConf - The current layer configuration.
 */
export default {
    name: "LayerComponentIconRemove",
    components: {IconButton},
    props: {
        /** current layer configuration */
        layerConf: {
            type: Object,
            required: true
        }
    },
    methods: {
        ...mapActions("Modules/LayerTree", ["removeLayer"])
    }
};
</script>

<template lang="html">
    <div
        :id="'layer-component-icon-remove-' + layerConf.id"
    >
        <IconButton
            :id="'layer-component-icon-remove-button-' + layerConf.id"
            :class-array="['btn-light']"
            :aria="$t('common:modules.layerTree.iconRemoveLayer')"
            :icon="'bi-x-lg'"
            :interaction="() => removeLayer(layerConf)"
        />
    </div>
</template>
