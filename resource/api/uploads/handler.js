const ClientError = require('../../exceptions/clientError');

class UploadsHandler {
    constructor(service, validator) {
        const { storageService, albumsService } = service;
        this._service = storageService;
        this._albumsService = albumsService;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h) {
        try {
            const { cover } = request.payload;
            const { id } = request.params;

            this._validator.validateImageHeaders(cover.hapi.headers);

            const filename = await this._service.writeFile(cover, cover.hapi);
            //  REVIEW (Sudah diedit)
            //  Penggunaan env untuk response client, perlu dihindari. Hal ini
            //  akan menimbulkan masalah ketika aplikasi dideploy dengan menggunakan
            //  apache/nginx sebagai proxy. Akibatnya fileLocation tidak lagi 127.0.0.1:5000,
            //  tetapi menyesuaikan url yang diketikkan oleh user. Berikut adalah format yang
            //  lebih baik
            //  const fileLocation = `${request.headers['x-forwarded-proto'] || request.server.info.protocol}://${request.info.host}/upload/images/${filename}`
            const filelocation = `${request.headers['x-forwarded-proto'] || request.server.info.protocol}://${request.info.host}/upload/images/${filename}`;
            await this._albumsService.addCoverValueById(id, filelocation);
            const response = h.response({
                status: 'success',
                message: `File telah disimpan, dengan alamat ${filelocation}`,
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

            // Server error
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

module.exports = UploadsHandler;