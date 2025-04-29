import {Draw} from "ol/interaction.js";
import directionsAvoidPointStyle from "./directionsAvoidPointStyle";
import directionsAvoidPointSource from "./directionsAvoidPointSource";

export default new Draw({
    source: directionsAvoidPointSource,
    type: "Point",
    style: directionsAvoidPointStyle
});
