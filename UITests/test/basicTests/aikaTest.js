const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Aika", function () {
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
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkAika");

        await testBed.checkElementExistsOnPage("#gn-aikaChapterOverviewContainer");

        testBed.assertNoErrorsOccured();
    });

    it("chapter detail should not throw error", async function() {
        var testBed = this.test.testBed;
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkAika");

        var doesChapterDetailButtonExist = await testBed.doesElementExistOnPage(".gn-aikaChapterDetailButton");
        if(!doesChapterDetailButtonExist) {
            return;
        }
        
        await testBed.clickAndFollowLinkWithPopup(".gn-aikaChapterDetailButton");
        await testBed.checkElementExistsOnPage("#gn-aikaChapterDetailContainer");

        testBed.assertNoErrorsOccured();
    });

    it("quest list should not throw error", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Aika/QuestList");

        await testBed.checkElementExistsOnPage("#gn-aikaQuestListContainer");

        testBed.assertNoErrorsOccured();
    });

    it("quest form should not throw error", async function() {
        var testBed = this.test.testBed;
        
        await testBed.navigateByUrl("/Aika/Quest");

        await testBed.checkElementExistsOnPage("#gn-aikaQuestContainer");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});