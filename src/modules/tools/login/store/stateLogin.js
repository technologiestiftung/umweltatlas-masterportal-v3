/**
 * User type definition
 * @typedef {Object} LoginState
 * @property {Boolean} active if true, login is rendered
 *
 * @property {Boolean} loggedIn if true, user is logged in
 * @property {String} username the user that is logged in, otherwise undefined
 * @property {String} screenName the user's name that is shown in the frontend or undefined if not logged in
 * @property {String} email the user's email that is shown in the frontend or undefined if not logged in
 * @property {String} accessToken the oidc access token, if logged in, and undefined otherwise
 * @property {String} refreshToken the oidc refresh token, if logged in, and undefined otherwise
 *
 * @property {String} oidcAuthorizationEndpoint the oidc auth endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/auth"
 * @property {String} oidcTokenEndpoint the oidc token endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/token"
 * @property {String} oidcClientId  the oidc client, e.g. "masterportal" (must be created in your IDM, e.g. keycloak)
 * @property {String} oidcScope the scope used for oidc, defaults to "profile email openid"
 * @property {String} oidcRedirectUri the url to redirect the oidc process to - after login
 *
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {String}   iconLogin - icon next to title if not logged in
 * @property {String}   iconLogout - icon for logout button
 * @property {String}   iconLogged - icon next to title if logged
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 */
const state = {
    active: false,

    // login state
    loggedIn: false,
    username: undefined,
    screenName: undefined,
    email: undefined,
    accessToken: undefined,
    refreshToken: undefined,

    // oidc settings
    oidcAuthorizationEndpoint: "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/auth",
    oidcTokenEndpoint: "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/token",
    oidcClientId: "masterportal",
    oidcScope: "profile email openid",
    oidcRedirectUri: window?.location?.href?.split("?")[0] || "localhost",

    // addon state and properties
    id: "login",
    name: "common:menu.tools.login",
    icon: "bi-door-open",
    iconLogin: "bi-door-open",
    iconLogout: "bi-door-closed",
    iconLogged: "bi-person-circle",
    renderToWindow: true,
    resizableWindow: true,
    deactivateGFI: false
};

export default state;
