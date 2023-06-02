import proj4 from "proj4";
import {convertSexagesimalToDecimal, convertSexagesimalFromDecimal} from "../../../../utils/convertSexagesimalCoordinates";

const actions = {
    /**
     * Pushes the formatted coordinates in the selectedCoordinates String[].
     * @param {Object} context actions context object.
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
     * Reacts on new selected projection. Sets the current projection and its name to state,
     * changes position if mode is 'supply' and sets transformed coordinates to input fields.
     * @param {String} value id of the new selected projection
     * @returns {void}
    */
    newProjectionSelected ({dispatch, commit, state, getters}, value) {
        const targetProjection = getters.getProjectionById(value);

        dispatch("formatInput", [state.coordinatesEasting, state.coordinatesNorthing]);
        dispatch("transformFromCartesian", targetProjection);
        commit("setCurrentProjection", targetProjection);
    },
    updateEntityPosition () {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(this.currentModelId);

        if (!entity) {
            return;
        }

        entity.position = this.transformToCartesian([this.coordinatesEasting, this.coordinatesNorthing, this.height]);
    },
    updatePositionUI () {
        const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
            entity = entities.getById(this.currentModelId),
            entityPosition = entity?.position.getValue();

        [this.coordinatesEasting, this.coordinatesNorthing, this.height] = this.transformFromCartesian(entityPosition);
    },
    /**
     * Transforms the selected coordinates from the current projection to the target projection and sets them to state.
     * @param {Object} context actions context object.
     * @param {*} coordinates the entities coordinates in degrees
     * @returns {void}
     */
    transformFromCartesian ({state, commit}, coordinates) {
        let transformedCoordinates;

        if (state.selectedCoordinates.length === 2) {
            if (state.currentProjection.projName === "longlat") {
                coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);
            }
            else {
                coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];
            }
            if (state.currentProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3") {
                if (coordinates[0].toString().length === 7) {
                    coordinates[0] = coordinates[0] - 3000000;
                }
            }
            transformedCoordinates = proj4(state.currentProjection, targetProjection, coordinates);
            if (targetProjection.projName === "longlat" && targetProjection.id !== "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                transformedCoordinates = [convertSexagesimalFromDecimal(transformedCoordinates[1]), convertSexagesimalFromDecimal(transformedCoordinates[0])];
            }
            else if (targetProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG") {
                transformedCoordinates = [transformedCoordinates[1].toFixed(4) + "°", transformedCoordinates[0].toFixed(4) + "°"];
            }
            else if (targetProjection.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3") {
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
        }
    },
    /**
     * Transforms the selected and validated coordinates to their given coordinate system and calls the moveToCoordinates function.
     * @param {Object} context actions context object.
     * @param {*} coordinates the entities coordinates in degrees
     * @returns {void}
     */
    transformToCartesian ({dispatch, state}, coordinates) {
        dispatch("formatInput", coordinates);

        if (state.selectedCoordinates.length === 2) {
            if (state.currentProjection.id.indexOf("4326") > -1) {
                const coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);

                state.transformedCoordinates = proj4(proj4("EPSG:4326"), proj4(mapProjection), coordinates);
            }
            else if (state.currentProjection.id.indexOf("31467") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:31467"), proj4(mapProjection), coordinates);
            }
            else if (state.currentProjection.id.indexOf("8395") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:8395"), proj4(mapProjection), coordinates);
            }
            else if (state.currentProjection.id.indexOf("ETRS893GK3") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]) - 3000000, Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:8395"), proj4(mapProjection), coordinates);
            }
            else if (state.currentProjection.id.indexOf("4647") > -1) {
                const coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];

                state.transformedCoordinates = proj4(proj4("EPSG:4647"), proj4(mapProjection), coordinates);
            }
            else if (state.currentProjection.epsg !== mapProjection) {
                let coordinates;

                if (state.currentProjection.projName === "longlat") {
                    coordinates = convertSexagesimalToDecimal(state.selectedCoordinates);
                }
                else {
                    coordinates = [Math.round(state.selectedCoordinates[0]), Math.round(state.selectedCoordinates[1])];
                }

                state.transformedCoordinates = proj4(proj4(state.currentProjection.id), proj4(mapProjection), coordinates);
            }
        }
    }
};

export default actions;
