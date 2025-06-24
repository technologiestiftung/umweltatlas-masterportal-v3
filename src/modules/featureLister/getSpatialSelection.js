import WFS from "ol/format/WFS";
import {intersects} from "ol/format/filter";
import Polygon from "ol/geom/Polygon";
import GeoJSON from "ol/format/GeoJSON";

// TODO make Text in alert translatable

/**
 * Fetches features from a WFS service based on the drawn geometry.
 * @param {Array} coordinates - The coordinates of the drawn geometry (e.g. from graphicalSelect).
 * @param {Object} selectedLayer - The selected layer containing WFS service details.
 * @param {string} epsg - The EPSG code for the coordinate reference system.
 * @returns {Promise<Array>} - A promise that resolves to an array of features.
 */
async function getSpatialSelectionForWFS (geom, selectedLayer, epsg, dispatch) {
    let text = "",
        features = [];

    const service = selectedLayer.url,
        version = selectedLayer.version,
        prefix = selectedLayer.prefix || "app",
        featureType = selectedLayer.featureType,
        questionMarkOrAmpersand = service.includes("?MAP=") ? "&" : "?",
        describeFeatureResponse = await fetch(`${service}${questionMarkOrAmpersand}service=WFS&version=${version}&request=DescribeFeatureType&typeName=${featureType}`),
        describeFeatureText = await describeFeatureResponse.text(),
        parser = new DOMParser(),
        describeFeatureXmlDoc = parser.parseFromString(describeFeatureText, "text/xml"),
        geometryElements = describeFeatureXmlDoc.querySelector("[type^=\"gml:\"][name]"),
        geometryElement = Array.isArray(geometryElements) ? geometryElements[0] : geometryElements,
        geometryName = geometryElement ? geometryElement.getAttribute("name") : "geom",
        filter = intersects(geometryName, geom),
        wfsFormat = new WFS(),
        node = wfsFormat.writeGetFeature({
            srsName: epsg,
            featureNS: selectedLayer.featureNS,
            featurePrefix: prefix,
            featureTypes: [featureType],
            filter: filter
        }),
        serializer = new XMLSerializer(),
        body = serializer.serializeToString(node),
        response = await fetch(selectedLayer.url, {
            method: "POST",
            headers: {"Content-Type": "text/xml"},
            body
        });

    if (!response.ok) {
        dispatch("Alerting/addSingleAlert", {
            category: "warning",
            content: i18next.t("common:modules.featureLister.requestFailedAlert")
        }, {root: true});
        throw new Error(`Failed to fetch data from WFS service: ${response.statusText}`);
    }
    text = await response.text();

    features = wfsFormat.readFeatures(text, {
        dataProjection: epsg,
        featureProjection: epsg
    });

    return features;
}

/**
 * Fetches features from an OAF service based on the drawn geometry. If the OAF service does not support POST requests, it uses a GET request with bounding box.
 * @param {Array} coordinates - The coordinates of the drawn geometry (e.g. from graphicalSelect).
 * @param {Object} selectedLayer - The selected OAF layer containing service details.
 * @param {string} epsg - The EPSG code for the coordinate reference system.
 * @param {Function} dispatch - The Vuex dispatch function to handle alerts.
 * @returns {Promise<Array>} - A promise that resolves to an array of features.
 */
async function getSpatialSelectionForOAF (geom, selectedLayer, epsg, dispatch) {
    const geojsonFormat = new GeoJSON(),
        geojsonPolygon = geojsonFormat.writeGeometryObject(geom, {
            dataProjection: epsg,
            featureProjection: epsg
        });

    let response = await fetch(selectedLayer.url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                geometry: geojsonPolygon
            })
        }),
        data = null,
        features = null,
        showBboxFallbackAlert = false;

    if (!response.ok) {
        const extent = geom.getExtent(),
            bboxParam = extent.join(","),
            crs = `http://www.opengis.net/def/crs/EPSG/0/${epsg.split(":")[1]}`,
            bboxCrs = `http://www.opengis.net/def/crs/EPSG/0/${epsg.split(":")[1]}`,
            collectionId = selectedLayer.collection,
            urlWithParameters = `${selectedLayer.url}/collections/${collectionId}/items?bbox=${bboxParam}&crs=${crs}&bbox-crs=${bboxCrs}&f=json`;

        response = await fetch(urlWithParameters, {
            method: "GET"
        });
        if (!response.ok) {
            dispatch("Alerting/addSingleAlert", {
                category: "error",
                content: i18next.t("common:modules.featureLister.requestFailedAlert")
            }, {root: true});
            throw new Error(`Failed to fetch data from OAF service: ${response.statusText}`);
        }
        showBboxFallbackAlert = true;
    }

    data = await response.json();
    features = geojsonFormat.readFeatures(data, {
        dataProjection: epsg,
        featureProjection: epsg
    });

    if (features.length && showBboxFallbackAlert) {
        dispatch("Alerting/addSingleAlert", {
            category: "info",
            content: i18next.t("common:modules.featureLister.unsupportedRequest")
        }, {root: true});
    }

    return features;
}

/**
 * Fetches features based on the drawn geometry and the selected layer type.
 * @param {Array} coordinates - The coordinates of the drawn geometry.
 * @param {Object} selectedLayer - The selected layer containing service details.
 * @param {string} epsg - The EPSG code for the coordinate reference system.
 * @param {Function} dispatch - The Vuex dispatch function to handle alerts.
 * @returns {Promise<Array|boolean>} - A promise that resolves to an array of features or null if the layer type is not supported.
 */
async function getSpatialSelection (coordinates, selectedLayer, epsg, dispatch) {
    const drawnGeometry = JSON.stringify(coordinates),
        coordinatesArray = JSON.parse(drawnGeometry).coordinates[0],
        geom = new Polygon([coordinatesArray]);

    if (selectedLayer.typ === "WFS") {
        return getSpatialSelectionForWFS(geom, selectedLayer, epsg, dispatch);
    }
    if (selectedLayer.typ === "OAF") {
        return getSpatialSelectionForOAF(geom, selectedLayer, epsg, dispatch);
    }
    return null;
}

export default getSpatialSelection;

