const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Karta", function () {
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
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkKarta");

        await testBed.checkElementExistsOnPage("#gn-kartaMapContainer");

        await testBed.clickElement(".gn-kartaMarkerManagerLabelToggleButton");
        await testBed.checkElementVisibleOnPage(".gn-kartaMarkerManagerEntryContainer");

        testBed.assertNoErrorsOccured();
    });
    
    it("should not throw errors on manage map", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Karta/ManageMaps");

        await testBed.checkElementExistsOnPage("#gn-kartaManageMapsContainer");

        await testBed.clickElement("#gn-kartaManageMapsCreateMap");
        await testBed.checkElementVisibleOnPage("#gn-kartaManageMapsCreateMapDialog");

        testBed.assertNoErrorsOccured();
    });
    
    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});