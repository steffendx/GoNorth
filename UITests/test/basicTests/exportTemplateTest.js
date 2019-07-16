const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Export Template", function () {
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

    it("should not throw errors on page", async function() {
        var testBed = this.test.testBed;
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkExportSettings");

        await testBed.checkElementExistsOnPage("#gn-exportTemplateOverviewContainer");

        await testBed.clickElement("#gn-exportTemplateOverviewSettingsButton");
        await testBed.checkElementVisibleOnPage("#gn-exportTemplateOverviewSettingsDialog");

        testBed.assertNoErrorsOccured();
    });

    it("should not throw errors on function generation condition page", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Export/FunctionGenerationCondition");

        await testBed.checkElementExistsOnPage("#gn-functionGenerationConditionContainer");

        await testBed.clickElement(".gn-functionGenerationConditionListNewRuleButton");
        await testBed.checkElementVisibleOnPage(".gn-nodeConditionDialogContainer");

        testBed.assertNoErrorsOccured();
    });

    it("should not throw errors on export template page", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Export/ManageTemplate?templateType=0");

        await testBed.checkElementExistsOnPage("#gn-exportManageTemplateContainer");

        await testBed.clickElement("#gn-exportManageTemplatePlaceholderToggleButton");
        await testBed.checkElementVisibleOnPage(".gn-exportManageTemplatePlaceholderContainer");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});