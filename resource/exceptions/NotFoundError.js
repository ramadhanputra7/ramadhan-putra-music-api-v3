const clientError = require('./clientError');

class NotFoundError extends clientError {
    constructor(message) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

module.exports = NotFoundError;