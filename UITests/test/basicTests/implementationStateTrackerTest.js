const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");
const sleep = require("./../shared/sleep");

describe("Implementation status tracker", function () {
    async function testImplementationNavPoint(testBed, navPointSelection, containerSelector, urlRegex) {
        var doesNavButtonExist = await testBed.doesElementExistOnPage(navPointSelection);
        if(!doesNavButtonExist) {
            return;
        }

        var promises = [];
        if(urlRegex) {
            promises.push(testBed.waitForResponse(urlRegex));
        }
        promises.push(testBed.clickElement(navPointSelection));
        await Promise.all(promises);
        var doesEntryExist = await testBed.doesElementExistOnPage(containerSelector + " .gn-implementationStatusObjectListEntryCompareButton");
        if(!doesEntryExist) {
            return;
        }

        await testBed.clickElement(containerSelector + " .gn-implementationStatusObjectListEntryCompareButton");
        await testBed.checkElementVisibleOnPage(".gn-implementationCompareDialogContainer");
        await testBed.clickElement(".gn-implementationCompareDialogCancelButton");
        await sleep(400);
    }


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

    it("should not throw errors and allow to navigate", async function() {
        var testBed = this.test.testBed;
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkImplementationStatusTracker");

        await testBed.checkElementExistsOnPage("#gn-overviewContainer");

        await testImplementationNavPoint(testBed, "#gn-implementationStatusDialogsListNavButton", "#gn-implementationStatusObjectListDialogs", /\/api\/TaleApi\/GetNotImplementedDialogs\?/i);
        await testImplementationNavPoint(testBed, "#gn-implementationStatusItemsListNavButton", "#gn-implementationStatusObjectListItems", /\/api\/StyrApi\/GetNotImplementedItems\?/i);
        await testImplementationNavPoint(testBed, "#gn-implementationStatusSkillsListNavButton", "#gn-implementationStatusObjectListSkill", /\/api\/EvneApi\/GetNotImplementedSkills\?/i);
        await testImplementationNavPoint(testBed, "#gn-implementationStatusQuestsListNavButton", "#gn-implementationStatusObjectListQuest", /\/api\/AikaApi\/GetNotImplementedQuests\?/i);
        await testImplementationNavPoint(testBed, "#gn-implementationStatusMarkersListNavButton", "#gn-implementationStatusObjectListMarker", /\/api\/KartaApi\/GetNotImplementedMarkers\?/i);
        await testImplementationNavPoint(testBed, "#gn-implementationStatusNpcListNavButton", "#gn-implementationStatusObjectListNpc", null); // Response is cached, dont wait for response

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});