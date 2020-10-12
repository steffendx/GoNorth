const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Styr", function () {
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
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkStyr");

        await testBed.checkElementExistsOnPage("#gn-styrOverviewContainer");

        testBed.assertNoErrorsOccured();
    });

    it("should be able to use paging buttons", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Styr");

        var navigateNextDisabled = await testBed.isElementDisabled("#gn-flexFieldOverviewNextPageButton");
        if(!navigateNextDisabled) {
            let oldContent = await testBed.getElementText("#gn-styrOverviewContainer");
            await Promise.all([
                testBed.clickElement("#gn-flexFieldOverviewNextPageButton"),
                testBed.waitForResponse(/\/api\/StyrApi\/FlexFieldObjects\?/i)
            ]);
            let newContent = await testBed.getElementText("#gn-styrOverviewContainer");

            assert.notStrictEqual(oldContent, newContent, "Content not changed after loading next overview page");
        }

        testBed.assertNoErrorsOccured();
    });

    it("should be able to use command buttons", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Styr");

        await testBed.clickElement("#gn-flexFieldOverviewCreateObjectButton");
        await testBed.checkElementVisibleOnPage("#gn-flexFieldOverviewCreateObjectDropdown");

        await testBed.clickElement("#gn-flexFieldCreateFolderButton");
        await testBed.checkElementVisibleOnPage("#gn-flexFieldFolderCreateEditDialog");
        await testBed.clickElement("#gn-flexFieldFolderCreateEditDialogCancel");
        await testBed.checkElementHiddenOnPage("#gn-flexFieldFolderCreateEditDialog");

        await testBed.clickElement("#gn-flexFieldValueExportButton");
        await testBed.checkElementVisibleOnPage("#gn-flexFieldValueExportDialog");
        await testBed.clickElement("#gn-flexFieldValueExportDialogCancelButton");
        await testBed.checkElementHiddenOnPage("#gn-flexFieldValueExportDialog");
        
        await testBed.clickElement("#gn-flexFieldValueImportButton");
        await testBed.checkElementVisibleOnPage("#gn-flexFieldValueImportDialog");
        await testBed.clickElement("#gn-flexFieldValueImportDialogCancelButton");
        await testBed.checkElementHiddenOnPage("#gn-flexFieldValueImportDialog");

        testBed.assertNoErrorsOccured();
    });

    it("Template Form should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Styr/Item?template=1");

        await testBed.checkElementExistsOnPage("#gn-styrItemContainer");
        await testBed.checkElementExistsOnPage("#gn-flexFieldDetailFormDistributeFieldsButton");

        testBed.assertNoErrorsOccured();
    });

    it("Detail Form should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Styr/Item");

        await testBed.checkElementExistsOnPage("#gn-styrItemContainer");

        testBed.assertNoErrorsOccured();
    });
    
    it("Manage templates form should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Styr/ManageTemplates");

        await testBed.checkElementExistsOnPage("#gn-styrManageTemplatesContainer");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});