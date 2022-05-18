const InvariantError = require('../../exceptions/invariantError');
const { playlistPayloadSchema } = require('./schema');

const playlistValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = playlistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = playlistValidator;