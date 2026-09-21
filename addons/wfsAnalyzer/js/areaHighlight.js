/**
 * The style the analysed area is drawn with, and the request parameters that
 * go with it.
 *
 * The service renders the highlight itself: `SLD_BODY` replaces the layer's own
 * cartography with one flat colour, and the GeoServer option
 * `antialias:none` keeps it at exactly that one colour. Measured over one
 * district at 1200x1080 that is 127 KB instead of 409 KB, and it leaves the
 * browser nothing to compute - the picture arrives ready.
 * @module addons/wfsAnalyzer/js/areaHighlight
 */

/**
 * Colour of the highlight. Opaque here; the layer is made translucent on the
 * map instead, so the image stays a single colour and compresses well.
 * @type {String}
 */
export const highlightColor = "#E2001A";

/**
 * Builds an SLD that paints every feature in one flat colour.
 * @param {String} layerName name of the WMS layer the style applies to.
 * @param {String} [color=highlightColor] the fill colour.
 * @returns {String} the SLD document.
 */
export function buildHighlightSld (layerName, color = highlightColor) {
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        "<StyledLayerDescriptor version=\"1.0.0\" xmlns=\"http://www.opengis.net/sld\">" +
        `<NamedLayer><Name>${layerName}</Name><UserStyle><FeatureTypeStyle><Rule>` +
        `<PolygonSymbolizer><Fill><CssParameter name="fill">${color}</CssParameter></Fill></PolygonSymbolizer>` +
        "<PointSymbolizer><Graphic><Mark><WellKnownName>circle</WellKnownName>" +
        `<Fill><CssParameter name="fill">${color}</CssParameter></Fill></Mark><Size>6</Size></Graphic></PointSymbolizer>` +
        // Kept thin on purpose: GeoServer strokes polygon outlines with this
        // too, and every pixel of it widens the measured extent.
        `<LineSymbolizer><Stroke><CssParameter name="stroke">${color}</CssParameter>` +
        "<CssParameter name=\"stroke-width\">1</CssParameter></Stroke></LineSymbolizer>" +
        "</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";
}

/**
 * The WMS parameters shared by the map overlay and the probe images.
 * @param {String} layerName name of the WMS layer.
 * @param {String} cqlFilter the filter describing the analysed area.
 * @returns {Object} the parameters.
 */
export function buildHighlightParams (layerName, cqlFilter) {
    const params = {
        LAYERS: layerName,
        STYLES: "",
        FORMAT: "image/png",
        TRANSPARENT: true,
        SLD_BODY: buildHighlightSld(layerName),
        // Without this GeoServer blends the edges and the flat fill turns into
        // a thousand shades, which triples the size of the image.
        format_options: "antialias:none"
    };

    if (cqlFilter !== "") {
        params.CQL_FILTER = cqlFilter;
    }

    return params;
}
