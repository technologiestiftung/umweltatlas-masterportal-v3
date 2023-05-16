const actions = {
    addFile ({commit, state, rootGetters}, files) {
        // Annahme: Beim Event handelt es sich um den Dateiimport aus dem Component
        const reader = new FileReader(),
            altitude = rootGetters["Maps/altitude"],
            longitude = rootGetters["Maps/longitude"],
            latitude = rootGetters["Maps/latitude"],
            file = files[0],
            fileExtension = file.name.split(".").pop();

        if (fileExtension === "gltf") {
            reader.onload = () => {
                // glTF-Datei verarbeiten
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    model = scene.primitives.add(Cesium.Model.fromGltf({
                        url: URL.createObjectURL(file),
                        id: scene.primitives._primitives.length - 4
                    })),
                    models = state.importedModels,
                    hasGeoreferencing = Boolean(model.extras?.georeferencing); // Verschiedene Konvention je nach glTF Doku? Beispiel vom BSW zum Testen?
                let position,
                    modelMatrix;

                if (hasGeoreferencing) {
                    position = Cesium.Cartesian3.fromDegrees(model.extras.georeferencing.longitude, model.extras.georeferencing.latitude, model.extras.georeferencing.altitude);
                    modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                }
                else {
                    position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
                    modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                }
                model.modelMatrix = modelMatrix;
                // Freigabe der URL von der glTF-Datei, sobald sie nicht mehr benötigt wird
                URL.revokeObjectURL(model.url);

                models.push({
                    id: model.id,
                    name: file.name,
                    show: true
                });

                commit("setImportedModels", models);
            };
        }
        else {
            // Unbekanntes Dateiformat
            console.error(fileExtension + " files are currently not supported!");
        }

        reader.onerror = (e) => {
            console.error("Fehler beim Lesen der Datei:", e.target.error);
        };
        reader.readAsArrayBuffer(file);
    }
};

export default actions;
