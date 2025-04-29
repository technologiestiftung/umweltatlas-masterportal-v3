import {Select} from "ol/interaction.js";
import directionsAvoidPointLayer from "./directionsAvoidPointLayer";
import {click} from "ol/events/condition";

export default new Select({
    condition: click,
    layers: [directionsAvoidPointLayer]
});
