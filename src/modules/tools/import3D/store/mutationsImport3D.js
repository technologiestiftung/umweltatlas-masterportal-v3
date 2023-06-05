import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import import3DState from "./stateImport3D";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(import3DState),

    setModelName: (state, name) => {
        const model = state.importedModels.find(x => x.id === state.currentModelId);

        model.name = name;
    }
};

export default mutations;
