const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Logout", function () {
    it("should be possible to logout", async function() {
        var testBed = new uiTestBed(null);
        await testBed.initAndLoginUITest(this);

        try
        {
            await testBed.clickAndFollowLink("#gn-logoutButton");
        }
        catch(e) 
        {
            await testBed.clickElement("#gn-navbarCollapseExpand");
            await testBed.clickAndFollowLink("#gn-logoutButton");
        }

        await testBed.checkElementExistsOnPage("#gn-signedOut");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});