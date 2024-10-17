/**
 * User type definition
 * @typedef {Object} CompareFeaturesState
 * @property {Boolean} active if true, compareFeatures will rendered
 * @property {String} id id of the CompareFeatures component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Object} layerFeatures object with the features of a layer
 * @property {String} selectedLayerId the currently selected layer
 * @property {String} currentFeatureName the name of the current Feature
 * @property {Boolean} listFull if true no more features can be added to comparison list
 * @property {Boolean} hasFeatures if true comparison list gets rendered otherwise an infobox shows up
 * @property {Array} layerWithFeaturesToShow Array of the features to a selected layer
 * @property {Boolean} hasMultipleLayers if true multiple layers can be selected within the comparison list
 * @property {Object} preparedList Object with the selected layers and their selected features
 */
const state = {
    // defaults for config.json parameters
    name: "common:modules.compareFeatures.title",
    hasMouseMapInteractions: false,
    description: "common:modules.compareFeatures.description",
    icon: "bi-star",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "compareFeatures",
    // compareFeatures state
    id: "compareFeatures",
    layerFeatures: {},
    selectedLayerId: "",
    currentFeatureName: "",
    listFull: false,
    hasFeatures: false,
    layerWithFeaturesToShow: [],
    hasMultipleLayers: false,
    preparedList: {},
    preparedListDisplayTable: {}
};

export default state;
