import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import layerCollection from "../../layers/js/layerCollection";
import {nextTick} from "vue";

export default {
    highlightFeature ({dispatch}, highlightObject) {
        switch (highlightObject.type) {
            case "increase":
                dispatch("increaseFeature", highlightObject);
                break;
            case "viaLayerIdAndFeatureId":
                dispatch("highlightViaParametricUrl", highlightObject.layerIdAndFeatureId);
                break;
            case "highlightPolygon":
                dispatch("highlightPolygon", highlightObject);
                break;
            case "highlightLine":
                dispatch("highlightLine", highlightObject);
                break;
            default:
                console.warn(`Unrecognized highlight type: ${highlightObject.type}`);
                break;
        }
    },
    highlightPolygon ({commit, dispatch}, highlightObject) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) || undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.fill?.color) {
                clonedStyle.getFill().setColor(newStyle.fill.color);
            }
            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            feature.setStyle(clonedStyle);
        }
        else {
            dispatch("Maps/placingPolygonMarker", feature, {root: true});
        }
    },
    highlightLine ({commit, dispatch}, highlightObject) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) || undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            feature.setStyle(clonedStyle);
        }
        else {
            dispatch("Maps/placingPolygonMarker", feature, {root: true});
        }
    },

    /**
     * Highlights a feature by using layer ID and feature ID provided in the URL.
     * This function retrieves the specified feature using `getHighlightFeature`
     * and, if the feature is found, dispatches an action to place a polygon marker on the map.
     * @param {Object} context - The Vuex action context, which provides access to Vuex `dispatch` method.
     * @param {Array} layerIdAndFeatureId - An array containing the layer ID as the first element and the feature ID as the second element.
     * @returns {Promise<void>} A promise that resolves once the feature has been highlighted or when there's no feature to highlight.
     */
    async highlightViaParametricUrl ({dispatch}, layerIdAndFeatureId) {
        if (layerIdAndFeatureId) {
            const feature = await getHighlightFeature(layerIdAndFeatureId[0], layerIdAndFeatureId[1]);

            if (feature) {
                dispatch("Maps/placingPolygonMarker", feature, {root: true});
            }
        }
    },

    /**
 * increases the icon of the feature
 * @param {Function} commit commit function
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
    increaseFeature ({commit}, highlightObject) {
        const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
            feature = highlightObject.feature // given already
                ? highlightObject.feature
                : getHighlightFeature(highlightObject.layer?.id, highlightObject.id); // get feature from layersource, incl. check against clustered features
        let clonedStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature).clone() : null,
            clonedImage = null;

        if (!clonedStyle) {
            if (typeof feature.getStyle()?.clone === "function") {
                clonedStyle = feature.getStyle()?.clone();
            }
            else {
                clonedStyle = {...feature.getStyle()};
            }
        }
        clonedImage = clonedStyle && typeof clonedStyle.getImage === "function" ? clonedStyle.getImage() : undefined;

        if (clonedImage) {
            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (clonedStyle.getText()) {
                clonedStyle.getText().setScale(scaleFactor);
            }

            clonedImage.setScale(clonedImage.getScale() * scaleFactor);
            if (highlightObject?.highlightStyle?.fill && highlightObject?.highlightStyle?.fill?.color) {
                clonedImage.getFill().setColor(highlightObject.highlightStyle.fill.color);
            }
            feature.setStyle(clonedStyle);
        }
    }
};

/**
 * Asynchronously retrieves a feature by its layer ID and feature ID. If the layer's features are not yet loaded,
 * it waits for the 'featuresloadend' event before attempting to find the feature again.
 *
 * @param {String} layerId - The ID of the layer to search for the feature.
 * @param {String} featureId - The ID of the feature to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the found feature, or `undefined` if the feature is not found.
 */
async function getHighlightFeature (layerId, featureId) {
    let feature;

    await nextTick();
    const layerSource = layerCollection.getLayerById(layerId)?.layerSource;

    if (layerSource) {
        if (layerSource.getFeatures().length > 0) {
            feature = layerSource.getFeatureById(featureId) ||
                      layerSource.getFeatures().find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
        }
        else {
            await new Promise(resolve => {
                layerSource.once("featuresloadend", () => {
                    feature = layerSource.getFeatureById(featureId) ||
                              layerSource.getFeatures().find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));
                    resolve();
                });
            });
        }
    }

    return feature;
}


/**
 * Get style via styleList.
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @param {ol/feature} feature openlayers feature to highlight
 * @param {Boolean} [returnFirst = true] if true, returns the first found style, else all created styles
 * @returns {ol/style|Array} ol style
 */
function styleObject (highlightObject, feature, returnFirst = true) {
    const stylelistObject = highlightObject.styleId ? styleList.returnStyleObject(highlightObject.styleId) : styleList.returnStyleObject(highlightObject.layer.id);
    let style;

    if (stylelistObject !== undefined) {
        style = createStyle.createStyle(stylelistObject, feature, false, Config.wfsImgPath);
        if (returnFirst && Array.isArray(style) && style.length > 0) {
            style = style[0];
        }
    }
    return style;
}
