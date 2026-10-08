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
    layerInformation: {
        // Shows the uaInfoURL of a layer in an iframe next to the layer information.
        // Requires berlin.de to allow framing from this portal's origin.
        uaInfoFrame: {
            enabled: true,
            menuWidth: "70%",
            // Loads the page through our own origin, so that the
            // "X-Frame-Options: sameorigin" of berlin.de is satisfied. Needs a reverse
            // proxy that forwards /umweltatlas to https://www.berlin.de/umweltatlas.
            // Locally this is done by the webpack dev server, see devtools/proxyconf_example.json.
            // Remove this line to load the page directly from www.berlin.de.
            proxyPrefix: "https://www.berlin.de"
        }
    },
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

