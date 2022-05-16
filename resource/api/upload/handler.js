const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError').default;

class UploadsHandler {
    constructor(service, validator) {
        const { storageService, albumsService } = service;
        this._service = storageService;
        this._albumsService = albumsService;
        this._validator = validator;
        autoBind(this);
    }

    async postUploadImageHandler(request, h) {
        try {
            const { cover } = request.payload;
            const { id } = request.params;
            this._validator.validateImageHeaders(cover.hapi.headers);
            const filename = await this._service.writeFile(cover, cover.hapi);
            const fileloc = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
            await this._albumsService.addCoverValueById(id, fileloc);
            const response = h.response({
                status: 'success',
                message: `File gambar telah disimpan dengan nama ${fileloc}`,
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

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server Kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = UploadsHandler;