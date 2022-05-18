const InvariantError = require('../../exceptions/invariantError');
const { playlistSongsPayloadSchema } = require('./schema');

const playlistSongsValidator = {
    validatePlaylistSongsPayload: (payload) => {
        const validationResult = playlistSongsPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = playlistSongsValidator;