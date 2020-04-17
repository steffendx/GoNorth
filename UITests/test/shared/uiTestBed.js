const puppeteer = require("puppeteer");
const testConfig = require("./testConfig");
const assert = require("assert");
const sleep = require("./sleep");

/**
 * Class to provide a UI Test bed
 */
class uiTestBed {

    /**
     * Constructor
     * 
     * @param {testConfig} config Test config
     * @param {boolean} runHeadless True if the test must be run headless, should always the case. Should only be used for debug purposes
     */
    constructor(config, runHeadless) {
        this.config = config;
        if(!this.config) {
            this.config = new testConfig();
        }

        this.runHeadless = runHeadless === false ? false : true;

        this.errorsOnPage = [];

        this.additionalPages = [];
        this.onPopupCallback = null;
    }

    /**
     * Returns a readable error for a js handle
     * @param {object} jsHandle JS Handle
     * @returns {string} Described jS Handle
     */
    describeJsHandle(jsHandle) {
        return jsHandle.executionContext().evaluate(obj => {
            if (typeof obj == "string") {
                return obj;
            }

            try {
                return JSON.stringify(obj);
            }
            catch (e) {
                return obj.toString();
            }

        }, jsHandle);
    }

    /**
     * Registers the callbacks on page
     * @param {object} page Page to register
     */
    registerCallbacksOnPage(page) {
        page.on("pageerror", (err) => {
            this.errorsOnPage.push({
                errorMessage: err.toString()
            });
        });
        
        page.on("error", (err) => {
            this.errorsOnPage.push({
                errorMessage: err.toString()
            });
        });

        page.on("popup", (newPage) => {
            this.additionalPages.push(newPage);
            if(this.onPopupCallback) {
                this.onPopupCallback(newPage);
            }
        });

        page.on("console", async (msg) => {
            if (msg.type() == "error") {
                const args = await Promise.all(msg.args().map(arg => this.describeJsHandle(arg)));
                this.errorsOnPage.push({
                    text: msg.text(),
                    args: args
                });
            }
        });
    }

    /**
     * Asserts that no errors occured
     */
    assertNoErrorsOccured() {
        if (this.errorsOnPage.length > 0) {
            var errorMessage = this.errorsOnPage.map((e) => {
                if(e.errorMessage) {
                    return e.errorMessage;
                }

                var textMessage = e.text;
                if (textMessage == "JSHandle@error") {
                    textMessage = "ERROR;";
                }

                textMessage += e.args;
                return textMessage;
            }).join(";   \\r\\n");

            assert.fail("Errors were logged: " + errorMessage);
        }
    }

    /**
     * Runs the login
     * @param {object} browser Browser
     * @param {object} page Page
     * @returns {Promise} Promise that will be resolved as soon as the user is logged in
     */
    async login(browser, page) {
        this.registerCallbacksOnPage(page);

        // Required to prevent race conditions
        await this.runCodeWithRetry(() => { return page.goto(this.config.testBaseUrl, { waitUntil: 'networkidle0', timeout: 10000 }) });

        await page.waitForSelector("#Email");
        await page.type("#Email", this.config.loginName);
        await page.waitForSelector("#Password");
        await page.type("#Password", this.config.password);
        await Promise.all([
            page.click("button[type='submit']"),
            this.runCodeWithRetry(() => { return page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }) })
        ]);
        
        var couldNotLogin = false;
        try {
            couldNotLogin = !!(await this.getElementText(".validation-summary-errors"));
        }
        catch (e) {
        }

        if(couldNotLogin) {
            assert.fail("Could not login");
        }
    }

    /**
     * Inits a UI Test and logins the user
     * @param {object} testContext Test context
     * @returns {Promise} Promise that will be resolved as soon as the user is logged in
     */
    async initAndLoginUITest(testContext) {
        var browser = await puppeteer.launch({ headless: this.runHeadless, args: ["--incognito"] });
        if(testContext.test) {
            testContext.test.browser = browser;
        }
        if(testContext.currentTest) {
            testContext.currentTest.browser = browser;
        }
        var [page] = await browser.pages();

        this.page = page;
        await this.login(browser, page);

        return {
            page: page,
            browser: browser
        }
    }

    /**
     * Checks if an element exists on a page and throws an exception if not
     * @param {string} selector Selector to search the element 
     */
    async doesElementExistOnPage(selector) {
        try {
            await sleep(400);
            return !!(await this.page.$(selector));
        }
        catch (e) {
        }
        
        return false;
    }

    /**
     * Checks if an element exists on a page and throws an exception if not
     * @param {string} selector Selector to search the element 
     */
    async checkElementExistsOnPage(selector) {
        await sleep(400);
        var foundElement = await this.doesElementExistOnPage(selector);
        if(!foundElement) {
            assert.fail("Could not find element " + selector);
        }
    }
    
    /**
     * Checks if an element exists on a page and throws an exception if not
     * @param {string} selector Selector to search the element 
     */
    async checkElementVisibleOnPage(selector) {
        try
        {
            await sleep(400);
            await this.page.waitForSelector(selector, {
                visible: true,
                timeout: 600
            });
        }
        catch(e)
        {
            assert.fail("Element with selector " + selector + " could not be found as visible on page");
        }
    }

    /**
     * Checks if an element is hidden on a page and throws an exception if not
     * @param {string} selector Selector to search the element 
     */
    async checkElementHiddenOnPage(selector) {
        try
        {
            await sleep(400);
            await this.page.waitForSelector(selector, {
                visible: false,
                timeout: 600
            });
        }
        catch(e)
        {
            assert.fail("Element with selector " + selector + " was not hidden on page");
        }
    }
    
    /**
     * Returns the text of an element, if the element is not found an exception is thrown
     * @param {string} selector Selector to search the element 
     */
    async getElementText(selector) {
        try {
            await sleep(400);
            const foundElement = await this.page.$(selector);
            return await this.page.evaluate(foundElement => foundElement.textContent, foundElement);
        }
        catch (e) {
            assert.fail("Could not read text of element " + selector);
        }
    }

    /**
     * Navigates by url
     * @param {string} serverRelativeUrl Server relative url 
     */
    async navigateByUrl(serverRelativeUrl) {
        var targetUrl = this.config.testBaseUrl;
        if(targetUrl[targetUrl.length - 1] != "/") {
            targetUrl += "/";
        } 
        if(serverRelativeUrl[0] == "/") {
            serverRelativeUrl = serverRelativeUrl.substr(1);
        }
        targetUrl += serverRelativeUrl;

        await this.runCodeWithRetry(() => { return this.page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 10000 }) });
        await sleep(400);
    }

    /**
     * Clicks an element
     * @param {string} selector Selector
     */
    async clickElement(selector) {
        await sleep(400);
        await this.page.click(selector);
    }

    /**
     * Clicks and follows a link
     * @param {string} selector Selector for the link 
     */
    async clickAndFollowLink(selector) {
        await sleep(400);
        await Promise.all([
            this.page.click(selector),
            this.runCodeWithRetry(() => { return this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }) })
        ]);
    }

    /**
     * Clicks and follows a link that opens a popup and changes the context to the new page
     * @param {string} selector Selector for the link 
     */
    clickAndFollowLinkWithPopup(selector) {
        return new Promise((resolve, reject) => {
            this.onPopupCallback = async (page) => {
                this.onPopupCallback = null;

                this.page = page;
                await this.runCodeWithRetry(() => { return this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }) });
                await sleep(400);
                resolve();
            };

            this.page.click(selector);
        });
    }

    /**
     * Waits for a resposne
     * @param {string} urlMatch url match
     */
    async waitForResponse(urlMatch) {
        await this.page.waitForResponse(res => { return res.url().match(urlMatch); });
    }

    /**
     * Checks if an element is disabled
     * @param {string} selector Selector to check
     * @returns {boolean} true if the element is disabled, else false
     */
    async isElementDisabled(selector) {
        try {
            await sleep(400);
            const foundElement = await this.page.$(selector + "[disabled]");
            return foundElement != null;
        } catch(e) {
            assert.fail("Could not read disable state of element " + selector);
        }
    }

    /**
     * Runs a code block with a retry
     * @param {function} codeCallback Codecallback 
     */
    async runCodeWithRetry(codeCallback) {
        try
        {
            await codeCallback();
        }
        catch(e)
        {
            try
            {
                await codeCallback();
            }
            catch(e)
            {
            }
        }
    }
};

module.exports = uiTestBed;