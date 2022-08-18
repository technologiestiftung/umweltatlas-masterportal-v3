import Layer from "./layer";
import WFSLayer from "./wfs";
import {geojson, wfs} from "@masterportal/masterportalapi";
import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import LoaderOverlay from "../../utils/loaderOverlay";
import VectorSource from "ol/source/Vector.js";
import * as bridge from "./RadioBridge.js";
import {bbox, all} from "ol/loadingstrategy.js";

const defaultStyle = {
    symbol: {
        symbolType: "circle",
        size: 20,
        color: "#006688",
        rotateWithView: false,
        offset: [0, 0],
        opacity: 0.6
    }
};

/**
 * Creates a layer of type WebGL (point geometries only).
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function WebGLLayer (attrs) {
    const defaults = {
        style: defaultStyle,
        hitTolerance: 20
    };

    this.features = [];
    this.createLayer({...defaults, ...attrs});

    Layer.call(this, {...defaults, ...attrs}, this.layer, !attrs.isChildLayer);
    this.createLegend(attrs);

    console.log(this);
}

// Link prototypes and add prototype methods, means WFSLayer uses all methods and properties of Layer
WebGLLayer.prototype = Object.create(Layer.prototype);

/**
 * Triggert by Layer to create a ol/layer/Vector
 * @param {Object} attrs  attributes of the layer
 * @fires MapView#RadioRequestGetProjection
 * @returns {void}
 */
WebGLLayer.prototype.createLayer = function (attrs) {
    const
        sourceLayer = getLayerWhere({id: attrs.sourceId}),
        options = {
            map: mapCollection.getMap("2D"),
            featuresFilter: this.getFeaturesFilterFunction(attrs),
            beforeLoading: function () {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            }.bind(this),
            afterLoading: function (features) {
                if (Array.isArray(features)) {
                    features.forEach((feature, idx) => {
                        if (typeof feature?.getId === "function" && typeof feature.getId() === "undefined") {
                            feature.setId("webgl-" + attrs.id + "-feature-id-" + idx);
                        }
                        this.formatFeatureData(feature, attrs.excludeTypesFromParsing);

                    });
                }
                this.featuresLoaded(attrs.id, features);
                this.features = features;
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.hide();
                }
            }.bind(this),
            onLoadingError: (error) => {
                console.error("masterportal wfs loading error:", error);
            },
            wfsFilter: sourceLayer.wfsFilter,
            loadingParams: {
                xhrParameters: sourceLayer.isSecured ? {credentials: "include"} : undefined,
                propertyname: WFSLayer.prototype.getPropertyname(sourceLayer) || undefined,
                // only used if loading strategy is all
                bbox: attrs.bboxGeometry ? attrs.bboxGeometry.getExtent().toString() : undefined
            },
            loadingStrategy: attrs.loadingStrategy === "all" ? all : bbox
        };

    this.source = this.createLayerSource(sourceLayer, options);
    this.layer = this.createLayerInstance(attrs);
};

/**
 * Returns a function to filter features with.
 * @param {Object} attrs  params of the raw layer
 * @returns {Function} to filter features with
 */
WebGLLayer.prototype.getFeaturesFilterFunction = function (attrs) {
    return function (features) {
        // only use features with a geometry
        let filteredFeatures = features.filter(feature => feature.getGeometry() !== undefined);

        if (attrs.bboxGeometry) {
            filteredFeatures = filteredFeatures.filter((feature) => attrs.bboxGeometry.intersectsExtent(feature.getGeometry().getExtent()));
        }
        return filteredFeatures;
    };
};

/**
 * Creates a VectorSource. Either from WFS or GeoJSON.
 * @param {Object} rawLayer layer specification as in services.json
 * @param {Object} options - options of the target layer
 * @returns {module:ol/source/Vector} returns the VectorSource
 */
WebGLLayer.prototype.createLayerSource = function (rawLayer, options) {
    if (rawLayer.typ === "WFS") {
        const wfsSource = wfs.createLayerSource(rawLayer, options);

        // clean the old data if WFS is reloaded, or BBOX loading strategy is used
        wfsSource.on("featuresloadstart", this.clearSource.bind(this));
        return wfsSource;
    }
    if (rawLayer.typ === "GeoJSON") {
        return geojson.createLayerSource({url: rawLayer.url, features: rawLayer.features}, options);
    }

    return new VectorSource();
};

/**
 * Creates the OL Layer instance, used to rebuild the layer when shown again after layer has been disposed
 * @param {Object} attrs - the attributes of the layer
 * @returns {module:ol/layer/Vector} returns the layer instance
 */
WebGLLayer.prototype.createLayerInstance = function (attrs) {
    return new WebGLPointsLayer({
        id: attrs.id,
        source: this.source,
        style: attrs.style,
        disableHitDetection: false,
        name: attrs.name,
        typ: attrs.typ,
        gfiAttributes: attrs.gfiAttributes,
        gfiTheme: attrs.gfiTheme,
        hitTolerance: attrs.hitTolerance
    });
};

/**
 * Creates the legend
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
WebGLLayer.prototype.createLegend = function (attrs) {
    const styleId = attrs.styleId,
        styleModel = bridge.getStyleModelById(styleId);
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (styleModel && legend === true) {
        this.setLegend(styleModel.getLegendInfos());
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};

/**
 * Updates the layers source by calling refresh at source.
 * @returns {void}
 */
WebGLLayer.prototype.updateSource = function () {
    this.source.refresh();
};

/**
 * Clears the layer' source.
 * @returns {void}
 */
WebGLLayer.prototype.clearSource = function () {
    this.source.clear();
};

/**
 * Automatically cleans the data by automatically parsing data provided as strings to the accurate data type
 * @todo Extend to Date types
 * @param {module:ol/Feature} feature - the feature to format
 * @param {Array<String>} [excludeTypes=["boolean"]] - types that should not be parsed from strings
 * @returns {void}
 */
WebGLLayer.prototype.formatFeatureData = function (feature, excludeTypes = ["boolean"]) {
    for (const key in feature.getProperties()) {
        const
            valueAsNumber = parseFloat(feature.get(key)),
            valueIsTrue = typeof feature.get(key) === "string" && feature.get(key).toLowerCase() === "true" ? true : undefined,
            valueIsFalse = typeof feature.get(key) === "string" && feature.get(key).toLowerCase() === "false" ? false : undefined;

        if (!isNaN(parseFloat(feature.get(key))) && !excludeTypes.includes("number")) {
            feature.set(key, valueAsNumber);
        }
        if (valueIsTrue === true && !excludeTypes.includes("boolean")) {
            feature.set(key, valueIsTrue);
        }
        if (valueIsFalse === false && !excludeTypes.includes("boolean")) {
            feature.set(key, valueIsFalse);
        }
    }
};

/**
 * Sets the attribute isSelected and sets the layers visibility. If newValue is false, the layer is removed from map.
 * Calls the layer super, disposes WebGL resources if layer is set invisible
 * @param {Boolean} newValue true, if layer is selected
 * @returns {void}
 */
WebGLLayer.prototype.setIsSelected = function (newValue) {
    if (this.isDisposed()) {
        this.layer = this.createLayerInstance(this.attributes);
    }

    Layer.prototype.setIsSelected.call(this, newValue);

    if (!this.get("isVisibleInMap")) {
        this.layer.dispose();
    }
};

/**
 * Hides all features by removing them from the layer source.
 * @returns {void}
 */
WebGLLayer.prototype.hideAllFeatures = function () {
    this.clearSource();
};

/**
 * sets the layerSource to have the inital features array
 * @returns {void}
 */
WebGLLayer.prototype.showAllFeatures = function () {
    this.hideAllFeatures();
    this.source.addFeatures(this.features);
};

/**
 * Filters the visibility of features by ids.
 * @param  {String[]} featureIdList Feature ids to be shown.
 * @return {void}
 */
WebGLLayer.prototype.showFeaturesByIds = function (featureIdList) {
    const featuresToShow = featureIdList.map(id => this.features.find(feature => feature.getId() === id));

    this.hideAllFeatures();
    this.source.addFeatures(featuresToShow);
};

/**
 * Returns whether the WebGL resources have been disposed
 * @returns {Boolean} true / false
 */
WebGLLayer.prototype.isDisposed = function () {
    return this.layer ? this.layer.disposed : true;
};


