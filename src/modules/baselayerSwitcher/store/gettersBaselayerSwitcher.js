import {generateSimpleGetters} from "@shared/js/utils/generators.js";
import stateBaselayerSwitcher from "./stateBaselayerSwitcher.js";

const getters = {
    ...generateSimpleGetters(stateBaselayerSwitcher),

    /**
     * Provides state for filteredBaseLayers.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for filteredBaseLayers
     */
    filteredBaseLayers: state => {
        if (!state.visibleBaselayerIds.length) {
            return state.baselayers;
        }
        return state.baselayers.filter(
            l => state.visibleBaselayerIds.includes(l.id)
        );
    }
};

export default getters;
