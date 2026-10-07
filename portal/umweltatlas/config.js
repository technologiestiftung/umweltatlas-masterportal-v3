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
            "finhalt",
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
        // Bis zu so vielen Legendeneinträgen werden die Klassen der Karte
        // angeboten und Codes in Klartext aufgelöst (je Eintrag eine kleine
        // Abfrage, parallel). Bodengesellschaften 2020 hat 133.
        maxLegendRules: 150,
        // Wie die Klartext-Spalte neben der Code-Spalte heißt:
        // woz -> woz_name, typ -> typklar, bgs_neu -> bgs_neu_bez.
        nameSuffixes: ["_name", "klar", "_bez"],
        // Wie der ausgewertete Bereich auf der Karte gezeigt wird:
        // "mask"      legt einen Schleier über alles andere und lässt den
        //             Bereich frei,
        // "highlight" füllt den Bereich ein,
        // "border"    zeichnet nur die Umrisse - Achtung: die jedes einzelnen
        //             Objekts, nicht die Außenkante des Bereichs; bei vielen
        //             kleinen Flächen ein Netz.
        areaStyle: "mask",
        // Farbe dafür, als Hex-Wert. Bei "mask" ist das die Farbe des
        // Schleiers, nicht die des Bereichs - deshalb hier ein ruhiges Dunkel
        // statt des Signalrots "#E2001A", das zu "highlight"/"border" passte.
        areaColor: "#ffffff",
        // Wie kräftig, von 0 (unsichtbar) bis 1 (deckend). Ohne Angabe gilt der
        // Wert des jeweiligen Stils: 0.45 bei "mask", 0.4 bei "highlight",
        // 1 bei "border".
        areaOpacity: 0.85,
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
                // Ohne analyseAttribute greift die Legendenmethode: Die Karte
                // zeichnet neben den woz-Klassen auch "Grün- und Freifläche"
                // und "Gewässer" (woz IS NULL AND grz ...). Mit
                // analyseAttribute: "woz_name" fielen die beiden in eine
                // Sammelkategorie "(ohne Angabe)" von 46 %.
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

