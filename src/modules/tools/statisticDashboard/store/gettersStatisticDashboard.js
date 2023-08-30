import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateStatisticDashboard";

const getters = {
    ...generateSimpleGetters(initialState)
};

export default getters;
