const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Kirja", function () {
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
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkKirja");

        await testBed.checkElementExistsOnPage("#gn-kirjaPageContainer");

        await testBed.clickElement(".gn-kirjaSidebarButton");
        await testBed.checkElementVisibleOnPage(".gn-kirjaSidebar");

        testBed.assertNoErrorsOccured();
    });
    
    it("should not throw errors on review", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Kirja/Review");

        await testBed.checkElementExistsOnPage("#gn-kirjaReviewContainer");

        testBed.assertNoErrorsOccured();
    });
    
    it("should not throw errors on page list", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Kirja/Pages");

        await testBed.checkElementExistsOnPage("#gn-kirjaAllPagesContainer");

        await testBed.clickAndFollowLink("#gn-kirjaAllPagesCreateNewPageButton");
        await testBed.checkElementExistsOnPage("#gn-kirjaPageContainer");
        
        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});