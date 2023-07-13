<script>
import BasicFileImport from "../../../../share-components/fileImport/components/BasicFileImport.vue";
import EntityList from "./ui/EntityList.vue";
import RoutingLoadingSpinner from "../../routing/components/RoutingLoadingSpinner.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import store from "../../../../app-store";

export default {
    name: "Modeler3DImport",
    components: {
        BasicFileImport,
        EntityList,
        RoutingLoadingSpinner
    },
    emits: ["moveEntity"],
    data () {
        return {
            isHovering: false
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),
        /**
         * Adds and processes the selected file.
         * @param {FileList} files - The selected files.
         * @returns {void}
         */
        addFile (files) {
            this.setIsLoading(true);

            const reader = new FileReader(),
                file = files[0],
                fileName = file.name.split(".")[0],
                fileExtension = file.name.split(".").pop(),
                fileSizeMB = file.size / (1024 * 1024),
                maxFileSizeMB = 100;

            if (fileSizeMB > maxFileSizeMB) {
                store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.modeler3D.import.alertingMessages.fileSizeError"), {root: true});
                return;
            }

            reader.onload = () => {
                if (fileExtension === "gltf") {
                    this.handleGltfFile(file, fileName);
                }
                else if (fileExtension === "obj") {
                    this.handleObjFile(file, fileName);
                }
                else if (fileExtension === "dae") {
                    this.handleDaeFile(file, fileName);
                }
                else if (fileExtension === "geojson") {
                    this.handleGeoJsonFile(file);
                }
                else {
                    store.dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.tools.modeler3D.import.alertingMessages.missingFormat", {format: fileExtension})}, {root: true});
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading the file:", e.target.error);
            };

            if (fileExtension === "gltf") {
                reader.readAsArrayBuffer(file);
            }
            else {
                reader.readAsText(file);
            }
        },
        /**
         * Handles the processing of a GLTF file.
         * @param {File} file - The GLTF file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
        handleGltfFile (file, fileName) {
            const entities = this.entities,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                models = this.importedModels,
                entity = {
                    id: lastId ? lastId + 1 : 1,
                    name: fileName,
                    model: {
                        uri: URL.createObjectURL(file)
                    }
                };

            this.setCurrentModelId(entity.id);
            this.$emit("emit-move");

            entities.add(entity);

            models.push({
                id: entity.id,
                name: fileName,
                show: true,
                edit: false,
                heading: 0
            });
            this.setImportedModels(models);
            this.setIsLoading(false);
        },
        /**
         * Handles the processing of an OBJ file.
         * @param {File} file - The OBJ file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
        handleObjFile (file, fileName) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const objText = event.target.result,
                    objLoader = new OBJLoader(),
                    objData = objLoader.parse(objText),
                    gltfExporter = new GLTFExporter();

                gltfExporter.parse(objData, (gltfData) => {
                    const gltfJson = JSON.stringify(gltfData),
                        blob = new Blob([gltfJson], {type: "model/gltf+json"});

                    this.handleGltfFile(blob, fileName);
                });
            };
            reader.readAsText(file);
        },
        /**
         * Handles the processing of a DAE file.
         * @param {File} file - The DAE file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
        handleDaeFile (file, fileName) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const daeText = event.target.result,
                    colladaLoader = new ColladaLoader();

                colladaLoader.load(daeText, (collada) => {
                    const exporter = new GLTFExporter();

                    exporter.parse(collada.scene, (gltfData) => {
                        const gltfLoader = new GLTFLoader();

                        gltfLoader.parse(gltfData, "", () => {
                            const gltfJson = JSON.stringify(gltfData),
                                blob = new Blob([gltfJson], {type: "model/gltf+json"});

                            this.handleGltfFile(blob, fileName);
                        });
                    });
                });
            };
            reader.readAsDataURL(file);
        },
        /**
         * Handles the processing of a GEOJSON file.
         * @param {File} file - The GEOJSON file.
         * @param {string} fileName - The name of the file.
         * @returns {void}
         */
        handleGeoJsonFile (file) {
            const reader = new FileReader();
            let geojson;

            reader.onload = (event) => {
                const text = event.target.result,
                    entities = this.entities;

                geojson = JSON.parse(text);

                geojson.features.forEach(feature => {
                    const properties = feature.properties,
                        color = properties.color,
                        outlineColor = properties.outlineColor,
                        coordinates = feature.geometry.coordinates[0],
                        lastElement = entities.values.slice().pop(),
                        lastId = lastElement?.id,
                        entity = new Cesium.Entity({
                            id: lastId ? lastId + 1 : 1,
                            name: properties.name,
                            wasDrawn: true,
                            polygon: {
                                material: new Cesium.ColorMaterialProperty(
                                    new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                                ),
                                outline: true,
                                outlineColor: new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha),
                                outlineWidth: 1,
                                height: properties.height,
                                extrudedHeight: properties.extrudedHeight,
                                extrudedHeightReference: properties.extrudedHeightReference,
                                shadows: Cesium.ShadowMode.ENABLED,
                                hierarchy: new Cesium.PolygonHierarchy(coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1])))
                            }
                        });

                    entities.add(entity);
                    this.drawnModels.push({
                        id: entity.id,
                        name: entity.name,
                        show: true,
                        edit: false
                    });
                });
            };

            reader.readAsText(file);
            this.setCurrentView("draw");
            this.setIsLoading(false);
        },
        /**
         * Toggles the visibility of a model entity.
         * @param {object} model - The model object.
         * @returns {void}
         */
        changeVisibility (model) {
            const entities = this.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const scene = this.scene,
                entities = this.entities,
                entity = entities.getById(id),
                entityPosition = entity.position.getValue(),
                destination = Cesium.Cartographic.fromCartesian(entityPosition);

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height + 500)
            });
        }
    }
};
</script>

<template lang="html">
    <RoutingLoadingSpinner
        v-if="isLoading"
    />
    <div
        v-else
        id="modeler3D-import-view"
    >
        <BasicFileImport
            :intro-formats="$t('modules.tools.modeler3D.import.captions.introFormats')"
            @add-file="addFile"
        />

        <EntityList
            v-if="importedModels.length > 0"
            id="successfully-imported-models"
            :objects="importedModels"
            :objects-label="$t('modules.tools.modeler3D.import.captions.successfullyImportedLabel')"
            :entity="true"
            @change-visibility="changeVisibility"
            @zoom-to="zoomTo"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .spinner {
        width: 50px;
        height: 50px;
        margin-top: -25px;
        margin-left: -25px;
        left: 50%;
        top: 50%;
        position: absolute;
        background: rgba(0, 0, 0, 0);
    }

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }
</style>
