import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import copyrightState from "./stateCopyright";

const getters = {
    ...generateSimpleGetters(copyrightState)
};

export default getters;
