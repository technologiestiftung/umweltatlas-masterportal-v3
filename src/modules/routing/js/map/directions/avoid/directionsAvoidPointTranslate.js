import {Translate} from "ol/interaction.js";
import directionsAvoidPointLayer from "./directionsAvoidPointLayer";

export default new Translate({layers: [directionsAvoidPointLayer]});
