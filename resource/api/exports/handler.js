const ClientError = require('../../exceptions/clientError');

class ExportsHandler {
    constructor(service, validator) {
        const { ProducerService, playlistsService } = service;
        this._service = ProducerService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylistsSongHandler = this.postExportPlaylistsSongHandler.bind(this);
    }

    async postExportPlaylistsSongHandler(request, h) {
        try {
            this._validator.validateExportPlaylistsSongPayload(request.payload);

            const message = {
                userId: request.auth.credentials.id,
                targetEmail: request.payload.targetEmail,
                playlistId: request.params.id,
            };
            await this._playlistsService.verifyPlaylistAccess(message.playlistId, message.userId);
            await this._playlistsService.getPlaylistsById(message.playlistId);
            await this._service.sendMessage('export:playlistsSong', JSON.stringify(message));

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda dalam antrian',
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server error!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = ExportsHandler;