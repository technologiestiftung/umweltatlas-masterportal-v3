import ImageLayer from "ol/layer/Image.js";
import ImageWMS from "ol/source/ImageWMS.js";

import {areaLayerOpacity, buildHighlightParams} from "./areaHighlight";

/**
 * Draws the area an analysis covers onto the map.
 *
 * The same WMS that serves the layer renders the highlight, filtered by the
 * analysis' own CQL filter, so what is shown is exactly what was counted. The
 * image arrives as one flat colour (see `areaHighlight`), which leaves nothing
 * to compute in the browser - no geometries are loaded and no pixels touched.
 * @module addons/wfsAnalyzer/js/areaLayer
 */

/**
 * Above the subject data layers, below the map markers.
 * @type {Number}
 */
const layerZIndex = 900;

/**
 * Builds the highlight layer for one analysis.
 * @param {Object} params the parameters.
 * @param {String} params.wmsUrl url of the WMS.
 * @param {String} params.layerName name of the layer.
 * @param {String} params.cqlFilter the filter describing the analysed area.
 * @param {String} [params.style] "highlight", "border" or "mask".
 * @param {String} [params.color] the colour as a hex string.
 * @param {Number} [params.opacity] how much of the map shows through, 0 to 1.
 * @returns {module:ol/layer/Image} the layer.
 */
export function createAreaLayer ({wmsUrl, layerName, cqlFilter, style, color, opacity}) {
    return new ImageLayer({
        // Applied here rather than in the style, so the image the service sends
        // stays a single colour and compresses.
        opacity: areaLayerOpacity(style, opacity),
        zIndex: layerZIndex,
        source: new ImageWMS({
            url: wmsUrl,
            // No margin around the viewport: every extra pixel is transferred
            // and the area is redrawn on every move anyway.
            ratio: 1,
            serverType: "geoserver",
            params: buildHighlightParams(layerName, drawnFilter(cqlFilter, style), {style, color})
        })
    });
}

/**
 * What the service should draw: the area itself, or - for the mask - everything
 * but the area.
 *
 * Turning it around in the filter keeps it a plain map layer. Painting a veil
 * onto the map canvas and cutting the area out of it with `destination-out`
 * removes whatever was drawn there before, the map included: the selected
 * district came out blank white. Inverting the picture instead, through
 * `ol/source/Raster`, rendered nothing at all. The service knows its own data
 * best, and `NOT (...)` costs one filter.
 *
 * What lies outside the layer keeps its colours - there is no data there to
 * dim, and dimming the basemap of the surrounding region says nothing.
 * @param {String} cqlFilter the filter describing the area.
 * @param {String} style the area style.
 * @returns {String} the filter to draw with.
 */
export function drawnFilter (cqlFilter, style) {
    return style === "mask" && cqlFilter !== "" ? `NOT (${cqlFilter})` : cqlFilter;
}

/**
 * The highlight currently on the map. There is only ever one, and it is kept
 * here rather than in the store: an OpenLayers layer is not state to be
 * serialized or made reactive.
 * @type {module:ol/layer/Image|null}
 */
let currentLayer = null;

/**
 * Takes the highlight off the map, if one is showing.
 * @returns {void}
 */
export function removeAreaLayer () {
    const map = mapCollection?.getMap("2D");

    if (currentLayer && map) {
        map.removeLayer(currentLayer);
    }
    currentLayer = null;
}

/**
 * Puts the highlight on the map, replacing whatever was there before.
 *
 * The layer is added straight to the OpenLayers map rather than to the layer
 * configuration, so it stays out of the topic tree - the same way the draw tool
 * handles its own layer.
 * @param {Object} params as for createAreaLayer.
 * @returns {Boolean} true if a highlight is now showing.
 */
export function showAreaLayer (params) {
    const map = mapCollection?.getMap("2D");

    removeAreaLayer();

    if (!map || !params?.wmsUrl || !params?.layerName || params?.cqlFilter === "") {
        return false;
    }

    currentLayer = createAreaLayer(params);
    map.addLayer(currentLayer);

    return true;
}
