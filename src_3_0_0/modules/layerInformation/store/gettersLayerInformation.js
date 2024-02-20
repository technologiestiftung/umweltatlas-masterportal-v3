import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateLayerInformation from "./stateLayerInformation";

/**
 * The getters for the layerInformation.
 * @module modules/layerInformation/store/gettersLayerInformation
 */
export default {
    ...generateSimpleGetters(stateLayerInformation),

    /**
     * Provides state for urlParams, encodes uris in legends.
     * @param {Object} state state of the app-store.
     * @returns {Object} state for urlParams
     */
    urlParams: state => {
        const stateCopy = {...state},
            downloadLinks = [];

        Object.entries(stateCopy).forEach(([key, value]) => {
            if (key === "downloadLinks") {

                if (Array.isArray(value)) {
                    const downloadLinksCopy = [...value];
                    let replacement;

                    downloadLinksCopy.forEach(downloadInfo => {
                        let encoded = {};

                        if (typeof downloadInfo.link === "string") {
                            encoded.link = encodeURIComponent(downloadInfo.link.slice());
                            encoded.linkName = downloadInfo.linkName;
                        }
                        else {
                            encoded = {...downloadInfo};
                        }
                        replacement = encoded;
                        downloadLinks.push(replacement);
                    });
                }
            }

        });
        return Object.assign(stateCopy, {downloadLinks: downloadLinks});
    }
};
