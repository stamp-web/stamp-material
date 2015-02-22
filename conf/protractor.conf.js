exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../tests/e2e/**/*-spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:9001/stamp-web/material/index.html?webapp=stamp-webservices',

  seleniumAddress: 'http://localhost:4444/wd/hub',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    showColors: true
  }
};
