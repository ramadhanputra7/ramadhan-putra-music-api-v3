const InvariantError = require('../../exceptions/invariantError');
const ExportPlaylistsSongPayloadSchema = require('./schema');

const ExportsValidator = {
    validateExportPlaylistsSongPayload: (payload) => {
        const validationResult = ExportPlaylistsSongPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = ExportsValidator;