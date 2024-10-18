import directionsElevationSource from "./directionsElevationSource";
import directionsElevationStyle from "./directionsElevationStyle";
import VectorLayer from "ol/layer/Vector.js";

export default new VectorLayer({
    source: directionsElevationSource,
    style: directionsElevationStyle,
    name: "directions_elevation_layer",
    alwaysOnTop: true
});
