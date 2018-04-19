const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
const sinon = require('sinon');

chai.use(chaiAsPromised);

const assert = chai.assert;

sinon.assert.expose(assert, { prefix: '' });

module.exports = {
    assert,
    sinon
};
