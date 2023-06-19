import Cookie from "./utilsCookies";
import Utils from "./utilsLogin";

/**
 * if false, local storage will ne used
 */
const useSessionStorage = false,
    verifierLength = 43,
    cryptoLib = window.msCrypto || window.crypto;

/**
 * creates a random state variable for the pkce challenge
 * @returns {String} state
 */
function createState () {
    const state = generateRandomString();

    return setState(state);
}

/**
 * Returns a pkce state - if available from store or generated
 * @returns {String} state
 */
function getState () {
    const storage = useSessionStorage ? window.sessionStorage : window.localStorage,
        state = storage.getItem("pkce_state");

    return state || createState();
}

/**
 * Sets the state into store (session or local)
 *
 * @param {String} state to put into store
 * @returns {String} state
 */
function setState (state) {
    const storage = useSessionStorage ? window.sessionStorage : window.localStorage;

    storage.setItem("pkce_state", state);
    return state;
}

/**
 * Generates a random string (the verifier) that is later signed before it is sent to the authorization server.
 *
 * @returns {String} the verifier
 */
function generateRandomString () {
    const array = new Uint8Array(verifierLength);

    cryptoLib.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates code challenge from verifier.
 * Web crypto API is used to hash the verifier using SHA-256.
 *
 * @param {String} verifier to create the challenge from
 * @returns {String} the code challenge
 */
async function createCodeChallenge (verifier) {

    // Calculate the SHA256 hash of the input text.
    const randomArray = new Uint8Array(verifier.length);

    for (let i = 0; i < verifier.length; i++) {
        randomArray[i] = verifier.charCodeAt(i);
    }
    // eslint-disable-next-line one-var
    const digest = await cryptoLib.subtle.digest("SHA-256", randomArray);

    // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    // eslint-disable-next-line one-var
    const challenge = b64Uri(String.fromCharCode.apply(null, new Uint8Array(digest)));

    return challenge;
}

/**
 * Creates a base64 uri for given string
 * @param {String} string create base64 uri for parameter
 * @returns {String} basr64 string
 */
function b64Uri (string) {
    // https://tools.ietf.org/html/rfc4648#section-5
    return btoa(string).replace(/\+/g, "-").replace(/\//g, "_").replace(/[=]+$/, "");
}

/**
 * Creates and stores the verifier into the session storage.
 * @param {Boolean} reset the verifier
 * @returns {String} verifier
 */
function getVerifier (reset = false) {
    const storage = useSessionStorage ? window.sessionStorage : window.localStorage,
        existingCodeVerifier = storage.getItem("code_verifier"),
        codeVerifier = existingCodeVerifier && !reset ? existingCodeVerifier : b64Uri(generateRandomString()).substring(0, verifierLength);

    storage.setItem("code_verifier", codeVerifier);
    return codeVerifier;
}

/**
 * Returns authentication URL
 *
 * @param {String} oidcAuthorizationEndpoint the oidc auth endpoint
 * @param {String} oidcClientId the client ID
 * @param {String} oidcRedirectUri URL for redirection after login
 * @param {String} oidcScope the oidc scope
 * @returns {String} auth code url
 */
async function getAuthCodeUrl (oidcAuthorizationEndpoint, oidcClientId, oidcRedirectUri, oidcScope) {

    const state = createState(),
        verifier = getVerifier(true),
        codeChallenge = await createCodeChallenge(verifier);

    return oidcAuthorizationEndpoint
        + "?response_type=code"
        + "&client_id=" + encodeURIComponent(oidcClientId)
        + "&state=" + encodeURIComponent(state)
        + "&scope=" + encodeURIComponent(oidcScope)
        + "&redirect_uri=" + encodeURIComponent(oidcRedirectUri)
        + "&code_challenge=" + encodeURIComponent(codeChallenge)
        + "&code_challenge_method=S256";

}

/**
 * Trades token by code
 *
 * @param {String} oidcTokenEndpoint the oidc token endpoint
 * @param {String} oidcClientId the client ID
 * @param {String} oidcRedirectUri URL for redirection after login
 * @param {String} oidcCode the code to trade
 * @returns {String} token
 */
function getToken (oidcTokenEndpoint, oidcClientId, oidcRedirectUri, oidcCode) {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", oidcTokenEndpoint, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.send(new URLSearchParams({
        grant_type: "authorization_code",
        code: oidcCode,
        client_id: oidcClientId,
        redirect_uri: oidcRedirectUri,
        code_verifier: getVerifier()
    }));

    return xhr;
}

/**
 * Refreshs token
 *
 * @param {String} oidcTokenEndpoint token endpoint
 * @param {String} oidcClientId the client ID
 * @param {String} refresh_token refresh_token
 * @returns {XMLHttpRequest} the sent request
 */
function refreshToken (oidcTokenEndpoint, oidcClientId, refresh_token) {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", oidcTokenEndpoint, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.send(new URLSearchParams({
        grant_type: "refresh_token",
        client_id: oidcClientId,
        refresh_token: refresh_token
    }));

    return xhr;
}

/**
 * sets all cookies
 *
 * @param {String} token the access token
 * @param {String} id_token id_token
 * @param {Integer} expires_in seconds to expire
 * @param {String} refresh_token the token to refresh auth
 * @returns {void}
 */
function setCookies (token, id_token, expires_in, refresh_token) {
    Cookie.set("token", token, 7);
    Cookie.set("id_token", id_token, 7);
    Cookie.set("expires_in", expires_in, 7);
    Cookie.set("refresh_token", refresh_token, 7);

    // set account data as cookies
    const account = Utils.parseJwt(token);

    Cookie.set("name", account?.name, 7);
    Cookie.set("email", account?.email, 7);
    Cookie.set("username", account?.preferred_username, 7);

    Cookie.set("expiry", account?.exp, 7);
}

/**
 * Erases all cookies
 * @returns {void}
 */
function eraseCookies () {
    Cookie.eraseAll(["token", "expires_in", "id_token", "refresh_token", "name", "username", "email", "expiry"]);
}

export default {
    createCodeChallenge,
    getVerifier,
    getAuthCodeUrl,
    getToken,
    getState,
    setCookies,
    eraseCookies,
    refreshToken
};
