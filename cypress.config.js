const { defineConfig } = require("cypress");
require("dotenv").config();

module.exports = defineConfig({
  e2e: {
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    requestTimeout: 15000,
    responseTimeout: 30000,

    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "reports/mochawesome",
      overwrite: false,
      html: true,
      json: true
    },

    env: {
      apiBaseUrl: process.env.BASE_URL,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      serviceId: process.env.SERVICE_ID
    }
  }
});