import Layer from "./layer";
import WFSLayer from "./wfs";
import {geojson, wfs} from "@masterportal/masterportalapi";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import WebGLVectorLayerRenderer from "ol/renderer/webgl/VectorLayer";
import VectorLayer from "ol/layer/Layer";
import LoaderOverlay from "../../utils/loaderOverlay";
import VectorSource from "ol/source/Vector.js";
import * as bridge from "./RadioBridge.js";
import {bbox, all} from "ol/loadingstrategy.js";
// import {asArray} from "ol/color";
import {packColor} from "ol/renderer/webgl/shaders";

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

// /**
//  * @todo an vectorStyles.js anpassen!
//  * @param {Object} conditions - the condition definition
//  * @returns {Boolean} are the conditions met?
//  */
// function parseCondition (conditions) {
//     // if no condition is given, always return true
//     if (!conditions) {
//         return () => true;
//     }

//     // build check function from the conditions
//     // todo: simplify, consolidtate with original vectorStyles
//     return (feature) => {
//         const properties = conditions.properties || {};
        
//         console.log(properties);
//         for (const attr in properties) {
//             const {val, isNumber} = !isNaN(parseFloat(feature.get(attr))) ?
//                 {val: parseFloat(feature.get(attr)), isNumber: true} :
//                 {val: feature.get(attr), isNumber: false};

//             console.log(val, properties[attr], attr)
//             // if literal value, compare for EQ
//             if (!Array.isArray(properties[attr])) {
//                 console.log(val, isNumber ? parseFloat(properties[attr]) : properties[attr])
//                 if (val !== isNumber ? parseFloat(properties[attr]) : properties[attr]) {
//                     return false;
//                 }
//             }
//             // if value is interval [number, number], compare for BETWEEN
//             else if (properties[attr].length === 2) {
//                 // if bounds are null, compare for >= or <=
//                 if (properties[attr][0] === null) {
//                     properties[attr][0] = -Infinity;
//                 }
//                 if (properties[attr][1] === null) {
//                     properties[attr][1] = Infinity;
//                 }
//                 if (
//                     feature.get(attr) >= (isNumber ? parseFloat(properties[attr][0]) : properties[attr][0]) &&
//                     feature.get(attr) <= (isNumber ? parseFloat(properties[attr][1]) : properties[attr][1])
//                 ) {
//                     return false;
//                 }
//             }
//         }

//         return true;
//     };
// }

// /**
//  * finds a matching rule from style.json
//  * @todo consolidate with original vectorStyles.js
//  * @param {module:ol/Feature} feature - the feature to check
//  * @param {module:Backbone/Model} styleModel - the style model from StyleList
//  * @returns {Object} the matching rule
//  */
// function getRule (feature, styleModel) {
//     // console.log(styleModel)
//     return styleModel?.getRulesForFeature(feature)[0];
//     // return styleDef?.rules?.find(r => parseCondition(r.conditions)(feature));
// }

/**
 * parses the styling rules for the renderer
 * @returns {Object} the style options object with conditional functions
 */
function getStyleFunctions () {
    return {
        fill: {
            attributes: {
                color: (feature) => {
                    if (!feature._styleRule) {
                        return packColor("#006688");
                    }
                    return packColor(feature._styleRule.style.polygonFillColor);
                },
                opacity: (feature) => {
                    if (!feature._styleRule) {
                        return 0.8;
                    }
                    return feature._styleRule.style.polygonFillColor[3] || 1;
                }
            }
        },
        stroke: {
            attributes: {
                color: (feature) => {
                    if (!feature._styleRule) {
                        return packColor("#006688");
                    }
                    return packColor(feature._styleRule.style.polygonStrokeColor);
                },
                width: (feature) => {
                    if (!feature._styleRule) {
                        return packColor("#006688");
                    }
                    return feature._styleRule.style.polygonStrokeWidth;
                },
                opacity: (feature) => {
                    if (!feature._styleRule) {
                        return packColor("#006688");
                    }
                    return feature._styleRule.style.polygonStrokeColor[3] || 1;
                }
            }
        },
        point: {
            attributes: {
                color: (feature) => {
                    if (!feature._styleRule) {
                        return packColor("#006688");
                    }
                    return packColor(feature._styleRule.style.circleFillColor);
                },
                size: (feature) => {
                    if (!feature._styleRule) {
                        return 20;
                    }
                    return packColor(feature._styleRule.style.circleRadius);
                },
                opacity: (feature) => {
                    if (!feature._styleRule) {
                        return 0.8;
                    }
                    return feature._styleRule.style.circleFillColor[3] || 1;
                },
                type: () => "circle",
                symbolType: () => "circle"
            }
        }
    };
}

/**
 * Creates a layer of type WebGL (point geometries only).
 * @param {Object} attrs  attributes of the layer
 * @property {module:ol/Feature[]} features the OL features
 * @property {module:ol/source/Vector} source the OL source object
 * @property {module:ol/layer/Layer} layer the OL layer object
 * @property {Boolean} _isPointLayer (private) whether the layer consists only of points
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
        sourceLayer = rawLayerList.getLayerWhere({id: attrs.sourceId}),
        options = {
            map: mapCollection.getMap("2D"),
            featuresFilter: this.getFeaturesFilterFunction(attrs),
            beforeLoading: function () {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            }.bind(this),
            afterLoading: function (features) {
                const styleModel = bridge.getStyleModelById(attrs.styleId); // load styleModel to extract rules per feature

                if (Array.isArray(features)) {
                    features.forEach((feature, idx) => {
                        if (typeof feature?.getId === "function" && typeof feature.getId() === "undefined") {
                            feature.setId("webgl-" + attrs.id + "-feature-id-" + idx);
                        }
                        this.formatFeatureGeometry(feature); /** @deprecated will propbably not be necessary anymore in release version */
                        this.formatFeatureStyles(feature, styleModel); /** @todo needs refactoring for production  */
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
 * Creates a layer object to extend from.
 * @param {Object} attrs attributes of the layer
 * @returns {module:ol/layer/Layer} the LocalWebGLLayer with a custom renderer for WebGL styling
 */
WebGLLayer.prototype.createVectorLayerRenderer = function () {
    /**
     * @class LocalWebGLLayer
     * @description the temporary class with a custom renderer to render the vector data with WebGL
     */
    class LocalWebGLLayer extends VectorLayer {
        /**
         * Creates a new renderer that takes the defined style of the new layer as an input
         * @returns {module:ol/renderer/webgl/WebGLVectorLayerRenderer} the custom renderer
         * @experimental
         */
        createRenderer () {
            return new WebGLVectorLayerRenderer(this, getStyleFunctions());
        }
    }

    return LocalWebGLLayer;
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
    let LayerConstructor = WebGLPointsLayer;
    const opts = {
        id: attrs.id,
        source: this.source,
        disableHitDetection: false,
        name: attrs.name,
        typ: attrs.typ,
        gfiAttributes: attrs.gfiAttributes,
        gfiTheme: attrs.gfiTheme,
        hitTolerance: attrs.hitTolerance,
        opacity: attrs.transparency ? (100 - attrs.transparency) / 100 : attrs.opacity
    };

    if (this.isPointLayer(attrs.isPointLayer)) {
        /**
         * @deprecated
         * @todo will be replaced in the next OL release and incorporated in the WebGLVectorLayerRenderer
         */
        return new LayerConstructor({
            style: attrs.style,
            disableHitDetection: false,
            ...opts
        });
    }

    LayerConstructor = this.createVectorLayerRenderer(attrs);
    return new LayerConstructor({
        ...opts
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
 * Parses the vectorStyle from style.json to the feature
 * to reduce processing on runtime
 * @param {module:ol/Feature} feature - the feature to check
 * @param {module:Backbone/Model} [styleModel] - (optional) the style model from StyleList
 * @returns {void}
 */
WebGLLayer.prototype.formatFeatureStyles = function (feature, styleModel) {
    const rule = styleModel?.getRulesForFeature(feature)[0];

    // don't set on properties to avoid GFI issues
    // undefined if no match
    feature._styleRule = rule;
};

/**
 * Layouts the geometry coordinates, removes the Z component
 * @deprecated Will be removed in release
 * @param {module:ol/Feature} feature - the feature to format
 * @returns {void}
 */
WebGLLayer.prototype.formatFeatureGeometry = function (feature) {
    feature.getGeometry()
        .setCoordinates(feature.getGeometry().getCoordinates(), "XY");
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

/**
 * Returns whether the layer consists only of points
 * @deprecated Will be removed as soon as OL WebGL features are consolidated
 * @param {Boolean} [isPointLayer] boolean flag set in config/service
 * @returns {Boolean} true / false
 */
WebGLLayer.prototype.isPointLayer = function (isPointLayer) {
    if (this._isPointLayer === undefined) {
        // if provided, set flag hard
        if (typeof isPointLayer === "boolean") {
            this._isPointLayer = isPointLayer;
        }
        else {
            this._isPointLayer = this.source.getFeatures().every(feature => {
                const geomType = feature.getGeometry().getType();

                return geomType === "Point" || geomType === "MultiPoint";
            });
        }
    }

    return this._isPointLayer;
};

