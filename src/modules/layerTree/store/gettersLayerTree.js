import {generateSimpleGetters} from "@shared/js/utils/generators.js";
import stateLayerTree from "./stateLayerTree.js";
import {sortObjects, sortByLayerSequence} from "@shared/js/utils/sortObjects.js";

/**
 * The getters for the LayerTree.
 * @module modules/layerTree/store/gettersLayerTree
 */
const simpleGetters = {
    ...generateSimpleGetters(stateLayerTree),

    /**
     * Returns all layer configs sorted according to the LayerTree logic.
     * - Sort by `zIndex` descending
     * - Then by `layerSequence` if present
     * Can be reused by LayerTree, LayerPills, Legend, etc.
     *
     * @param {Object} state - Vuex state of LayerTree module
     * @param {Object} getters - Vuex getters of this module
     * @param {Object} rootState - Root Vuex state
     * @param {Object} rootGetters - Root Vuex getters
     * @returns {Array<Object>} Sorted layer configuration array
     */
    layerTreeSortedLayerConfigs: (state, getters, rootState, rootGetters) => {
        let configs;

        if (rootGetters.showLayerAddButton) {
            configs = rootGetters.layerConfigsByAttributes({showInLayerTree: true});
        }
        else {
            configs = rootGetters.allLayerConfigs;
        }

        configs = [...configs];

        sortObjects(configs, "zIndex", "desc");

        if (configs.some(conf => "layerSequence" in conf)) {
            sortByLayerSequence(configs);
        }

        return configs;
    }
};

export default simpleGetters;
