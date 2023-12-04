import stateLogin from "./stateLogin";
import {generateSimpleGetters} from "../../../shared/js/utils/generators";

const gettersMap = {
    ...generateSimpleGetters(stateLogin)
};

export default gettersMap;
