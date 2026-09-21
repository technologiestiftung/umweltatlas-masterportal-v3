/**
 * The style the analysed area is drawn with, and the request parameters that
 * go with it.
 *
 * The service renders it itself: `SLD_BODY` replaces the layer's own
 * cartography with one flat colour, and the GeoServer option `antialias:none`
 * keeps it at exactly that one colour. Measured over one district at 1200x1080
 * that is 119 KB instead of 409 KB, and it leaves the browser nothing to
 * compute - the picture arrives ready.
 * @module addons/wfsAnalyzer/js/areaHighlight
 */

/**
 * Fallback colour, used when the portal configures none or an unusable one.
 * @type {String}
 */
export const defaultAreaColor = "#E2001A";

/**
 * How the area is drawn: filled over, or outlined.
 * @type {String[]}
 */
export const areaStyles = ["highlight", "border"];

/**
 * Width of the outline in pixels.
 * @type {Number}
 */
const borderWidth = 2;

/**
 * Opacity of the highlight on the map, per style. A fill has to let the map
 * show through; an outline would only become hard to see.
 * @type {Object}
 */
const opacityByStyle = {highlight: 0.4, border: 1};

/**
 * Only plain CSS hex colours are passed on: the value ends up inside an SLD
 * document, so anything else has no business being interpolated into it.
 * @type {RegExp}
 */
const hexColor = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;

/**
 * @param {String} color the stroke colour.
 * @param {Number} width the stroke width in pixels.
 * @returns {String} the SLD stroke element.
 */
function strokeTag (color, width) {
    return `<Stroke><CssParameter name="stroke">${color}</CssParameter>` +
        `<CssParameter name="stroke-width">${width}</CssParameter></Stroke>`;
}

/**
 * Brings the configured style and colour into a usable shape.
 * @param {Object} [options={}] the configured options.
 * @param {String} [options.style] "highlight" or "border".
 * @param {String} [options.color] the colour as a hex string.
 * @returns {Object} the options as {style, color}.
 */
export function normalizeAreaStyle ({style, color} = {}) {
    return {
        style: areaStyles.includes(style) ? style : areaStyles[0],
        color: hexColor.test(String(color)) ? color : defaultAreaColor
    };
}

/**
 * @param {String} style the area style.
 * @returns {Number} the opacity the map layer is drawn with.
 */
export function areaLayerOpacity (style) {
    return opacityByStyle[normalizeAreaStyle({style}).style];
}

/**
 * Builds an SLD that paints every feature in one flat colour - filled over, or
 * outlined.
 *
 * An outline traces every single feature, not the outer edge of the area: the
 * service draws what it is asked to draw and knows nothing of a union. For a
 * layer of many small polygons that is a mesh, which is why the filled style is
 * the default.
 * @param {String} layerName name of the WMS layer the style applies to.
 * @param {Object} [options={}] as for normalizeAreaStyle.
 * @returns {String} the SLD document.
 */
export function buildHighlightSld (layerName, options = {}) {
    const {style, color} = normalizeAreaStyle(options),
        isBorder = style === "border",
        // Filled: the outline is kept hairline, because GeoServer strokes
        // polygons with it too and every pixel of it widens the measured extent.
        line = strokeTag(color, isBorder ? borderWidth : 1),
        fill = `<Fill><CssParameter name="fill">${color}</CssParameter></Fill>`,
        polygon = isBorder
            ? `<PolygonSymbolizer>${line}</PolygonSymbolizer>`
            : `<PolygonSymbolizer>${fill}${line}</PolygonSymbolizer>`,
        mark = `<Mark><WellKnownName>circle</WellKnownName>${isBorder ? line : fill}</Mark>`;

    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        "<StyledLayerDescriptor version=\"1.0.0\" xmlns=\"http://www.opengis.net/sld\">" +
        `<NamedLayer><Name>${layerName}</Name><UserStyle><FeatureTypeStyle><Rule>` +
        polygon +
        `<PointSymbolizer><Graphic>${mark}<Size>6</Size></Graphic></PointSymbolizer>` +
        `<LineSymbolizer>${line}</LineSymbolizer>` +
        "</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";
}

/**
 * The WMS parameters for one rendering of the analysed area.
 * @param {String} layerName name of the WMS layer.
 * @param {String} cqlFilter the filter describing the analysed area.
 * @param {Object} [options={}] as for normalizeAreaStyle.
 * @returns {Object} the parameters.
 */
export function buildHighlightParams (layerName, cqlFilter, options = {}) {
    const params = {
        LAYERS: layerName,
        STYLES: "",
        FORMAT: "image/png",
        TRANSPARENT: true,
        SLD_BODY: buildHighlightSld(layerName, options),
        // Without this GeoServer blends the edges and the flat colour turns
        // into a thousand shades, which triples the size of the image.
        format_options: "antialias:none"
    };

    if (cqlFilter !== "") {
        params.CQL_FILTER = cqlFilter;
    }

    return params;
}
