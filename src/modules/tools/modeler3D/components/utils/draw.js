/**
 * Returns a position, at which a cylinder is above ground.
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function normalizeCylinderPosition (cylinder, position = cylinder.position.getValue()) {
    return normalizeCylinderLengthPosition(cylinder.cylinder.length.getValue(), position);
}

/**
 * Returns a position, at which a cylinder with the given length is above ground.
 * @param {Cesium.Entity} length - the length of the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function normalizeCylinderLengthPosition (length, position) {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        cartographic = Cesium.Cartographic.fromCartesian(position);

    cartographic.height = scene.globe.getHeight(cartographic) + length / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}
