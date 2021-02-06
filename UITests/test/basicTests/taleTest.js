const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Tale", function () {
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

    it("should be able to be reached", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Tale?npcId=00000000-0000-0000-0000-000000000000");

        await testBed.checkElementExistsOnPage("#gn-taleDialogContainer");
        
        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});