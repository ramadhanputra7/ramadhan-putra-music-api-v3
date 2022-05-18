const clientError = require('./clientError');

class AuthorizationError extends clientError {
    constructor(message) {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

module.exports = AuthorizationError;