/**
 * User type definition
 * @typedef {Object} SearchBarState
 * @property {String} [minCharacters=3] Minimum amount of characters required to start a search.
 * @property {String} [placeholder="common:modules.searchbar.placeholder.address"] Input text field placeholder shown when no input has been given yet.
 * @property {Object} [searchInterfaces={}] The configurations of the search interfaces
 * @property {Number} [suggestionListLength=5] Maximum amount of entries in the suggestion list.
 * @property {Number} [timeout=5000] Timeout for request to a search interface.
 * @property {String} [type="searchBar"] Id of the SearchBar component.
 * @property {Number} [zoomLevel=7] Defines the zoom level to use on zooming to a result.
 *
 * @property {String} [searchInput=""] The search input.
 * @property {Object[]} [searchInterfaceInstances=[]] The configured searchInterfaces.
 * @property {Object[]} [searchResults=[]] The results of the configured searchInterfaces.
 * @property {Object[]} [searchSuggestions=[]] The suggestions of the configured searchInterfaces.
 */
const state = {
    minCharacters: 3,
    placeholder: "common:modules.searchbar.placeholder.address",
    searchInterfaces: {},
    suggestionListLength: 5,
    timeout: 5000,
    type: "searchBar",
    zoomLevel: 7,

    searchInput: "",
    searchInterfaceInstances: [],
    searchResults: [],
    searchSuggestions: []
};

export default state;