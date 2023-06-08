/**
 * User type definition
 * @typedef {Object} FileImportState
 * @property {Boolean}      active - if true, component is rendered
 * @property {Boolean}      adaptToHeight - if true, adjust height automatically on position change
 * @property {Object}       coordinatesEasting - id and value of the transformed easting coordinate displayed on the ui
 * @property {Object}       coordinatesNorthing - id and value of the transformed northing coordinate displayed on the ui
 * @property {String}       currentModelId - id of the currently selected or added model
 * @property {Cartesian3}   currentModelPosition - position of the currently selected or added model
 * @property {Object}       currentProjection - the currently selected projection
 * @property {Boolean}      deactivateGFI - if true, component activation deactivates gfi component
 * @property {Boolean}      editing - if true, editing is enabled
 * @property {Object}       height - id and value of the transformed height coordinate displayed on the ui
 * @property {String}       icon - icon next to title
 * @property {String}       id - internal id of component
 * @property {Object[]}     importedModels - array of imported 3D models
 * @property {String}       name - Module name
 * @property {Object[]}     projections - all available projections
 * @property {Boolean}      renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}      resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Float[]}      selectedCoordinates - current coordinates in current projections as numbers
 * @property {Object}       highlightStyle default style for highlighting models
 * @property {String}       highlightStyle.color default color of highlighted model
 * @property {Number}       highlightStyle.alpha default transparency for color of highlighted model
 * @property {String}       highlightStyle.silhouetteColor default color of highlighted models silhouette
 * @property {Number}       highlightStyle.size default size for silhouette of highlighted model
 */

export default {
    active: false,
    id: "import3D",
    adaptToHeight: true,
    coordinatesEasting: {id: "easting", value: ""},
    coordinatesNorthing: {id: "northing", value: ""},
    currentModelId: null,
    currentModelPosition: null,
    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"},
    height: {id: "height", value: ""},
    highlightStyle: {
        color: "#787777",
        alpha: 1,
        silhouetteColor: "#E20D0F",
        silhouetteSize: 4
    },
    importedModels: [],
    invisibleObjects: [],
    projections: [],
    selectedCoordinates: [],

    // defaults for config.json parameters
    icon: "bi-box-arrow-in-down",
    deactivateGFI: true,
    name: "common:menu.tools.import3D",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false
};
