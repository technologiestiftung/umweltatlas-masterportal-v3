import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";

import LoginComponent from "../../../components/Login.vue";
import Login from "../../../store/indexLogin";
import rootGetters from "../../../../../../app-store/getters.js";
import Cookie from "../../../utils/utilsCookies";

import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue(),
    fakeToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjViY2IzZThmNDM2MGI0YjI4MWRjNDM4ZTExODE4YzZlIn0.e30.LEo9imrM5zuR1yo-KMzdY62XbnL7UBO2AImB2Pf-bD35NVZlMsU7xsXMUX6petNWU61tJSFzyMk4nWZQHm3LBQ";

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/login/components/Login.vue", () => {
    const
        sandbox = sinon.createSandbox(),
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            loginComponent: {
                                oidcAuthorizationEndpoint: "https://idm.localhost",
                                oidcTokenEndpoint: "https://idm.localhost",
                                oidcClientId: "public_masterportal",
                                oidcRedirectUri: "https://localhost/portal/basic/",
                                oidcScope: "profile email openid",
                                interceptorUrlRegex: "https?://localhost/"
                            }
                        }
                    }
                }
            }
        };
    let store,
        wrapper;

    // fake translate function
    sandbox.replaceGetter(LoginComponent.methods, "translate", sinon.fake.returns("translated"));

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Login: Login
                    }
                }
            },
            getters: {
                mobile: () => false,
                ...rootGetters
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/Login/setActive", true);
    });
    afterEach(() => {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("Login template", () => {
        it("should exist", async () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.exists()).to.be.true;
        });

        it("should find Tool component", async () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});
            const toolWrapper = wrapper.findComponent({name: "ToolTemplate"});

            expect(toolWrapper.exists()).to.be.true;
        });

        it("should render Login", () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.find(".login-window").exists()).to.be.true;
            expect(wrapper.find(".login-window button#logout-button").exists()).to.be.true;
        });

        it("should have values from store Login renders", () => {
            store.commit("Tools/Login/setScreenName", "Max Mustermann");
            store.commit("Tools/Login/setEmail", "Max.Mustermann@domain.com");

            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.html().includes("Max Mustermann")).to.be.true;
            expect(wrapper.html().includes("Max.Mustermann@domain.com")).to.be.true;
        });

        it("should not render if active is false", () => {
            store.commit("Tools/Login/setActive", false);

            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.find(".login-window").exists()).to.be.false;
        });

        it("should not call logout fn if button was not clicked", () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});
            wrapper.vm.logout = sinon.fake();

            expect(wrapper.vm.logout.calledOnce).to.be.false;
        });

        it("should call logout fn if button is clicked", async () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});

            wrapper.vm.reload = sinon.fake();
            sandbox.spy(wrapper.vm, "logout");
            sandbox.spy(wrapper.vm, "close");

            await wrapper.find(".login-window button#logout-button").trigger("click");
            expect(wrapper.vm.logout.calledOnce).to.be.true;
            expect(wrapper.vm.close.calledOnce).to.be.true;
            expect(wrapper.vm.reload.calledOnce).to.be.true;
        });

        it("should close tool if logout button is clicked", async () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});
            wrapper.vm.reload = sinon.fake();

            await wrapper.find(".login-window button#logout-button").trigger("click");

            expect(wrapper.find(".login-window").exists()).to.be.false;
        });

        it("should call login after Login renders", () => {
            const spyLogin = sinon.spy(LoginComponent.methods, "checkLoggedIn", ["get"]);

            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(spyLogin.get.calledOnce).to.be.true;
        });

        it("should not be logged in after Login renders", () => {
            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.vm.checkLoggedIn()).to.be.false;
        });

        it("should be logged in after Login renders", () => {
            // fake that the token is not expired yet
            const local_sandbox = sinon.createSandbox();

            // return a "valid" cookie
            local_sandbox.replace(Cookie, "get", sinon.fake.returns(fakeToken));

            // fake that the token is not expired yet
            local_sandbox.replaceGetter(LoginComponent.methods, "getTokenExpiry", sinon.fake.returns(1));

            wrapper = shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.vm.checkLoggedIn()).to.be.true;
        }).timeout(5000);

        it("should have values from cookies after Login renders", async () => {
            const local_sandbox = sinon.createSandbox();

            // fake that the token is not expired yet
            local_sandbox.replaceGetter(LoginComponent.methods, "getTokenExpiry", sinon.fake.returns(1));

            // return a "valid" cookie
            local_sandbox.replace(Cookie, "get", sinon.fake.returns(fakeToken));

            wrapper = await shallowMount(LoginComponent, {store, localVue});

            expect(wrapper.vm.$store.state.Tools.Login.screenName).to.be.equal(fakeToken);
            expect(wrapper.vm.$store.state.Tools.Login.username).to.be.equal(fakeToken);
            expect(wrapper.vm.$store.state.Tools.Login.email).to.be.equal(fakeToken);
        }).timeout(5000);

    });

});
