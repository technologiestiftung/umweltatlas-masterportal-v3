/**
 * Shadow tool state definition.
 * @typedef {Object} ContactState
 * @property {Boolean} active If true, SaveSelection will be rendered.
 * @property {String} id Id of the Contact component.
 * @property {String} name Displayed as the title. (config-param)
 * @property {String} subtitle Displayed as the subtitle. (config-param)
 * @property {String} icon Icon next to the title. (config-param)
 * @property {Boolean} renderToWindow If true, tool is rendered in a window, else in the sidebar. (config-param)
 * @property {Boolean} resizableWindow If true, window is resizable. (config-param)
 * @property {Boolean} isVisibleInMenu If true, tool is selectable in menu. (config-param)
 * @property {Boolean} deactivateGFI Flag determining if the tool should deactivate GFI. (config-param)
 * @property {Object} selectedReferenceData the selected reference data
 * @property {Object[]} selectedRegions - The selected regions.
 * @property {Object[]} selectedDates - The selected dates.
 * @property {String} classificationMode - Method of dividing values into classes: "quantiles" or "equalIntervals".
 * @property {Boolean} allowPositiveNegativeClasses - If classification may contain classes like "from -1 to 1".
 * @property {Number} minNumberOfClasses - Minimum Number of classes selectable when editing the legend.
 * @property {Number} maxNumberOfClasses - Maximum Number of classes selectable when editing the legend.
 * @property {Number} numberOfClasses - Current number of classes selected in range.
 * @property {Object} legendData the legendValues with colors and value
 * @property {Boolean} addTotalCount If true, a row with total count will be inserted in table.
 * @property {Number} lineLimit The number of lines from which the line diagram is limited.
 */
const state = {
    active: false,
    id: "statisticDashboard",
    name: "common:modules.statisticDashboard.name",
    subtitle: "common:modules.statisticDashboard.headings.mrhstatistics",
    levelTitle: undefined,
    description: "common:modules.statisticDashboard.description",
    icon: "bi-bar-chart-line-fill",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    colorScheme: {},
    data: [],
    selectedReferenceData: undefined,
    selectedCategories: [],
    selectedReferenceValueTag: undefined,
    selectedRegions: [],
    selectedDates: [],
    selectedStatistics: {},
    classificationMode: "quantiles",
    allowPositiveNegativeClasses: false,
    minNumberOfClasses: 2,
    maxNumberOfClasses: 5,
    numberOfClasses: 5,
    chartTableToggle: "table",
    legendData: [],
    addTotalCount: false,
    lineLimit: null
};

export default state;
