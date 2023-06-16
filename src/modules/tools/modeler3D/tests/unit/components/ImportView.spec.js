import Vuex from "vuex";
import {expect} from "chai";
import {mount, config, createLocalVue} from "@vue/test-utils";
import ImportViewComponent from "../../../components/ImportView.vue";
import Modeler3DModule from "../../../store/indexModeler3D";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/ImportView.vue", () => {
    let store, wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Modeler3D: Modeler3DModule
                    }
                }
            }
        });
        store.commit("Tools/Modeler3D/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should find Tool component", () => {
        wrapper = mount(ImportViewComponent, {store, localVue});
        const toolImportViewWrapper = wrapper.findComponent({name: "BasicFileImport"});

        expect(toolImportViewWrapper.exists()).to.be.true;
    });
    it("component shows buttons for importedModel", async () => {
        wrapper = mount(ImportViewComponent, {store, localVue});
        store.commit("Tools/Modeler3D/setImportedModels", [
            {
                id: "id",
                name: "name",
                show: false
            }
        ]);
        await wrapper.vm.$nextTick();

        const importedModelList = wrapper.find("#succesfully-imported-models"),
            zoomToButton = wrapper.find("#tool-import-view-zoomTo"),
            editButton = wrapper.find("#tool-import-view-edit"),
            hideButton = wrapper.find("#tool-import-view-hide"),
            deleteButton = wrapper.find("#tool-import-view-delete");

        expect(importedModelList.exists()).to.be.true;
        expect(zoomToButton.exists()).to.be.true;
        expect(editButton.exists()).to.be.true;
        expect(hideButton.exists()).to.be.true;
        expect(deleteButton.exists()).to.be.true;
    });
});
