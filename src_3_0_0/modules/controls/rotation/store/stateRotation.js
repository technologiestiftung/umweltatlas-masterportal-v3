/**
 * The state for the control rotation.
 * @module modules/controls/rotation/store/stateRotation
 * @typedef {Object} RotationState
 * @property {Boolean} [compass2d=false] Controls the display of the compass rose in 2D.
 * @property {Boolean} [compass3d=true] Controls the display of the compass rose in 3D.
 * @property {String} [resetRotationIcon="bi-cursor"] Icon of the reset rotation button.
 * @property {Boolean} [showResetRotation=true] Controls the display of the "Reset rotation" button.
 * @property {Boolean} [showResetRotationAlways=false] Defines whether the control is shown permanently.
 * @property {Number} [rotation=0] The current rotation value in rad.
 * @property {Boolean} [rotationIcons=null] Defines whether the icons to rotate shall be displayed.
 * @property {Number} [rotationAngle=45] Defines the angle for one click on roatation button.
 * @property {String[]} [supportedDevices=["Desktop", "Mobile"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 */
const state = {
    compass2d: false,
    compass3d: true,
    resetRotationIcon: "bi-cursor",
    rotateClockwiseIcon: "bi-arrow-clockwise",
    rotateCounterClockwiseIcon: "bi-arrow-counterclockwise",
    showResetRotation: true,
    showResetRotationAlways: false,
    rotation: 0,
    rotationIcons: true,
    rotationAngle: 22.5,
    moveDistance: 1000,
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
