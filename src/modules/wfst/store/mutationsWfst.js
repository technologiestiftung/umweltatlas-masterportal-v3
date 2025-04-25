import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import initialState from "./stateWfst";

const mutations = {
    ...generateSimpleMutations(initialState),
    /**
     * Gets select interaction status
     * @param {Object} Payload Mutation payload
     * @param {Object} Payload.featureProperties Property  of the features
     * @param {String} Payload.key key name
     * @param {(String|Number|Object)} Payload.value value
     * @returns {O} Interaction Button status
     */
    setFeatureProperty ({featureProperties}, {key, value, valid, required}) {
        featureProperties.find(property => property.key === key).value = value;
        featureProperties.find(property => property.key === key).valid = valid;
        featureProperties.find(property => property.key === key).required = required;
    },
    /**
     * Updates the value of a specific property for all features in the batch.
     *
     * @param {Object} context the Vuex context
     * @param {Array<Array<Object>>} context.featurePropertiesBatch an array of feature property arrays
     * @param {Object} payload the payload containing the key and value to update
     * @param {string} payload.key the key of the property to update
     * @param {(String|Number|Object)} payload.value the new value to set for the specified property
     * @returns {void}
     */
    setFeaturesBatchProperty ({featurePropertiesBatch}, {key, value}) {
        featurePropertiesBatch.forEach(featureProperties => {
            featureProperties.find(property => property.key === key).value = value;
        });
    }
};

export default mutations;
