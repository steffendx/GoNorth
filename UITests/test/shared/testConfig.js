/**
 * Test Config
 */
class testConfig {
    /**
     * Constructor
     * @param {string} loginName Login Name to use, null to read from environment
     * @param {string} password Password to use, null to read from environment
     */
    constructor(loginName, password) {
        this.testBaseUrl = process.env.TEST_BASE_URL;
        this.loginName = loginName ? loginName : process.env.TEST_LOGINNAME;
        this.password = password ? password : process.env.TEST_PASSWORD;

        if(this.testBaseUrl) {
            this.testBaseUrl = this.testBaseUrl.trim();
        }
        
        if(this.loginName) {
            this.loginName = this.loginName.trim();
        }

        if(this.password) {
            this.password = this.password.trim();
        }
    }
}

module.exports = testConfig;