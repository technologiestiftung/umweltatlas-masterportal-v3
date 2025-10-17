import {Select} from "ol/interaction.js";
import directionsAvoidLayer from "./directionsAvoidLayer.js";
import {click} from "ol/events/condition";

export default new Select({
    condition: click,
    layers: [directionsAvoidLayer]
});
