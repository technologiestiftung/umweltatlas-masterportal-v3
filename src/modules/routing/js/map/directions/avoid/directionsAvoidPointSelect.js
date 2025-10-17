import {Select} from "ol/interaction.js";
import directionsAvoidPointLayer from "./directionsAvoidPointLayer.js";
import {click} from "ol/events/condition";

export default new Select({
    condition: click,
    layers: [directionsAvoidPointLayer]
});
