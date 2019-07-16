const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("ProjectConfig", function () {
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

    it("should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkProjectConfig");

        await testBed.checkElementExistsOnPage("#gn-projectConfigContainer");

        await testBed.clickElement(".gn-projectConfigTextareaSectionButton");
        await testBed.checkElementVisibleOnPage(".gn-projectConfigTextareaSectionContainer");

        await testBed.clickElement(".gn-projectConfigDayHourMinuteSectionToggleButton");
        await testBed.checkElementVisibleOnPage(".gn-projectConfigDayHourMinuteSectionContainer");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});