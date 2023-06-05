
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import import3DState from "./stateImport3D";

const getters = {
    ...generateSimpleGetters(import3DState),

    // NOTE overwrite getters here if you need a special behaviour in a getter
    getModelName: state => () => {
        const model = state.importedModels.find(x => x.id === state.currentModelId);

        return model.name;
    }
};

export default getters;
