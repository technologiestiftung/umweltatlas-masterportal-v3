/**
 * LayerSelection state definition.
 * @typedef {Object} LayerSelectionState
 * @property {Boolean} visible visible if true, LayerSelection will rendered
 * @property {String} type type of LayerSelection
 * @property {String} icon icon of LayerSelection
 * @property {String} menuSide side of menu to show LayerSelection in
 * @property {String} name name of LayerSelection
 * @property {Array} subjectDataLayerConfs subject data layer configurations to show in layerSelection
 * @property {Array} backgroundLayerConfs background layer configurations to show in layerSelection
 * @property {Array} layersToAdd ids of layers to add to LayerTree
 * @property {Array} lastFolderNames names of the previous folder configurations names
 * @property {Array} lastSubjectDataLayerConfs previous subject data layer configurations
 * @property {Array} lastSubjectDataLayerConfs previous background layer configurations
 */
export default {
    visible: false,
    type: "layerSelection",
    icon: "bi-question-circle",
    menuSide: "mainMenu",
    name: "common:tree.addSubject",

    subjectDataLayerConfs: [],
    backgroundLayerConfs: [],
    layersToAdd: [],
    lastFolderNames: [],
    lastSubjectDataLayerConfs: [],
    lastBackgroundLayerConfs: []
};