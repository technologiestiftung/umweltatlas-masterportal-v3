/**
 * User type definition
 * @typedef {Object} FileImportState
 * @property {Boolean}  active - if true, component is rendered
 * @property {String}   currentModelId - id of the currently selected or added model
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {String}   selectedFiletype - This controls, which openlayers format is used when displaying the file data. Using "auto" will result in selecting one format according to the filename's suffix.
 * @property {String[]}   importedFileNames - list of names of successfully imported files
 * @property {Object}   supportedFiletypes - Configuration object which is used to generate the selectedFiletype radio form from.
 * @property {Boolean}  enableZoomToExtend - If true, it is enable to zoom to features of the imported file.
 */

export default {
    active: false,
    currentModelId: null,
    deactivateGFI: false,
    icon: "bi-box-arrow-in-down",
    id: "import3D",
    name: "common:menu.tools.import3D",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false,
    selectedFiletype: "auto",
    importedModels: [],
    supportedFiletypes: {
        auto: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
        },
        gltf: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.gltf",
            rgx: /\.gltf$/i
        },
        obj: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.obj",
            rgx: /\.obj$/i
        },
        dae: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.dae",
            rgx: /\.dae$/i
        }
    }
};
