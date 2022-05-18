const Joi = require('joi');

const playlistSongsPayloadSchema = Joi.object({
    songId: Joi.string().required(),
});

module.exports = { playlistSongsPayloadSchema };