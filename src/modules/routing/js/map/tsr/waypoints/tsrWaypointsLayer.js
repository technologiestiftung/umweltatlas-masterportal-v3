import tsrWaypointsSource from "./tsrWaypointsSource";
import tsrWaypointsStyle from "./tsrWaypointsStyle";
import VectorLayer from "ol/layer/Vector.js";

export default new VectorLayer({
    source: tsrWaypointsSource,
    style: tsrWaypointsStyle,
    name: "tsr_waypoints_layer",
    alwaysOnTop: true
});
