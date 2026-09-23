// eslint-disable-next-line no-unused-vars
const Config = {
    addons: ["wfsAnalyzer"],
    // Settings of the wfsAnalyzer add-on. Every key is optional and falls back
    // to the defaults in addons/wfsAnalyzer/js/analysisConfig.js.
    wfsAnalyzer: {
        // Attribute names offered as suggestions when restricting an analysis
        // to a spatial unit. Any other attribute of the layer can still be
        // chosen by the user - extend this list to add more suggestions.
        filterAttributes: [
            "neubklar",
            "bezklar",
            "bezirk",
            "bezirksname",
            "bezname",
            "namgem",
            "ortsteil",
            "ot",
            "ortsteilname",
            "prognoseraum",
            "bezirksregion",
            "bzr_name",
            "plr_name",
            "planungsraum",
            "gemeinde",
            "stadtteil",
        ],
        // Attribute names that hold a precomputed area in square metres. Using
        // one of them avoids downloading geometries for an area analysis.
        areaAttributes: [
            "einzelflaeche",
            "flalle",
            "ha",
            "flaeche",
            "flaeche_qm",
            "fl",
            "area",
            "shape_area",
            "st_area",
            "gesamtflaeche",
            "flae",
            "groesse",
        ],
        // Number of features above which the user is warned before loading.
        maxFeatures: 50000,
        // Categories shown in the charts before the rest is pooled as "other".
        maxChartCategories: 12,
        // Maximum number of filter values offered under "Wert". If the service
        // cannot deliver the whole list at once, the values are collected one
        // request at a time, so this also bounds how long that takes. When more
        // values exist than fit, the user is told the list is incomplete.
        maxFilterValues: 50,
        // Diagrammfarben aus der Kartenlegende (GetLegendGraphic als JSON).
        // Global aus, weil es nur bei Layern greift, die pro Wert eingefärbt
        // sind. Pro Layer im Preset mit autoColor: true einschalten.
        autoColor: true,
        // Bis zu so vielen Legendeneinträgen wird die Zuordnung Code->Klartext
        // nachgeschlagen (je Eintrag eine kleine Abfrage).
        maxLegendRules: 40,
        // Wie der ausgewertete Bereich auf der Karte gezeigt wird:
        // "highlight" füllt ihn ein, "border" zeichnet nur die Umrisse.
        // Achtung: "border" umrandet jedes einzelne Objekt, nicht die
        // Außenkante des Bereichs - bei vielen kleinen Flächen ein Netz.
        areaStyle: "highlight",
        // Farbe dafür, als Hex-Wert. Alles andere wird verworfen.
        areaColor: "#E2001A",
        // Per-layer defaults, matched on the exact layer id. Every field except
        // layerId is optional; a field naming an attribute the layer does not
        // have is ignored (with a warning on the console).
        // Use the technical attribute names, not the readable ones.
        presets: [
            {
                // "ab 2021 - Reale Nutzung der bebauten Flächen 2021 (Flächennutzung)"
                layerId:
                    "ua_flaechennutzung:a_reale_nutzung_bebaute_flaechen_2021",
                // filterAttribute: "bezirk",
                areaAttribute: "flalle",
                mode: "area",
                analyseAttribute: "woz_name",
                // Die Legende dieses Layers ist nach woz eingefärbt.
                autoColor: true,
            },
        ],
    },
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

