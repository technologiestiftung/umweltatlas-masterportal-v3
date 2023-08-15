/**
 * User type definition
 * @module modules/About/state
 * @typedef {Object} aboutState
 * @property {String} icon Icon next to name (config-param).
 * @property {String} name name of this module
 * @property {Object[]} menuSide Specifies in which menu the about should be rendered
 * @property {String} type the type of layer information
 *
 * @property {String} abstractText the abstract Info text
 * @property {Object} contact the metadata contact
 * @property {String} cswUrl the csw metadata URL
 * @property {String} downloadLink the link to download the example *
 * @property {String} logo the masterportal logo
 * @property {String} logoText the alternate text if the the masterportal logo cannot be displayed
 * @property {String} metaDataCatalogueId id of the MateDataCatalogue
 * @property {String} metaUrl the metadata URL
 * @property {String} noMetadataLoaded no metadata Loaded Text
 * @property {Boolean} showAdditionalMetaData parameter to show the metadata link for more information
 * @property {String} title the metadata title
 * @property {String} version the current mp version
 */
export default {
    icon: "bi-info-circle",
    name: "common:modules.about.name",
    menuSide: "mainMenu",
    type: "about",

    abstractText: "",
    contact: null,
    cswUrl: "",
    downloadLink: "",
    logo: "",
    logoText: "Masterportallogo",
    metaDataCatalogueId: "2",
    metaUrl: "",
    noMetadataLoaded: "",
    showAdditionalMetaData: true,
    title: "",
    version: ""
};