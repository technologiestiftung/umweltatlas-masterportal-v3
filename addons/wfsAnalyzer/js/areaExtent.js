/**
 * Finds the map extent an analysis covers, without downloading a single
 * geometry.
 *
 * The WFS answers `resultType=hits` with a count but no bounding box, and the
 * bounding box of a GeoJSON response only covers the features it actually
 * delivers - a megabyte for one district. The WMS, however, draws the filtered
 * features into an image of any size: a 300 pixel wide picture of all of Berlin
 * costs 2.3 KB, and the outermost non-transparent pixels in it are the extent,
 * accurate to one pixel.
 * @module addons/wfsAnalyzer/js/areaExtent
 */

import {buildHighlightParams} from "./areaHighlight";

/**
 * Width of the probe image in pixels. 300 over the whole of Berlin puts one
 * pixel at about 160 m, which the second pass then refines.
 * @type {Number}
 */
const probeWidth = 300;

/**
 * How long to wait for a probe image.
 * @type {Number}
 */
const imageTimeout = 20000;

/**
 * Builds the request for a probe image: the filtered features drawn on nothing,
 * so every visible pixel belongs to the analysed area.
 * @param {Object} params the parameters.
 * @param {String} params.wmsUrl url of the WMS.
 * @param {String} params.layerName name of the layer.
 * @param {String} params.cqlFilter the filter of the analysis.
 * @param {Number[]} params.extent the extent to look at as [minX, minY, maxX, maxY].
 * @param {String} params.crs the projection of that extent.
 * @param {Number} params.width width of the image in pixels.
 * @param {Number} params.height height of the image in pixels.
 * @returns {String} the request url.
 */
export function buildAreaImageUrl ({wmsUrl, layerName, cqlFilter, extent, crs, width, height}) {
    const url = new URL(wmsUrl);

    url.search = "";
    url.searchParams.set("service", "WMS");
    url.searchParams.set("version", "1.3.0");
    url.searchParams.set("request", "GetMap");
    url.searchParams.set("crs", crs);
    // Easting first. The service reads the extent this way even in WMS 1.3.0,
    // where the projection's own axis order would put northing first - and it
    // answers a swapped extent with a silently empty image, not an error.
    url.searchParams.set("bbox", extent.join(","));
    url.searchParams.set("width", String(width));
    url.searchParams.set("height", String(height));

    // Always the filled style, whatever the map shows: this image is measured,
    // not looked at, and a filled area marks every pixel it covers while an
    // outline would leave its inside blank.
    Object.entries(buildHighlightParams(layerName, cqlFilter, {style: "highlight"})).forEach(([key, value]) => {
        url.searchParams.set(key.toLowerCase(), String(value));
    });

    return url.toString();
}

/**
 * Reads the extent of everything visible in an image.
 * @param {Uint8ClampedArray} data the RGBA pixels, row by row from the top.
 * @param {Object} params the parameters.
 * @param {Number[]} params.extent the extent the image covers.
 * @param {Number} params.width width of the image in pixels.
 * @param {Number} params.height height of the image in pixels.
 * @returns {Number[]|null} the extent of the visible pixels, or null if none.
 */
export function readAlphaExtent (data, {extent, width, height}) {
    let minColumn = width,
        maxColumn = -1,
        minRow = height,
        maxRow = -1;

    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            // Anti-aliased edges fade out, so a barely visible pixel still
            // belongs to the area - only fully transparent ones do not.
            if (data[(row * width + column) * 4 + 3] === 0) {
                continue;
            }
            if (column < minColumn) {
                minColumn = column;
            }
            if (column > maxColumn) {
                maxColumn = column;
            }
            if (row < minRow) {
                minRow = row;
            }
            if (row > maxRow) {
                maxRow = row;
            }
        }
    }

    if (maxColumn < 0) {
        return null;
    }

    const [minX, minY, maxX, maxY] = extent,
        pixelWidth = (maxX - minX) / width,
        pixelHeight = (maxY - minY) / height;

    // A pixel covers a whole cell, so the outer edges of the outermost pixels
    // bound the area - never the pixel centres.
    return [
        minX + minColumn * pixelWidth,
        maxY - (maxRow + 1) * pixelHeight,
        minX + (maxColumn + 1) * pixelWidth,
        maxY - minRow * pixelHeight
    ];
}

/**
 * Loads an image and hands back its pixels. The service allows any origin to
 * read its images, which is what makes the whole approach possible.
 * @param {String} url the image url.
 * @param {Number} width width of the image.
 * @param {Number} height height of the image.
 * @returns {Promise<Uint8ClampedArray>} the RGBA pixels.
 */
function loadPixels (url, width, height) {
    return new Promise((resolve, reject) => {
        const image = new Image(),
            timer = setTimeout(() => reject(new Error("timeout")), imageTimeout);

        image.crossOrigin = "anonymous";
        image.onload = () => {
            clearTimeout(timer);
            try {
                const canvas = document.createElement("canvas"),
                    context = canvas.getContext("2d", {willReadFrequently: true});

                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0, width, height);
                resolve(context.getImageData(0, 0, width, height).data);
            }
            catch (error) {
                reject(error);
            }
        };
        image.onerror = () => {
            clearTimeout(timer);
            reject(new Error("image could not be loaded"));
        };
        image.src = url;
    });
}

/**
 * Asks the WMS to draw the analysed area once and reads its extent from the
 * picture.
 * @param {Object} params as for buildAreaImageUrl, without width and height.
 * @returns {Promise<Number[]|null>} the extent, or null if nothing is visible.
 */
async function probeExtent (params) {
    const [minX, minY, maxX, maxY] = params.extent,
        aspect = (maxY - minY) / Math.max(maxX - minX, 1),
        width = probeWidth,
        height = Math.max(1, Math.round(probeWidth * aspect)),
        url = buildAreaImageUrl({...params, width, height}),
        data = await loadPixels(url, width, height);

    return readAlphaExtent(data, {extent: params.extent, width, height});
}

/**
 * Widens an extent by a share of its size, so the second pass cannot clip what
 * the first one only just caught at the edge.
 * @param {Number[]} extent the extent.
 * @param {Number} share how much to add per side.
 * @returns {Number[]} the widened extent.
 */
function pad (extent, share) {
    const [minX, minY, maxX, maxY] = extent,
        padX = Math.max((maxX - minX) * share, 1),
        padY = Math.max((maxY - minY) * share, 1);

    return [minX - padX, minY - padY, maxX + padX, maxY + padY];
}

/**
 * Finds the extent of the analysed area in two passes: a coarse one over the
 * whole layer, then a close one over what that found. Two images, about 5 KB,
 * and an accuracy of a few dozen metres for a district.
 *
 * Any failure yields null rather than an error - the map simply does not move
 * then.
 * @param {Object} params the parameters.
 * @param {String} params.wmsUrl url of the WMS.
 * @param {String} params.layerName name of the layer.
 * @param {String} params.cqlFilter the filter of the analysis.
 * @param {Number[]} params.layerExtent the extent of the whole layer.
 * @param {String} params.crs the projection of the extents.
 * @returns {Promise<Number[]|null>} the extent of the area.
 */
export async function findAreaExtent ({wmsUrl, layerName, cqlFilter, layerExtent, crs}) {
    if (!wmsUrl || !layerName || !Array.isArray(layerExtent) || layerExtent.length !== 4) {
        return null;
    }

    try {
        const coarse = await probeExtent({wmsUrl, layerName, cqlFilter, extent: layerExtent, crs});

        if (!coarse) {
            return null;
        }

        const fine = await probeExtent({
            wmsUrl, layerName, cqlFilter, crs,
            extent: pad(coarse, 0.05)
        });

        return fine || coarse;
    }
    catch (error) {
        return null;
    }
}
