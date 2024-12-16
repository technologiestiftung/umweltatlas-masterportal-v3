// eslint-disable-next-line no-unused-vars
const Config = {
    alerting: {
        fetchBroadcastUrl: "./resources/newsFeedPortalAlerts.json",
    },
    namedProjections: [
        [
            "EPSG:25832",
            "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        ],
        [
            "EPSG:25833",
            "+title=ETRS89/UTM 33N +proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        ],
    ],
    layerConf: "./resources/services-internet.json",
    restConf: "./resources/rest-services-internet.json",
    styleConf: "./resources/style_v3.json",
    wfsImgPath: "./resources/img/",
    portalLanguage: {
        enabled: true,
        debug: false,
        languages: {
            de: "Deutsch"
        },
        fallbackLanguage: "de",
        changeLanguageOnStartWhen: ["querystring", "localStorage", "htmlTag"],
    },
};

