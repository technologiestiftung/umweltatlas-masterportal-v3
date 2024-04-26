import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import state from "./stateCopyright";

const mutations = {
    ...generateSimpleMutations(state)
};

export default mutations;
