import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateLayerInformation from "./stateLayerInformation";

/**
 * The getters for the layerInformation.
 * @module modules/layerInformation/store/gettersLayerInformation
 */
export default {
    ...generateSimpleGetters(stateLayerInformation),

    /**
     * Provides state for urlParams.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for urlParams
     */
    urlParams: state => {
        return {
            layerInfo: state.layerInfo
        };
    }
};
