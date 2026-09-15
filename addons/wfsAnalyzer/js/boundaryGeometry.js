import GeoJSON from "ol/format/GeoJSON.js";

/**
 * Finds the outline that belongs to a selected value, e.g. the district
 * boundary for "Mitte".
 *
 * The lookup is by value, not by attribute name: a boundary file declares which
 * of its properties carries the value, and the value of the current area
 * selection is looked up in it. That makes it self-selecting - the district
 * names of `bezirk` are found, the codes of `bez` are not, and nothing is drawn
 * for them, which is the wanted behaviour.
 * @module addons/wfsAnalyzer/js/boundaryGeometry
 */

/**
 * Projection the bundled boundary files are stored in.
 * @type {String}
 */
const boundaryProjection = "EPSG:4326";

/**
 * Loads in flight or already finished, keyed by file name. The promise rather
 * than its result is kept, so two lookups started at the same time share one
 * download instead of racing each other.
 * @type {Object}
 */
const loadedFiles = {};

/**
 * Loads a boundary file. The files live next to the add-on and are split into
 * their own chunk, so nothing is transferred until an area is actually picked.
 * @param {String} file name of the file without extension, e.g. "bezirke".
 * @returns {Promise<Object|null>} the feature collection or null.
 */
export function loadBoundaryFile (file) {
    if (typeof file !== "string" || file === "") {
        return Promise.resolve(null);
    }
    if (!Object.prototype.hasOwnProperty.call(loadedFiles, file)) {
        loadedFiles[file] = import(
            /* webpackChunkName: "wfs-analyzer-boundaries" */
            `../geodata/${file}.json`
        )
            .then((module) => module.default || module)
            .catch((error) => {
                console.warn(`wfsAnalyzer: the boundary file "${file}" could not be loaded.`, error);
                return null;
            });
    }

    return loadedFiles[file];
}

/**
 * Picks the feature whose property holds the given value.
 * @param {Object} featureCollection a GeoJSON feature collection.
 * @param {String} matchProperty name of the property carrying the value.
 * @param {String} value the value to look for.
 * @returns {Object|null} the GeoJSON feature or null.
 */
export function findFeatureByProperty (featureCollection, matchProperty, value) {
    const features = featureCollection?.features;

    if (!Array.isArray(features) || !matchProperty || value === "" || value === null || value === undefined) {
        return null;
    }

    return features.find((feature) => String(feature?.properties?.[matchProperty]) === String(value)) || null;
}

/**
 * Turns a GeoJSON feature into an OpenLayers feature in the map's projection.
 * @param {Object} geojsonFeature the GeoJSON feature.
 * @param {String} mapProjection projection code of the map, e.g. "EPSG:25833".
 * @returns {module:ol/Feature|null} the feature or null.
 */
export function toMapFeature (geojsonFeature, mapProjection) {
    if (!geojsonFeature || !mapProjection) {
        return null;
    }

    return new GeoJSON().readFeature(geojsonFeature, {
        dataProjection: boundaryProjection,
        featureProjection: mapProjection
    });
}

/**
 * Looks up the outline for a value across all configured boundary files, first
 * match wins.
 * @param {Object[]} boundaries the configured boundaries as {file, matchProperty}.
 * @param {String} value the value of the current area selection.
 * @param {String} mapProjection projection code of the map.
 * @returns {Promise<module:ol/Feature|null>} the outline or null.
 */
export async function findBoundaryFeature (boundaries, value, mapProjection) {
    if (!Array.isArray(boundaries) || value === "" || value === null || value === undefined) {
        return null;
    }

    for (const boundary of boundaries) {
        // Sequential on purpose: the first file that knows the value wins, and
        // in practice there is only one.
        const featureCollection = await loadBoundaryFile(boundary.file),
            match = findFeatureByProperty(featureCollection, boundary.matchProperty, value);

        if (match) {
            return toMapFeature(match, mapProjection);
        }
    }

    return null;
}
