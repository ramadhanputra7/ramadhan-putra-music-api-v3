const { collaborationPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

const collaborationsValidator = {
    validateCollaborationPayload: (payload) => {
        const validationResult = collaborationPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = collaborationsValidator;