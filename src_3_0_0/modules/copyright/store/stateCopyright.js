/**
 * The state of the Copyright Informations
 * @module  modules/copyright/store/stateCopyright
 * @typedef {Object} CopyrightState
 * @property {String} id id of the Copyright component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {String} type (config-param)
 */
const state = {
    id: "copyright",
    name: "common:modules.copyright.name",
    icon: "bi-c-circle",
    type: "copyright"
};

export default state;
