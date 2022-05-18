const InvariantError = require('../../exceptions/invariantError');
const {
    songPayloadSchema,
} = require('./schema');

const songValidator = {
    validateSongPayload: (payload) => {
        const validationResult = songPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = songValidator;