/**
 * The state for the control rotation.
 * @module modules/controls/rotation/store/stateRotation
 * @typedef {Object} RotationState
 * @property {String} [resetRotationIcon="bi-cursor"] Icon of the reset rotation button.
 * @property {Boolean} [showAlways=false] Defines whether the control is shown permanently.
 * @property {Number} [rotation=0] the current rotation value in rad.
 * @property {Boolean} [rotationIcons=null] Defines whether the icons to rotate shall be displayed.
 * @property {Number} [rotationAngle=45] Defines the angle for one click on roatation button.
 * @property {String[]} [supportedDevices=["Desktop", "Mobile"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 */
const state = {
    resetRotationIcon: "bi-cursor",
    rotateClockwiseIcon: "bi-arrow-clockwise",
    rotateCounterClockwiseIcon: "bi-arrow-counterclockwise",
    showAlways: false,
    rotation: 0,
    rotationIcons: true,
    rotationAngle: 22.5,
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
