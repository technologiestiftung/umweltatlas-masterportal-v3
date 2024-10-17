import tsrElevationSource from "./tsrElevationSource";
import tsrElevationStyle from "./tsrElevationStyle";
import VectorLayer from "ol/layer/Vector.js";

export default new VectorLayer({
    source: tsrElevationSource,
    style: tsrElevationStyle,
    name: "tsr_elevation_layer",
    alwaysOnTop: true
});
