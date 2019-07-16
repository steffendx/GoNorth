const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Kortisto", function () {
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

    it("should be able to be reached from homepage", async function() {
        var testBed = this.test.testBed;
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkKortisto");

        await testBed.checkElementExistsOnPage("#gn-kortistoOverviewContainer");

        testBed.assertNoErrorsOccured();
    });

    it("should be able to use command buttons", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Kortisto");

        var navigateNextDisabled = await testBed.isElementDisabled("#gn-flexFieldOverviewNextPageButton");
        if(!navigateNextDisabled) {
            let oldContent = await testBed.getElementText("#gn-kortistoOverviewContainer");
            await Promise.all([
                testBed.clickElement("#gn-flexFieldOverviewNextPageButton"),
                testBed.waitForResponse(/\/api\/KortistoApi\/FlexFieldObjects\?/i)
            ]);
            let newContent = await testBed.getElementText("#gn-kortistoOverviewContainer");

            assert.notStrictEqual(oldContent, newContent, "Content not changed after loading next overview page");
        }

        await testBed.clickElement("#gn-flexFieldOverviewCreateObjectButton");
        await testBed.checkElementVisibleOnPage("#gn-flexFieldOverviewCreateObjectDropdown");

        await testBed.clickElement("#gn-flexFieldCreateFolderButton");
        await testBed.checkElementVisibleOnPage("#gn-flexFieldFolderCreateEditDialog");
        await testBed.clickElement("#gn-flexFieldFolderCreateEditDialogCancel");
        await testBed.checkElementHiddenOnPage("#gn-flexFieldFolderCreateEditDialog");

        testBed.assertNoErrorsOccured();
    });

    it("Template Form should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Kortisto/Npc?template=1");

        await testBed.checkElementExistsOnPage("#gn-kortistoNpcContainer");
        await testBed.checkElementExistsOnPage("#gn-flexFieldDetailFormDistributeFieldsButton");

        testBed.assertNoErrorsOccured();
    });

    it("Detail Form should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Kortisto/Npc");

        await testBed.checkElementExistsOnPage("#gn-kortistoNpcContainer");

        testBed.assertNoErrorsOccured();
    });
    
    it("Manage templates form should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Kortisto/ManageTemplates");

        await testBed.checkElementExistsOnPage("#gn-kortistoManageTemplatesContainer");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});