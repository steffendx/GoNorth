const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Manage User page", function () {
    beforeEach(async function() {
        this.currentTest.testBed = new uiTestBed(null);

        try {
            this.currentTest.testEnvValues = await this.currentTest.testBed.initAndLoginUITest(this);
        }
        catch (e) {
            assert.fail("Could not login " + e);
        }
        
        this.currentTest.testBed.assertNoErrorsOccured();
    });

    it("should be able to load all manage user pages", async function() {
        var testBed = this.test.testBed;
        await testBed.navigateByUrl("/Manage/Index");

        await testBed.checkElementExistsOnPage("#gn-userManageProfileContainer");
        await testBed.checkElementExistsOnPage("#gn-userManageProfile");
        await testBed.clickAndFollowLink("#gn-userManageChangePassword");

        await testBed.checkElementExistsOnPage("#gn-userManageChangePasswordContainer");
        await testBed.checkElementExistsOnPage("#gn-userManagePreferences");
        await testBed.clickAndFollowLink("#gn-userManagePreferences");
        
        await testBed.checkElementExistsOnPage("#gn-userPreferencesContainer");

        var personalDataLinkExists = await testBed.doesElementExistOnPage("#gn-userManagePersonalData");
        if(personalDataLinkExists) {
            await testBed.clickAndFollowLink("#gn-userManagePersonalData");
            await testBed.checkElementExistsOnPage("#gn-personalDataContainer");
        }

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});