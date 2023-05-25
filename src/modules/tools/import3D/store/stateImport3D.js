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
 * @property {Object}       highlightStyle default style for highlighting models
 * @property {String}       highlightStyle.color default color of highlighted model
 * @property {Number}       highlightStyle.alpha default transparency for color of highlighted model
 * @property {String}       highlightStyle.silhouetteColor default color of highlighted models silhouette
 * @property {Number}       highlightStyle.size default size for silhouette of highlighted model
 */

export default {
    active: false,
    currentModelId: null,
    currentModelPosition: null,
    deactivateGFI: false,
    editing: false,
    icon: "bi-box-arrow-in-down",
    id: "import3D",
    importedModels: [],
    name: "common:menu.tools.import3D",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false,
    highlightStyle: {
        color: "#787777",
        alpha: 1,
        silhouetteColor: "#E20D0F",
        silhouetteSize: 4
    }
};
