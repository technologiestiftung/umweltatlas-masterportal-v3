import {expect} from "chai";
import * as loginModule from "../../js/utilsLogin";

describe("Login Module", () => {

    describe("handleLoginParameters", () => {
        const originalGlobalConfig = global.Config;

        beforeEach(() => {
            global.Config = {};
        });

        afterEach(() => {
            global.Config = originalGlobalConfig;
        });
        it("should return false if Config does not have login property", () => {
            global.Config = {};
            expect(loginModule.handleLoginParameters()).to.equal(false);
        });
    });
});
