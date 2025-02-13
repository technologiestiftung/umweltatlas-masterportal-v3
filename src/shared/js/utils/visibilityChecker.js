/**
 * Checks module to be shown.
 * @module shared/js/utils/visibilityChecker
 */
export default {

    /**
     * Checks if the module is to be applied in the map- and device mode.
     * @param {Object} params The parameters for checking visibility.
     * @param {String} params.mapMode The current map mode.
     * @param {String} params.deviceMode The used device.
     * @param {String} params.treeType The used type of tree.
     * @param {Array} [params.elements=[]] List of elements to validate.
     * @param {String[]} [params.supportedMapModes=["2D", "3D"]] Supported map modes.
     * @param {String[]} [params.supportedDevices=["Desktop", "Mobile", "Table"]] The supported devices.
     * @param {String[]} [params.supportedTreeTypes=["auto"]] The supported tree types.
     * @returns {Boolean} The module is shown.
     */
    isModuleVisible ({
        mapMode, deviceMode, treeType, elements = [], supportedMapModes = ["2D", "3D"],
        supportedDevices = ["Desktop", "Mobile", "Table"], supportedTreeTypes = ["auto"]
    }) {
        let isVisible = false;

        if (supportedMapModes?.includes(mapMode)
             && supportedDevices.map(device => device.toUpperCase()).includes(deviceMode.toUpperCase())
             && (supportedTreeTypes.includes(treeType) || treeType === undefined)
        ) {
            if (elements.length > 0) {
                const validElements = elements.filter(element => {
                    const elementSupportedMapModes = element.supportedMapModes || ["2D", "3D"];

                    return elementSupportedMapModes.includes(mapMode);
                });

                isVisible = validElements.length > 0;
            }
            else {
                isVisible = true;
            }
        }

        return isVisible;
    }
};
