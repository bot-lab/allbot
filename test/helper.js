const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index_test.js');
const should = chai.should();

chai.use(chaiHttp);
global.chai = chai;  
global.app = app;
global.sessionKeys = {};
global.userIdentifiers = {};
global.responses = {};
global.downloadFilePath = "./test/downloads/";