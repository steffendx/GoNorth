const assert = require("assert");
const uiTestBed = require("./../shared/uiTestBed");

describe("Task", function () {
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

    it("board should not throw errors", async function() {
        var testBed = this.test.testBed;
        
        await testBed.clickAndFollowLink("#gn-homeTileLinkTask");

        await testBed.checkElementExistsOnPage("#gn-taskBoardContainer");

        await testBed.clickElement("#gn-switchBoardButton");

        testBed.assertNoErrorsOccured();
    });

    it("manage board should not throw errors", async function() {
        var testBed = this.test.testBed;
        await testBed.navigateByUrl("/Task/ManageBoards");
        
        await testBed.checkElementExistsOnPage("#gn-taskManageBoardsContainer");

        await testBed.clickElement(".gn-taskBoardListTitle");
        await testBed.clickElement("#gn-taskManageBoardsNewBoardButton");
        await testBed.checkElementVisibleOnPage("#gn-taskManageBoardsNewBoardDialog");

        testBed.assertNoErrorsOccured();
    });

    it("manage task type should not throw errors", async function() {
        var testBed = this.test.testBed;
        await testBed.navigateByUrl("/Task/ManageTaskTypes");
        
        await testBed.checkElementExistsOnPage("#gn-taskManageTypesContainer");

        await testBed.clickElement(".gn-manageTaskTypeCreateTaskTypeButton");
        await testBed.checkElementVisibleOnPage(".modal");

        testBed.assertNoErrorsOccured();
    });

    afterEach(function () {
        if (this.currentTest.browser) {
            this.currentTest.browser.close();
        }
    });
});