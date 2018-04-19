const ExtendableError = require('es6-error');

class NotFoundError extends ExtendableError {
    /**
     * @param {string} message
     * @param {string} filePath
     */
    constructor(message, filePath) {
        super(message);

        this.msg = message;
        this.filePath = filePath;
    }
}

class ConflictError extends ExtendableError {
    /**
     * @param {string} message
     */
    constructor(message) {
        super(message);

        this.message = message;
    }
}

/**
 * https://developer.github.com/v3/pulls/#list-commits-on-a-pull-request
 */
class ManyCommitsError extends ExtendableError {
    /**
     * @param {string} message
     */
    constructor(message) {
        super(message);

        this.message = message;
    }
}

module.exports = {
    NotFoundError,
    ManyCommitsError,
    ConflictError
};
