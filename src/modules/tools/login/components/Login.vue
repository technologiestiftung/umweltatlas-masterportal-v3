<script>
/**
 * Code proudly provided by:
 *   Name: KERNBLICK GmbH
 *   Email: info@kernblick.de
 *   Url: https://www.kernblick.de
 * Version: 1.0.0
 * License: MIT
 */

/* eslint-disable vue/multi-word-component-names */
import {mapMutations, mapGetters, mapActions} from "vuex";
import {getComponent} from "../../../../utils/getComponent";
import getters from "../store/gettersLogin";
import mutations from "../store/mutationsLogin";
import ToolTemplate from "../../ToolTemplate.vue";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import Cookie from "../utils/utilsCookies";
import Utils from "../utils/utilsLogin";
import OIDC from "../utils/utilsOIDC";

export default {
    name: "Login",
    components: {
        ToolTemplate
    },
    data () {
        return {
            storePath: this.$store.state?.Tools?.Login
        };
    },
    computed: {
        ...mapGetters("Tools/Login", Object.keys(getters))
    },
    watch: {
    /**
     * Listens to the active property change.
     * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
     * @returns {void}
     */
        active (isActive) {
            if (isActive) {
                if (!this.checkLoggedIn()) {
                    this.login();
                }
            }
        }
    },
    beforeCreate () {
        // when this module is loaded, intercept with OIDC flow
        Utils.interceptMasterportalLoad();
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.$nextTick(() => {
            this.initialize();
        });

        this.checkLoggedIn();
        setInterval(() => this.checkLoggedIn(), 10_000); // check every 10 seconds
    },
    methods: {
        ...mapMutations("Tools/Login", Object.keys(mutations)),
        ...mapActions("Tools/Login", ["initialize"]),
        translateKeyWithPlausibilityCheck,

        /**
         * Translates the given translationKey or keeps a given text as it is if no translationKey is detected.
         * @param {String} translationKey the value or key to translate, if this is not a translation key, it will return the value as it is
         * @param {Object} [options=null] the options to use for the translation, if given translationKey must be a translation key
         * @returns {String} the translation or the given param as it is
         */
        translate (translationKey, options = null) {
            if (typeof options === "object" && options !== null) {
                return i18next.t(translationKey, options);
            }
            return this.translateKeyWithPlausibilityCheck(translationKey, (v) => i18next.t(v));
        },

        /**
         * returns the config from config.js
         * @returns {Object|Boolean} the config object or false on error
         */
        getConfigObject () {
            if (typeof Config === "object" && Config !== null) {
                if (typeof Config.login === "object" && Config.login !== null) {
                    return Config.login;
                }
            }
            return false;
        },

        getTitle () {
            return this.translate("common:modules.login.profile") || "Profile";
        },

        /**
         * Returns true if user is logged in, else false
         * @return {Boolean} logged in
         */
        checkLoggedIn () {

            const token = Cookie.get("token"),
                refreshToken = Cookie.get("refresh_token");

            let loggedIn = false;

            this.setAccessToken(token);
            this.setRefreshToken(refreshToken);

            // check if token is expired
            if (this.getTokenExpiry() < 1) {
                this.logout();
                return false;
            }

            // if not, start renewing the token (if necessary)

            this.renewToken();


            // set logged into store
            loggedIn = Boolean(token);

            this.setLoggedIn(loggedIn);

            // set name and email into store
            this.setScreenName(Cookie.get("name"));
            this.setUsername(Cookie.get("username"));
            this.setEmail(Cookie.get("email"));

            // set login icon
            this.setLoginIcon();

            return loggedIn;
        },

        /**
         * Returns authentication URL
         *
         * @param {String} clientId the client ID
         * @param {String} redirectUri URL for redirection after login
         *
         * @return {String} the auth code url
         */
        async getAuthCodeUrl () {
            const oidcAuthorizationEndpoint = this.getConfigObject()?.oidcAuthorizationEndpoint || this.oidcAuthorizationEndpoint,
                oidcClientId = this.getConfigObject()?.oidcClientId || this.oidcClientId,
                oidcRedirectUri = this.getConfigObject()?.oidcRedirectUri || this.oidcRedirectUri,
                oidcScope = this.getConfigObject()?.oidcScope || this.oidcScope,

                url = await OIDC.getAuthCodeUrl(oidcAuthorizationEndpoint, oidcClientId, oidcRedirectUri, oidcScope);

            return url;
        },

        /**
         * Opens a login popup and stores retrieved login data into store
         *
         * @return {void}
         */
        async login () {
            // open javascript window
            const params = "width=500,height=500,status=no,location=no,menubar=no," +
                    `top=${window.screenY + (window.outerHeight - 500) / 2.5},` +
                    `left=${window.screenX + (window.outerWidth - 500) / 2}`,

                loginPopup = window.open(await this.getAuthCodeUrl(), this.translate("common:modules.login.login"), params);

            // check every x milliseconds if dialog has been closed
            // eslint-disable-next-line one-var
            const timer = setInterval(() => {
                if (loginPopup.closed) {
                    clearInterval(timer);

                    // dialog has been closed, login successful?
                    // this.checkLoggedIn();

                    this.reload();
                }
            }, 500);
        },

        /**
         * Reload the window if possible
         *
         * @return {void}
         */
        reload () {
            if (window?.location) {
                window.location.reload();
            }
        },

        /**
         * Removes all cookies and clears store
         * @param {Boolean} reload if true, the window will be reloaded after logout
         *
         * @return {void}
         */
        logout (reload = false) {
            // close login window
            this.close();

            // erase all cookies
            OIDC.eraseCookies();

            // reset the store
            this.setLoggedIn(false);
            this.setAccessToken(undefined);
            this.setRefreshToken(undefined);
            this.setScreenName(undefined);
            this.setUsername(undefined);
            this.setEmail(undefined);

            // set icon to reflect login state
            this.setLoginIcon();

            // reload window since it cannot partially update at the moment (TODO)
            if (reload) {
                this.reload();
            }
        },

        /**
         * Renews the token when the token is about to expire
         *
         * @return {void}
         */
        async renewToken () {

            const expiry = this.getTokenExpiry();

            // if the token will expire in the next 5 minutes, let's refresh
            if (expiry > 0 && expiry <= 360_000) {

                const oidcTokenEndpoint = this.getConfigObject()?.oidcTokenEndpoint || this.oidcTokenEndpoint,
                    oidcClientId = this.getConfigObject()?.oidcClientId || this.oidcClientId,
                    refreshToken = Cookie.get("refresh_token"),

                    req = OIDC.refreshToken(oidcTokenEndpoint, oidcClientId, refreshToken);

                if (req.status === 200) {
                    const response = JSON.parse(req.response);

                    OIDC.setCookies(response.access_token, response.id_token, response.expires_in, response.refresh_token);
                }
                else {
                    console.error("Could not refresh token.", req.response);
                }
            }
        },

        /**
         * Returns expiry in miliseconds from existing token.
         * Returns 0, if token is already expired or not existing.
         *
         * @return {int} expiry in miliseconds
         */
        getTokenExpiry () {
            if (this.accessToken) {
                const account = Utils.parseJwt(this.accessToken),
                    expiry = account.exp ? account.exp * 1000 : 0,
                    timeToExpiry = expiry - Date.now();

                return Math.max(0, timeToExpiry);
            }
            return 0;

        },

        /**
         * Adds a login icon in the search bar
         *
         * @return {void}
         */
        setLoginIcon () {

            let loginTextDesktop, loginItemMobileText, icon;

            const loginIconDesktop = document.querySelector("#navbarMenu .nav-menu.desktop li.nav-item a span[name=login]"),
                loginItemMobileIcon = document.querySelector("#navbarMenu .nav-menu.mobile li span[name=login]");

            // update icon if appropriate (Desktop menu)
            if (loginIconDesktop) {
                // set id for login nav item
                loginIconDesktop.parentElement.parentElement.id = "login";

                loginTextDesktop = loginIconDesktop.parentElement;
                icon = loginIconDesktop.getElementsByTagName("i")[0];

                if (this.storePath?.loggedIn) {
                    icon.className = this.iconLogged;
                    loginTextDesktop.innerHTML = String(loginIconDesktop.outerHTML) + ` ${this.translate("common:modules.login.logout")} `;
                }
                else {
                    icon.className = this.iconLogin;
                    loginTextDesktop.innerHTML = String(loginIconDesktop.outerHTML) + ` ${this.translate("common:modules.login.login")} `;
                }
            }

            // update icon if appropriate (Mobile menu)
            if (loginItemMobileIcon) {
                loginItemMobileText = loginItemMobileIcon.nextElementSibling;
                icon = loginItemMobileIcon.getElementsByTagName("i")[0];

                if (this.storePath?.loggedIn) {
                    icon.className = this.iconLogged;
                    loginItemMobileText.innerHTML = this.translate("common:modules.login.logout");
                }
                else {
                    icon.className = this.iconLogin;
                    loginItemMobileText.innerHTML = this.translate("common:modules.login.login");
                }
            }
        },

        /**
         * Closes the window of login by setting store active to false.
         * @pre window is opened
         * @post window is closed
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.storePath?.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        v-if="active"
        :title="getTitle()"
        :icon="iconLogin"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-g-f-i="deactivateGFI"
        class="login-window"
    >
        <template #toolBody>
            <div
                v-show="!screenName && !email"
                class="progress-loader"
            >
                <div class="loader" />
                <span>{{ $t('common:modules.login.progress') }}</span>
            </div>
            <div v-show="screenName">
                <span>{{ translate('common:modules.login.name') }}:</span>
                <span>{{ screenName }}</span>
            </div>
            <div v-show="email">
                <span>{{ translate('common:modules.login.email') }}:</span>
                <span>{{ email }}</span>
            </div>
            <div><p>&nbsp;</p></div>
            <button
                id="logout-button"
                class="btn btn-logout"
                type="button"
                :title="translate('common:modules.login.logout')"
                @click="logout(true)"
            >
                <span class="bootstrap-icon logout-icon">
                    <i
                        id="logout-icon"
                        class="bi-door-closed"
                    /> {{ translate('common:modules.login.logout') }}
                </span>
            </button>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";
.login-window {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 2000;
}
.progress-loader {
  display: flex;
  flex-direction: row;
}
.loader {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid #333333; /* Grey */
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 2s linear infinite;
  display: inline;
  margin-right: 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<style>
li.nav-item#login {
    margin: 0px 20px;
}
li.nav-item#login a {
    background-color: rgb(0, 48, 99);
    padding: 3px 7px;
    border-radius: 17px;
    color: white;
    margin: 12px 0px;
    font-weight: normal;
}

#root .dropdown {
    border-right: none !important;
}
</style>
