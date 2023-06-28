import {expect} from "chai";
import sinon from "sinon";
import {mount, config, createLocalVue} from "@vue/test-utils";
import Modeler3DListComponent from "../../../components/Modeler3DList.vue";

const localVue = createLocalVue();

config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/Modeler3DList.vue", () => {
    let wrapper;

    afterEach(() => {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("shows buttons for importedModel", async () => {
        wrapper = mount(Modeler3DListComponent, {localVue});
        wrapper.vm.objects = [
            {
                id: "id",
                name: "name",
                show: false
            }
        ];
        wrapper.vm.entity = true;
        await wrapper.vm.$nextTick();

        const zoomToButton = wrapper.find("#list-zoomTo"),
            editButton = wrapper.find("#list-edit"),
            hideButton = wrapper.find("#list-hide"),
            deleteButton = wrapper.find("#list-delete");

        expect(zoomToButton.exists()).to.be.true;
        expect(editButton.exists()).to.be.true;
        expect(hideButton.exists()).to.be.true;
        expect(deleteButton.exists()).to.be.true;
    });

    it("shows buttons for hiddenObjects", async () => {
        wrapper = mount(Modeler3DListComponent, {localVue});
        wrapper.vm.objects = [
            {
                id: "id",
                name: "name",
                show: false
            }
        ];
        wrapper.vm.entity = false;
        await wrapper.vm.$nextTick();

        const hideButton = wrapper.find("#list-hide");

        expect(hideButton.exists()).to.be.true;
    });
});
