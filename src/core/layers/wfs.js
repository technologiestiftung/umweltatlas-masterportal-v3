import {wfs} from "@masterportal/masterportalapi";
import LoaderOverlay from "../../utils/loaderOverlay";
import Layer from "./layer";
import {returnStyleObject} from "masterportalapi/src/vectorStyle/styleList";
import {createStyle, returnLegends} from "masterportalapi/src/vectorStyle/createStyle";
import {getGeometryTypeFromWFS, getGeometryTypeFromSecuredWFS} from "masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import * as bridge from "./RadioBridge.js";
import Cluster from "ol/source/Cluster";
import {bbox, all} from "ol/loadingstrategy.js";

/**
 * Creates a layer of type WFS.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function WFSLayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        showSettings: true,
        isSecured: false,
        altitudeMode: "clampToGround",
        useProxy: false,
        sourceUpdated: false
    };

    this.createLayer(Object.assign(defaults, attrs));

    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.set("style", this.getStyleFunction(attrs));
    this.prepareFeaturesFor3D(this.layer.getSource().getFeatures());
    // TODO: muss überprüft werden:  this.createLegend();
}
// Link prototypes and add prototype methods, means WFSLayer uses all methods and properties of Layer
WFSLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates a layer of type WFS by using wfs-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
WFSLayer.prototype.createLayer = function (attrs) {
    const rawLayerAttributes = {
            id: attrs.id,
            url: attrs.url,
            clusterDistance: attrs.clusterDistance,
            featureNS: attrs.featureNS,
            featureType: attrs.featureType,
            version: attrs.version
        },
        layerParams = {
            name: attrs.name,
            typ: attrs.typ,
            gfiAttributes: attrs.gfiAttributes,
            gfiTheme: attrs.gfiTheme,
            hitTolerance: attrs.hitTolerance,
            altitudeMode: attrs.altitudeMode,
            alwaysOnTop: attrs.alwaysOnTop,
            layerSequence: attrs.layerSequence
        },
        styleFn = this.getStyleFunction(attrs),
        options = {
            doNotLoadInitially: attrs.doNotLoadInitially,
            wfsFilter: attrs.wfsFilter,
            clusterGeometryFunction: (feature) => {
                // do not cluster invisible features; can't rely on style since it will be null initially
                if (feature.get("hideInClustering") === true) {
                    return null;
                }
                return feature.getGeometry();
            },
            featuresFilter: this.getFeaturesFilterFunction(attrs),
            // If an Object contains a property which holds a Function, the property is called a method.
            // This method, when called, will always have it's this variable set to the Object it is associated with.
            // This is true for both strict and non-strict modes.
            // therefore use [fn].bind(this)
            beforeLoading: function () {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            }.bind(this),
            afterLoading: function (features) {
                this.featuresLoaded(attrs.id, features);
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.hide();
                }
            }.bind(this),
            onLoadingError: (error) => {
                console.error("masterportal wfs loading error:", error);
            },
            loadingParams: {
                xhrParameters: attrs.isSecured ? {credentials: "include"} : undefined,
                propertyname: this.getPropertyname(attrs) || undefined,
                // only used if loading strategy is all
                bbox: attrs.bboxGeometry ? attrs.bboxGeometry.getExtent().toString() : undefined
            },
            loadingStrategy: attrs.loadingStrategy === "all" ? all : bbox
        };

    if (styleFn) {
        styleFn.bind(this);
    }
    options.style = styleFn;

    this.layer = wfs.createLayer(rawLayerAttributes, {layerParams, options});
};

/**
 * Returns a function to filter features with.
 * @param {Object} attrs  params of the raw layer
 * @returns {Function} to filter features with
 */
WFSLayer.prototype.getFeaturesFilterFunction = function (attrs) {
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
 * Returns the propertynames as comma separated string.
 * @param {Object} attrs  params of the raw layer
 * @returns {string} the propertynames as string
 */
WFSLayer.prototype.getPropertyname = function (attrs) {
    let propertyname = "";

    if (Array.isArray(attrs.propertyNames)) {
        propertyname = attrs.propertyNames.join(",");
    }
    return propertyname;
};

/**
 * Sets Style for layer.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
WFSLayer.prototype.getStyleFunction = function (attrs) {
    const styleId = attrs.styleId,
        styleObject = returnStyleObject(styleId);
    let isClusterFeature = false,
        style = null;

    if (styleObject !== undefined) {
        style = (feature) => {
            const feat = feature !== undefined ? feature : this;

            this.createLegend();
            isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features"));
            return createStyle(styleObject, feat, isClusterFeature, Config.wfsImgPath);
        };
    }
    else {
        console.error(i18next.t("common:modules.core.modelList.layer.wrongStyleId", {styleId}));
    }
    return style;
};
/**
 * Updates the layers source by calling refresh at source. Depending on attribute 'sourceUpdated'.
 * @returns {void}
 */
WFSLayer.prototype.updateSource = function () {
    if (this.get("sourceUpdated") === false) {
        this.set("sourceUpdated", true);
        this.layer.getSource().refresh();
    }
};
/**
 * Creates the legend
 * @returns {void}
 */
WFSLayer.prototype.createLegend = function () {
    const styleObject = returnStyleObject(this.attributes.styleId),
        isSecured = this.attributes.isSecured,
        isDefault = this.attributes.styleId,
        legendInfos = returnLegends();
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
    else if (styleObject && legend === true && legendInfos) {
        // TODO: auskommentiert, da nie etwas gefunden wurde und alerts abgestellt werden mussten.
        // if (!isSecured) {
        //     getGeometryTypeFromWFS(this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"), this.get("useProxy"),
        //         (error) => {
        //             if (error) {
        //                 Radio.trigger("Alert", "alert", {
        //                     text: "<strong>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
        //                         + "<small>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailedMessage") + "</small>",
        //                     kategorie: "alert-warning"
        //                 });
        //             }
        //         });
        // }
        // else if (isSecured) {
        //     getGeometryTypeFromSecuredWFS(this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"),
        //         (error) => {
        //             if (error) {
        //                 Radio.trigger("Alert", "alert", {
        //                     text: "<strong>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
        //                         + "<small>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailedMessage") + "</small>",
        //                     kategorie: "alert-warning"
        //                 });
        //             }
        //         });
        // }
        setTimeout(() => {
            if (styleObject.styleId === "default") {
                const defaultLegends = legendInfos.find(element => element.id === "default"),
                    type = this.layer.getSource().getFeatures()[0].getGeometry().getType(),
                    typeSpecificLegends = [];

                if (defaultLegends) {
                    if (type === "MultiLineString") {
                        typeSpecificLegends.push(defaultLegends.legendInformation.find(element => element.geometryType === "LineString"));
                        this.setLegend(typeSpecificLegends);
                    }
                    else {
                        typeSpecificLegends.push(defaultLegends.legendInformation.find(element => element.geometryType === type));
                        this.setLegend(typeSpecificLegends);
                    }
                }
            }
            else {
                const selected = legendInfos.find(element => element.id === styleObject.styleId);

                if (selected) {
                    this.setLegend(selected.legendInformation);
                }
            }
        }, 100);
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};
/**
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
WFSLayer.prototype.hideAllFeatures = function () {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        features = layerSource.getFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    features.forEach((feature) => {
        feature.set("hideInClustering", true);
        feature.setStyle(() => null);
    });

    layerSource.addFeatures(features);
};
/**
 * Shows all features by setting their style.
 * @returns {void}
 */
WFSLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach((feature) => {
        const style = this.getStyleAsFunction(this.get("style"));

        feature.setStyle(style(feature));
    });
};
/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
WFSLayer.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

    this.hideAllFeatures();
    featuresToShow.forEach(feature => {
        const style = this.getStyleAsFunction(this.get("style"));

        if (feature && feature !== null) {
            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }
    });

    layerSource.addFeatures(allLayerFeatures);
    bridge.resetVectorLayerFeatures(this.get("id"), allLayerFeatures);
};
/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
WFSLayer.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }

    return function () {
        return style;
    };
};
/**
 * Sets Style for layer.
 * @returns {void}
 */
WFSLayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};
