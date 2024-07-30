import VueMatomo from "vue-matomo";

/**
 * Initialization. Wrapped in a function to avoid calling it initially
 * in a mochapack run.
 * @param {Object} app Vue-app
 * @returns {void}
 */
export function initiateMatomo (app) {
    app.use(VueMatomo, Config.matomo);

    // track Page Views
    window._paq.push(["trackPageView"]);
}

/**
 * Initialization. Wrapped in a function to avoid calling it initially
 * in a mochapack run.
 * @param {Object} app Vue-app
 * @returns {void}
 */
export function trackMatomo (category, action, name) {
    if (typeof Matomo !== "undefined") {
        window._paq.push(["trackEvent", category, action, name]);
    }
}
