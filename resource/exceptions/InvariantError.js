const clientError = require('./clientError');

class InvariantError extends clientError {
    constructor(message) {
        super(message);
        this.name = 'InvariantError';
    }
}

module.exports = InvariantError;