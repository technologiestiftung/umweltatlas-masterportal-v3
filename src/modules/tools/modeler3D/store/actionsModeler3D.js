import proj4 from "proj4";
import store from "../../../../app-store";
import {adaptCylinderToGround, adaptCylinderToEntity} from "../components/utils/draw";

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
            commit("setCurrentModelId", null);

            setTimeout(() => {
                stateArray.splice(modelIndex, 1);
                entities.removeById(id);
            }, 10);
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

        dispatch("transformToCartesian");
        if (entity.polygon) {
            const cylinders = entities.values.filter(ent => ent.cylinder);

            dispatch("movePolygon", {entity: entity, position: state.currentModelPosition});

            cylinders.forEach(cyl => {
                cyl.position = entity.clampToGround ?
                    adaptCylinderToGround(cyl, state.cylinderPosition[cyl.positionIndex]) :
                    adaptCylinderToEntity(entity, cyl, state.cylinderPosition[cyl.positionIndex]);
            });
        }
        else {
            entity.position = state.currentModelPosition;
        }
    },
    /**
     * Reacts on changed entity position. Gets the currently selected entity position and transforms its coordinates
     * to the currently selected projection.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    updatePositionUI ({commit, dispatch, getters, state}) {
        const entities = getters.entities,
            entity = entities.getById(state.currentModelId),
            entityPosition = entity?.position?.getValue() || getters.getCenterFromPolygon(entity);

        if (entityPosition) {
            dispatch("transformFromCartesian", entityPosition);
            commit("setHeight", entity.polygon.height.getValue());
        }
    },
    updateUI ({commit, dispatch, getters, state}) {
        const entities = getters.entities,
            entity = entities.getById(state.currentModelId);

        commit("setAdaptToHeight", entity.clampToGround);

        if (entity?.polygon instanceof Cesium.PolygonGraphics) {
            commit("setExtrudedHeight", entity.polygon.extrudedHeight.getValue() - entity.polygon.height.getValue());
        }
        else if (entity?.model instanceof Cesium.ModelGraphics) {
            const modelFromState = state.importedModels.find(ent => ent.id === entity.id);

            commit("setRotation", modelFromState.heading);
            commit("setScale", entity.model.scale ? entity.model.scale.getValue() : 1);
        }
        dispatch("updatePositionUI");
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
    /**
     * Generates Cesium cylinders at all polygon positions.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    generateCylinders ({commit, dispatch, getters, state}) {
        const entities = getters.entities,
            entity = entities.getById(state.currentModelId);

        if (entity?.wasDrawn && entity?.polygon?.hierarchy) {
            const hierarchy = entity.polygon.hierarchy.getValue(),
                length = entity.polygon.extrudedHeight - entity.polygon.height + 5;

            commit("setActiveShapePoints", hierarchy.positions);

            hierarchy.positions.forEach((position, index) => {
                dispatch("createCylinder", {
                    posIndex: index,
                    length: length
                });
                const cylinder = entities.values.find(cyl => cyl.id === state.cylinderId);

                cylinder.position = entity.clampToGround ?
                    adaptCylinderToGround(cylinder, position) :
                    adaptCylinderToEntity(entity, cylinder, position);
            });
        }
        else if (entity?.wasDrawn && entity?.polyline?.positions) {
            const positions = entity.polyline.positions.getValue();

            commit("setActiveShapePoints", positions);

            positions.forEach((position, index) => {
                dispatch("createCylinder", {
                    posIndex: index,
                    length: 4
                });
                const cylinder = entities.values.find(cyl => cyl.id === state.cylinderId);

                cylinder.position = entity.clampToGround ?
                    adaptCylinderToGround(cylinder, position) :
                    adaptCylinderToEntity(entity, cylinder, position);
            });
        }
    },
    /**
     * Create a singular Cesium cylinder at the given position.
     * @param {object} context - The context of the Vuex module.
     * @param {object} positionObj - The position options to create the cylinder with
     * @returns {void}
    */
    createCylinder ({commit, getters, state}, {position = new Cesium.Cartesian3(), posIndex, length}) {
        const cylinder = getters.entities.add({
            position: position,
            positionIndex: posIndex,
            cylinder: {
                material: new Cesium.ColorMaterialProperty(Cesium.Color.RED),
                bottomRadius: 0.1,
                topRadius: 1,
                length: length ? length : state.extrudedHeight + 5
            }
        });

        commit("setCylinderId", cylinder.id);
    },
    /**
     * Removes all Cesium cylinders from the the Cesium EntityCollection.
     * @param {object} context - The context of the Vuex module.
     * @returns {void}
    */
    removeCylinders ({getters}) {
        const entities = getters.entities,
            pointEntities = entities.values.filter(entity => entity.cylinder);

        pointEntities.forEach(entity => {
            entities.remove(entity);
        });
    },
    /**
     * Moves a given polygon to a given new position.
     * @param {object} context - The context of the Vuex module.
     * @param {object} moveOptions - Contains the polygon and new position it shall be moved to.
     * @returns {void}
    */
    movePolygon ({dispatch, getters, state}, {entity, position}) {
        if (entity && entity.wasDrawn && entity.polygon && entity.polygon.hierarchy) {
            const positions = entity.polygon.hierarchy.getValue().positions,
                center = getters.getCenterFromPolygon(entity),
                positionDelta = Cesium.Cartesian3.subtract(position, center, new Cesium.Cartesian3());

            if (entity.clampToGround) {
                state.height = getters.scene.globe.getHeight(Cesium.Cartographic.fromCartesian(center));
            }
            entity.polygon.height = state.height;
            entity.polygon.extrudedHeight = state.extrudedHeight + state.height;

            positions.forEach((pos, index) => {
                Cesium.Cartesian3.add(pos, positionDelta, pos);
                state.cylinderPosition[index] = pos;
            });

            dispatch("transformFromCartesian", getters.getCenterFromPolygon(entity));
        }
    },
    /**
     * Moves a given polyline to a given new position.
     * @param {object} context - The context of the Vuex module.
     * @param {object} moveOptions - Contains the polyline and new position it shall be moved to.
     * @returns {void}
    */
    movePolyline ({state}, {entity, position}) {
        if (entity && entity.wasDrawn && entity.polyline && entity.polyline.positions) {
            const positions = entity.polyline.positions.getValue(),
                boundingSphereCenter = Cesium.BoundingSphere.fromPoints(positions).center,
                positionDelta = Cesium.Cartesian3.subtract(position, boundingSphereCenter, new Cesium.Cartesian3());

            positions.forEach((pos, index) => {
                Cesium.Cartesian3.add(pos, positionDelta, pos);
                state.cylinderPosition[index] = pos;
            });
        }
    }
};

export default actions;
