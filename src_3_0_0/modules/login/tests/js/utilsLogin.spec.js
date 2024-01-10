import {expect} from "chai";
import * as loginModule from "../../js/utilsLogin";

describe("Login Module", () => {
    describe("handleLoginParameters", () => {
        it("should return false if Config does not have login property", () => {
            global.Config = {};
            expect(loginModule.handleLoginParameters()).to.equal(false);
        });
    });
});
