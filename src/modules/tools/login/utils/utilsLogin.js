import isObject from "../../../../utils/isObject";

import Cookie from "./utilsCookies";
import OIDC from "./utilsOIDC";
import AxiosUtils from "./utilsAxios";

/**
 * This function is used to intercept the masterportal load to
 * - check for oidc paraters
 * - set the oidc token
 * - add interceptors to axios, XHR, and fetch
 * - stop masterportal from loading
 *
 * @return {void}
 */
function interceptMasterportalLoad () {

    /**
     * Perform oidc login, if url parameter is present
     */
    if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);

        // a little bit styling for response messages
        if (urlParams.has("error") || urlParams.has("code")) {
            document.querySelector("body").style.setProperty("margin", "10px");
        }

        // Check if the server returned an error string
        if (urlParams.has("error")) {
            const error = urlParams.get("error"),
                error_description = urlParams.get("error_description");

            document.querySelector("body").innerHTML = "<h1>" + error + "</h1><p>" + error_description + "</p>";
        }

        // If the server returned an authorization code, try to trade it for an access token
        if (urlParams.has("code")) {
            const code = urlParams.get("code"),
                state = urlParams.get("state");

            // Verify state matches what we set at the beginning
            if (OIDC.getState() !== state) {
                document.querySelector("body").innerHTML = "<h1>Invalid state</h1>";
            }

            // state is correct
            else {

                // this is kind of "hacky" to stop vue from rendering
                const mpcontainer = document.querySelector("#masterportal-container");

                if (mpcontainer !== null) {
                    mpcontainer.remove();
                }

                // eslint-disable-next-line one-var
                const config = getConfigObject(),
                    req = OIDC.getToken(config.oidcTokenEndpoint, config.oidcClientId, config.oidcRedirectUri, code);

                // put token into cookie, if token exists (login succeeded)
                if (req?.status === 200) {
                    const response = JSON.parse(req.response);

                    OIDC.setCookies(response.access_token, response.id_token, response.expires_in, response.refresh_token);

                    document.querySelector("body").innerHTML = "user logged in: " + (Cookie.get("email") || "no email defined for user");
                }

                // login failed
                else {
                    OIDC.eraseCookies();
                    document.querySelector("body").innerHTML = "Status: " + req?.status + " " + req?.responseText;
                }

                // for redirects close popup window
                window.close();

            }
        }
    }

    // check if token is set in cookie
    const token = Cookie.get("token");

    if (token !== undefined) {

        // check token expiry
        const account = parseJwt(token),
            expiry = account.exp ? account.exp * 1000 : Date.now() + 10_000,

            // add axios interceptor
            config = getConfigObject();

        if (Date.now() > expiry) {
            OIDC.eraseCookies();
        }

        AxiosUtils.addInterceptor(token, config?.interceptorUrlRegex);
    }
}

/**
 * Return config for login, if existing.
 * The configuration is defined in config.js and loaded via <script> tag.
 *
 * @returns configuration object for login
 * @return {void}
 */
function getConfigObject () {
    if (typeof Config === "object" && Config !== null) {
        if (typeof Config.login === "object" && Config.login !== null) {
            return Config.login;
        }
    }
    return false;
}

/**
 * Clones the given object and returns the clone or false on error.
 * @param {Object} obj the object to be cloned
 * @returns {Object|Boolean} the cloned object or false if anything went wrong
 */
function cloneObject (obj) {
    if (!isObject(obj)) {
        return false;
    }

    try {
        return JSON.parse(JSON.stringify(obj));
    }
    catch (e) {
        return false;
    }
}

/**
 * Parses jwt token. This function does *not* validate the token.
 * @param {String} token jwt token to be parsed
 * @returns {String} parsed jwt token as object
 */
function parseJwt (token) {
    const base64Url = token.split(".")[1],
        base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"),
        jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));

    return JSON.parse(jsonPayload);
}

/**
 * @param {String} html representing a single element
 * @return {Element} HTMLElement for given HTML string
 */
function htmlToElement (html) {
    const template = document.createElement("template"),
        trimmedHtml = html.trim(); // Never return a text node of whitespace as the result

    template.innerHTML = trimmedHtml;
    return template.content.firstChild;
}

export default {
    interceptMasterportalLoad,
    cloneObject,
    parseJwt,
    htmlToElement,
    getConfigObject
};
