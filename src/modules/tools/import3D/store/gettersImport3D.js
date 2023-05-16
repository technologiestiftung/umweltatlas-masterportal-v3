
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import import3DState from "./stateImport3D";

const getters = {
    ...generateSimpleGetters(import3DState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
