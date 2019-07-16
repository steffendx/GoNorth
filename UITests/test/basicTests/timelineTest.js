const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Timeline page", function () {
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

    it("should be able to be opened and show entries", async function() {
        var testBed = this.test.testBed;
        await Promise.all([
            testBed.navigateByUrl("/Timeline"),
            testBed.waitForResponse(/\/api\/TimelineApi\/Entries\?/)
        ]);
        await testBed.checkElementExistsOnPage("#gn-timelineContainer");

        var navigateNextDisabled = await testBed.isElementDisabled("#gn-timeLineNext");
        if(!navigateNextDisabled) {
            let oldContent = await testBed.getElementText("#gn-timelineContainer");
            await Promise.all([
                testBed.clickElement("#gn-timeLineNext"),
                testBed.waitForResponse(/\/api\/TimelineApi\/Entries\?/i)
            ]);
            let newContent = await testBed.getElementText("#gn-timelineContainer");

            assert.notStrictEqual(oldContent, newContent, "Content not changed after loading next timeline page");
        }

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});