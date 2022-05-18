const Joi = require('joi');

const ExportPlaylistsSongPayloadSchema = Joi.object({
    targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportPlaylistsSongPayloadSchema;