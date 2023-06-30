/**
 * User type definition
 * @typedef {Object} Modeler3DState
 * @property {Boolean}      active - if true, component is rendered
 * @property {Boolean}      adaptToHeight - if true, adjust height automatically on position change
 * @property {Object}       coordinatesEasting - id and value of the transformed easting coordinate displayed on the ui
 * @property {Object}       coordinatesNorthing - id and value of the transformed northing coordinate displayed on the ui
 * @property {String}       currentModelId - id of the currently selected or added model
 * @property {Cartesian3}   currentModelPosition - position of the currently selected or added model
 * @property {Object}       currentProjection - the currently selected projection
 * @property {Boolean}      deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}       drawName name of drawing model
 * @property {Number}       extrudedHeight height in meters for drawing model
 * @property {Object}       height - id and value of the transformed height coordinate displayed on the ui
 * @property {Object[]}     hiddenObjects - array of hidden objects
 * @property {Object}       highlightStyle default style for highlighting models
 * @property {String}       highlightStyle.color default color of highlighted model
 * @property {Number}       highlightStyle.alpha default transparency for color of highlighted model
 * @property {String}       highlightStyle.silhouetteColor default color of highlighted models silhouette
 * @property {Number}       highlightStyle.size default size for silhouette of highlighted model
 * @property {String}       icon - icon next to title
 * @property {String}       id - internal id of component
 * @property {Object[]}     importedModels - array of imported 3D models
 * @property {Boolean}      isDragging - if true, entity is being moved by mouse
 * @property {Boolean}      isDrawing- true if drawing is active
 * @property {Boolean}      isLoading- true if loading of imported model is active
 * @property {String}       name - Module name
 * @property {Float}        opacity - selected opactiy for drawing model
 * @property {Object[]}     projections - all available projections
 * @property {Boolean}      renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}      resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Number}       rotation - the current rotation value
 * @property {Float[]}      selectedCoordinates - current coordinates in current projections as numbers
 * @property {String}       selectedColor - selected color for drawing 3d object
 */

export default {
    active: false,
    id: "modeler3D",
    adaptToHeight: true,
    selectedColor: "",
    coordinatesEasting: {id: "easting", value: ""},
    coordinatesNorthing: {id: "northing", value: ""},
    currentModelId: null,
    currentModelPosition: null,
    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"},
    drawnModels: [],
    drawName: "",
    extrudedHeight: 20,
    height: {id: "height", value: ""},
    hiddenObjects: [],
    highlightStyle: {
        color: "#787777",
        alpha: 1,
        silhouetteColor: "#E20D0F",
        silhouetteSize: 4
    },
    importedModels: [],
    isDragging: false,
    isDrawing: false,
    isLoading: false,
    opacity: 1,
    projections: [],
    rotation: 0,
    scale: 1,
    selectedCoordinates: [],

    // defaults for config.json parameters
    icon: "bi-bounding-box",
    deactivateGFI: true,
    name: "common:menu.tools.modeler3D",
    onlyDesktop: true,
    renderToWindow: false,
    resizableWindow: true
};
