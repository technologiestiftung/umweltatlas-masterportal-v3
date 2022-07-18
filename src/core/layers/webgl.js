import Layer from "./layer";
import {GeoJSON} from "ol/format";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import VectorSource from "ol/source/Vector";

const defaultStyle = {
    symbol: {
        symbolType: "circle",
        size: 40,
        color: "#006688",
        rotateWithView: false,
        offset: [0, 0],
        opacity: 0.8
    }
};

/**
 * Creates a layer of type WebGL (point geometries only).
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function WebGLLayer (attrs) {
    const defaults = {
        style: defaultStyle
    };

    this.createLayer({...defaults, ...attrs});

    Layer.call(this, {...defaults, ...attrs}, this.layer, !attrs.isChildLayer);
}

// Link prototypes and add prototype methods, means WFSLayer uses all methods and properties of Layer
WebGLLayer.prototype = Object.create(Layer.prototype);
WebGLLayer.prototype.createLayer = function (attrs) {
    const
        source = new VectorSource({
            url: "./esf_projekte.geojson",
            format: new GeoJSON()
        }),
        layer = new WebGLPointsLayer({
            source,
            style: attrs.style,
            disableHitDetection: false
        });

    console.log(source);
    console.log(layer);
    console.log(mapCollection);

    this.layer = layer;
};

