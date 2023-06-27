import proj4 from "proj4";
import store from "../../../../app-store";
import {convertSexagesimalToDecimal, convertSexagesimalFromDecimal} from "../../../../utils/convertSexagesimalCoordinates";

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
            stateArray = entity.wasDrawn ? state.drawnModels : state.importedModels,
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
     * Pushes the formatted coordinates in the selectedCoordinates String[].
     * @param {Object} context The context of the Vuex module.
     * @param {String[]} coords the coordinates the user entered
     * @returns {void}
     */
    formatInput ({state, commit}, coords) {
        const {currentProjection} = state;

        commit("setSelectedCoordinates", []);
        for (const coord of coords) {
            let formatter;

            if (currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                formatter = coordinate=>coordinate.value.split(/[\s°]+/);
            }
            else if (currentProjection.projName === "longlat") {
                formatter = coordinate=>coordinate.value.split(/[\s°′″'"´`]+/);
            }
            else {
                formatter = coordinate=>coordinate.value;
            }

            commit("pushCoordinates", formatter(coord));
        }
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

        dispatch("transformToCartesian");

        entity.position = state.currentModelPosition;
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
        let transformedCoordinates,
            coordinates = Cesium.Cartographic.fromCartesian(entityPosition);

        const height = coordinates.height.toFixed(2);

        coordinates = [Cesium.Math.toDegrees(coordinates.longitude), Cesium.Math.toDegrees(coordinates.latitude)];

        transformedCoordinates = proj4(proj4("EPSG:4326"), state.currentProjection, coordinates);

        if (state.currentProjection.projName === "longlat" && state.currentProjection.id !== "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
            transformedCoordinates = [convertSexagesimalFromDecimal(transformedCoordinates[0]), convertSexagesimalFromDecimal(transformedCoordinates[1])];
        }
        else if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
            transformedCoordinates = [transformedCoordinates[0].toFixed(6) + "°", transformedCoordinates[1].toFixed(6) + "°"];
        }
        else if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3") {
            if (transformedCoordinates[0].toFixed(2).length === 9) {
                transformedCoordinates[0] = transformedCoordinates[0] + 3000000;
            }
            transformedCoordinates = [transformedCoordinates[0].toFixed(2), transformedCoordinates[1].toFixed(2)];
        }
        else {
            transformedCoordinates = [transformedCoordinates[0].toFixed(2), transformedCoordinates[1].toFixed(2)];
        }

        commit("setCoordinatesEasting", {id: "easting", value: transformedCoordinates[0]});
        commit("setCoordinatesNorthing", {id: "northing", value: transformedCoordinates[1]});
        commit("setHeight", {id: "height", value: height});
    },
    /**
     * Transforms the current UI values to Cartesian3 coordinates and sets it to state.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    transformToCartesian ({commit, dispatch, getters, state}) {
        dispatch("formatInput", [state.coordinatesEasting, state.coordinatesNorthing]);

        if (state.selectedCoordinates.length === 2) {
            let coordinates,
                height = state.height.value;

            if (state.currentProjection.projName === "longlat") {
                coordinates = convertSexagesimalToDecimal([state.selectedCoordinates[1], state.selectedCoordinates[0]]);
            }
            else if (state.currentProjection.id.indexOf("ETRS893GK3") > -1) {
                coordinates = [state.selectedCoordinates[0] - 3000000, state.selectedCoordinates[1]];
            }
            else {
                coordinates = [state.selectedCoordinates[0], state.selectedCoordinates[1]];
            }

            const transformedCoordinates = proj4(proj4(state.currentProjection.epsg), proj4("EPSG:4326"), coordinates);

            if (state.adaptToHeight) {
                const scene = getters.scene,
                    cartographic = new Cesium.Cartographic(
                        Cesium.Math.toRadians(transformedCoordinates[0]),
                        Cesium.Math.toRadians(transformedCoordinates[1])
                    );

                height = scene.globe.getHeight(cartographic);

                commit("setHeight", {id: "height", value: height.toFixed(2)});
            }

            commit("setCurrentModelPosition", Cesium.Cartesian3.fromDegrees(transformedCoordinates[0], transformedCoordinates[1], height));
        }
    }
};

export default actions;
