const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");
const testConfig = require("./../shared/testConfig");

describe("Login", function () {
    it("should not be able to login with invalid credentials", async function() {
        var config = new testConfig("THIS_IS_A_WRONG_LOGIN@WRONGLOGIN.LOCAL", "AND_THIS_IS_EVEN_MORE_WRONG");
        var testBed = new uiTestBed(config);

        var couldNotLogin = false;
        try {
            var testEnvValues = await testBed.initAndLoginUITest(this);
        }
        catch (e) {
            if(e.message == "Could not login") {
                couldNotLogin = true;
            } else {
                assert.fail(e.message);
            }
        }

        assert.ok(couldNotLogin, "User was able to login in even with wrong credentials");
        testBed.assertNoErrorsOccured();
    });

    it("should be possible with valid credentials", async function() {
        var testBed = new uiTestBed(null);
        await testBed.initAndLoginUITest(this);

        await testBed.checkElementExistsOnPage(".gn-homeTileContainer");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});