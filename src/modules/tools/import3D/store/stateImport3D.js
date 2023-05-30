/**
 * User type definition
 * @typedef {Object} FileImportState
 * @property {Boolean}      active - if true, component is rendered
 * @property {String}       currentModelId - id of the currently selected or added model
 * @property {Cartesian3}   currentModelPosition - position of the currently selected or added model
 * @property {Boolean}      deactivateGFI - if true, component activation deactivates gfi component
 * @property {Boolean}      editing - if true, editing is enabled
 * @property {String}       icon - icon next to title
 * @property {String}       id - internal id of component
 * @property {Object[]}     importedModels - array of imported 3D models
 * @property {String}       name - Module name
 * @property {Boolean}      renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}      resizableWindow - if true and if rendered to window pane, the pane is resizable
 */

export default {
    active: false,
    id: "import3D",
    coordinatesEasting: "",
    coordinatesNorthing: "",
    coordinatesAltitude: "",
    currentModelId: null,
    currentModelPosition: null,
    currentProjection: "EPSG:4326",
    importedModels: [],

    // defaults for config.json parameters
    icon: "bi-box-arrow-in-down",
    deactivateGFI: false,
    name: "common:menu.tools.import3D",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false
};
