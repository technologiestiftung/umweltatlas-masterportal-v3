import WfsAnalyzerComponent from "./components/WfsAnalyzer.vue";
import WfsAnalyzerStore from "./store/indexWfsAnalyzer";

import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: WfsAnalyzerComponent,
    store: WfsAnalyzerStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
