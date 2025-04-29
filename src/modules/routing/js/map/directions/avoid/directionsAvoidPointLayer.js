import directionsAvoidPointSource from "./directionsAvoidPointSource";
import directionsAvoidPointStyle from "./directionsAvoidPointStyle";
import VectorLayer from "ol/layer/Vector.js";

export default new VectorLayer({
    id: "directions_avoid_point_layer",
    source: directionsAvoidPointSource,
    style: directionsAvoidPointStyle,
    name: "directions_avoid_point_layer",
    alwaysOnTop: true
});
