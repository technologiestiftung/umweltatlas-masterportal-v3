import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";
import Cookie from "../utils/utilsCookies";
import OIDC from "../utils/utilsOIDC";

/**
 * @const {String} configPath an array of possible config locations. First one found will be used
 */
const configPaths = [
    "configJson.Portalconfig.login"
];

/**
 * Removes all login information from the store and erases all corresponding cookies
 *
 * @param {Object} context the context Vue instance
 * @return {void}
 */
function logout (context) {
    OIDC.eraseCookies();

    context.commit("setLoggedIn", false);
    context.commit("setAccessToken", undefined);
    context.commit("setRefreshToken", undefined);
    context.commit("setScreenName", undefined);
    context.commit("setUsername", undefined);
    context.commit("setEmail", undefined);
}

export default {
    /**
     * Sets the config-params of this tool into state.
     * @param {Object} context the context Vue instance
     * @returns {Boolean} false, if config does not contain the tool
     */
    initialize: context => fetchFirstModuleConfig(context, configPaths, "login"),

    /**
     * Returns authentication URL
     *
     * @param {String} clientId the client ID
     * @param {String} redirectUri URL for redirection after login
     *
     * @return {String} the auth code url
     */
    async getAuthCodeUrl ({state, rootGetters}) {
        const {id} = state,
            oidcAuthorizationEndpoint = rootGetters.getRestServiceById(id)?.oidcAuthorizationEndpoint || this.oidcAuthorizationEndpoint,
            oidcClientId = rootGetters.getRestServiceById(id)?.oidcClientId || this.oidcClientId,
            oidcRedirectUri = rootGetters.getRestServiceById(id)?.oidcRedirectUri || this.oidcRedirectUri,
            oidcScope = rootGetters.getRestServiceById(id)?.oidcScope || this.oidcScope,

            url = await OIDC.getAuthCodeUrl(oidcAuthorizationEndpoint, oidcClientId, oidcRedirectUri, oidcScope);

        return url;
    },

    /**
     * Returns true if user is logged in, else false
     * @param {Object} context the context Vue instance
     * @return {Boolean} logged in
     */
    checkLoggedIn (context) {

        const {id} = context.state,
            config = context.rootGetters.getRestServiceById(id),
            token = Cookie.get("token"),
            refreshToken = Cookie.get("refresh_token");

        let loggedIn = false;


        context.commit("setAccessToken", token);
        context.commit("setRefreshToken", refreshToken);

        // check if token is expired
        if (OIDC.getTokenExpiry(token) < 1) {
            logout(context);
            return false;
        }

        OIDC.renewTokenIfNecessary(token, refreshToken, config);

        // set logged into store
        loggedIn = Boolean(token);

        context.commit("setLoggedIn", loggedIn);

        // set name and email into store
        context.commit("setScreenName", Cookie.get("name"));
        context.commit("setUsername", Cookie.get("username"));
        context.commit("setEmail", Cookie.get("email"));

        return loggedIn;
    },

    logout
};
