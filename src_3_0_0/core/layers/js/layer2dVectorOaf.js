import {all, bbox} from "ol/loadingstrategy.js";
import {oaf} from "@masterportal/masterportalapi";
import Layer2dVector from "./layer2dVector";

/**
 * Creates a 2d vector oaf (OGC API - Features) layer.
 * @constructs
 * @extends Layer2dVector
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorOaf (attributes) {
    const defaultAttributes = {
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2dVector.call(this, this.attributes);
}

Layer2dVectorOaf.prototype = Object.create(Layer2dVector.prototype);

/**
 * Creates a layer of type Geojson by using geojson-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorOaf.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes),
        options = this.getOptions(attributes);

    this.setLayer(oaf.createLayer(rawLayerAttributes, {layerParams, options}));
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dVectorOaf.prototype.getRawLayerAttributes = function (attributes) {
    return {
        bbox: attributes.bbox,
        bboxCrs: attributes.bboxCrs,
        clusterDistance: attributes.clusterDistance,
        collection: attributes.collection,
        crs: attributes.crs === false || attributes.crs ? attributes.crs : "http://www.opengis.net/def/crs/EPSG/0/25832",
        datetime: attributes.datetime,
        id: attributes.id,
        limit: typeof attributes.limit === "undefined" ? 400 : attributes.limit,
        offset: attributes.offset,
        params: attributes.params,
        url: attributes.url
    };
};

/**
 * Gets additional options.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The options.
 */
Layer2dVectorOaf.prototype.getOptions = function (attributes) {
    const options = {
        clusterGeometryFunction: this.clusterGeometryFunction,
        featuresFilter: (features) => this.featuresFilter(attributes, features),
        loadingParams: this.loadingParams(attributes),
        loadingStrategy: attributes.loadingStrategy === "all" ? all : bbox,
        onLoadingError: this.onLoadingError
    };

    return options;
};