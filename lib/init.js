const assert = require('assert');

const factory = require('./factory');

// eslint-disable-next-line valid-jsdoc
/**
 * @param {object} github
 * @param {Function} github.getRepoContent - method implementation https://developer.github.com/v3/repos/contents/#get-contents
 * @param {Function} github.getCommitsFromPr - method implementation https://developer.github.com/v3/pulls/#list-commits-on-a-pull-request
 */
module.exports = (github) => {
    assert(github.getRepoContent, 'getRepoContent function must be implemented');
    assert(github.getCommitsFromPr, 'getCommitsFromPr function must be implemented');

    return factory(github).getRecentFile;
};
