import proj4 from "proj4";
import store from "../../../../app-store";

const actions = {
    /**
     * Action to delete an entity.
     *
     * @param {Object} context - The context of the Vuex module.
     * @param {string} id - The ID of the entity to delete.
     * @returns {void}
     */
    deleteEntity ({commit, getters, state}, id) {
        const entities = getters.entities,
            entity = entities.getById(id),
            stateArray = entity?.wasDrawn ? state.drawnModels : state.importedModels,
            modelIndex = stateArray.findIndex(x => x.id === id);

        if (modelIndex > -1 && entity) {
            stateArray.splice(modelIndex, 1);
            entities.removeById(id);
            commit("setCurrentModelId", null);
        }
    },
    /**
     * Confirms the deletion of an entity by adding a confirmation action.
     * @param {object} context - The context of the Vuex module.
     * @param {string} id - The ID of the entity to be deleted.
     * @returns {void}
     */
    confirmDeletion ({dispatch, getters}, id) {
        const modelName = getters.getModelNameById(id);

        store.dispatch("ConfirmAction/addSingleAction", {
            actionConfirmedCallback: () => dispatch("deleteEntity", id),
            confirmCaption: i18next.t("common:modules.tools.modeler3D.entity.deleteInteraction.confirm"),
            textContent: i18next.t("common:modules.tools.modeler3D.entity.deleteInteraction.text", {name: modelName}),
            headline: i18next.t("common:modules.tools.modeler3D.entity.deleteInteraction.headline")
        });
    },
    /**
     * Toggles the visibility of a model entity.
     * @param {Object} context The context of the Vuex module.
     * @param {object} model - The model object.
     * @returns {void}
     */
    changeVisibility ({getters}, model) {
        const entities = getters.entities,
            entity = entities.getById(model.id);

        entity.show = !model.show;
        model.show = entity.show;
    },
    /**
     * Reacts on new selected projection. Sets the current projection and its name to state and updates the UI.
     * @param {object} context - The context of the Vuex module.
     * @param {String} value id of the new selected projection
     * @returns {void}
    */
    newProjectionSelected ({dispatch, commit, getters}, value) {
        const targetProjection = getters.getProjectionById(value);

        commit("setCurrentProjection", targetProjection);
        dispatch("updatePositionUI");
    },
    /**
     * Reacts on new input value. Gets the currently selected entity and updates its position.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    updateEntityPosition ({dispatch, getters, state}) {
        const entities = getters.entities,
            entity = entities.getById(state.currentModelId);

        if (!entity) {
            return;
        }

        if (!entity.wasDrawn) {
            dispatch("transformToCartesian");
            entity.position = state.currentModelPosition;
        }
    },
    /**
     * Reacts on changed entity position. Gets the currently selected entity position and transforms its coordinates
     * to the currently selected projection.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    updatePositionUI ({dispatch, getters, state}) {
        const entities = getters.entities,
            entity = entities.getById(state.currentModelId),
            entityPosition = entity?.position?.getValue();

        if (entityPosition) {
            dispatch("transformFromCartesian", entityPosition);
        }
    },
    /**
     * Transforms the Cartesian3 coordinates to the currently selected projection and sets it to state.
     * @param {object} context - The context of the Vuex module.
     * @param {Cartesian3} entityPosition position of currently selected entity
     * @returns {void}
    */
    transformFromCartesian ({state, commit}, entityPosition) {
        let coordinates = Cesium.Cartographic.fromCartesian(entityPosition);

        const height = coordinates.height;

        coordinates = [Cesium.Math.toDegrees(coordinates.longitude), Cesium.Math.toDegrees(coordinates.latitude)];

        if (state.currentProjection.epsg !== "EPSG:4326") {
            coordinates = proj4(proj4("EPSG:4326"), state.currentProjection, coordinates);
        }

        if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3" && coordinates.toFixed(2).length === 9) {
            coordinates[0] += 3000000;
        }

        commit("setCoordinateEasting", coordinates[0]);
        commit("setCoordinateNorthing", coordinates[1]);
        commit("setHeight", height);
    },
    /**
     * Transforms the current UI values to Cartesian3 coordinates and sets it to state.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    transformToCartesian ({commit, getters, state}) {
        let coordinates = [state.coordinateEasting, state.coordinateNorthing],
            height = state.height;

        if (state.currentProjection.epsg !== "EPSG:4326") {
            if (state.currentProjection.id.indexOf("ETRS893GK3") > -1) {
                coordinates[0] -= 3000000;
            }
            coordinates = proj4(proj4(state.currentProjection.epsg), proj4("EPSG:4326"), coordinates);
        }

        if (state.adaptToHeight) {
            const scene = getters.scene,
                cartographic = Cesium.Cartographic.fromDegrees(coordinates[0], coordinates[1]);

            height = scene.globe.getHeight(cartographic);

            commit("setHeight", height);
        }

        commit("setCurrentModelPosition", Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], height));
    },
    generateCylinders ({commit, dispatch, getters, state}) {
        const entities = getters.entities,
            entity = entities.getById(state.currentModelId);

        if (entity?.wasDrawn && entity?.polygon?.hierarchy) {
            const hierarchy = entity.polygon.hierarchy.getValue();

            commit("setActiveShapePoints", hierarchy.positions);

            hierarchy.positions.forEach((position, index) => {
                dispatch("createCylinder", {
                    position: position,
                    posIndex: index,
                    length: entity.polygon.extrudedHeight,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                });
            });
        }
    },
    createCylinder ({commit, getters}, positionObj) {
        const cylinder = getters.entities.add({
            position: positionObj.position,
            positionIndex: positionObj.posIndex,
            cylinder: {
                material: new Cesium.ColorMaterialProperty(Cesium.Color.RED),
                bottomRadius: 0.0,
                topRadius: 1,
                length: positionObj.length ? positionObj.length : 20,
                heightReference: positionObj.heightReference ? positionObj.heightReference : Cesium.HeightReference.NONE
            }
        });

        commit("setCylinderId", cylinder.id);
    },
    removeCylinders ({getters}) {
        const entities = getters.entities,
            pointEntities = entities.values.filter(entity => entity.cylinder);

        pointEntities.forEach(entity => {
            entities.remove(entity);
        });
    }
};

export default actions;
