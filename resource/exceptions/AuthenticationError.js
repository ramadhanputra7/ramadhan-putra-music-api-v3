const clientError = require('./clientError');

class AuthenticationError extends clientError {
    constructor(message) {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

module.exports = AuthenticationError;