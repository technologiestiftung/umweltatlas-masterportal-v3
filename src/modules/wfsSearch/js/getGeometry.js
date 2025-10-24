/**
* Returns the geometry from row or feature. Automatically detects common geometry field names.
* @param {Array} results An array of features to be inspected.
* @param {Object} row fields are used to identify feature or geometry is contained and returned.
* @returns {Object} The geometry
*/
export default function getGeometry (results, row) {
    const geometryFromRow = findGeometry(row);

    if (geometryFromRow) {
        return geometryFromRow;
    }

    let amount = Object.keys(row).length === 1 ? 1 : Object.keys(row).length - 1,
        consistency = false;

    for (let index = 0; index < results.length; index++) {
        const result = results[index];

        for (const key in row) {
            const value = row[key];

            if (result.get(key) === value) {
                amount--;
                consistency = true;
            }
            if (amount === 0 && consistency) {
                return findGeometry(result);
            }
        }
    }
    return null;
}

/**
 * Finds geometry in an object or OpenLayers feature by checking common geometry field names.
 * @param {Object|module:ol/Feature} obj The object or feature to search for geometry.
 * @returns {Object|null} The geometry object or null if not found.
 */
function findGeometry (obj) {
    const geometryFieldNames = [
        "geometry", "geom", "position", "shape",
        "the_geom", "wkb_geometry", "geometrie",
        "msGeometry", "gml_geometry", "location"
    ];

    for (const fieldName of geometryFieldNames) {
        let geom;

        if (typeof obj.get === "function") {
            geom = obj.get(fieldName);
        }
        else {
            geom = obj[fieldName];
        }

        if (geom) {
            return geom;
        }
    }

    // Fallback: use the default geometry function from OpenLayers feature if available
    if (typeof obj.getGeometry === "function") {
        return obj.getGeometry();
    }

    return null;
}
