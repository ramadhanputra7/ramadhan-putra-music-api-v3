const ClientError = require('../../exceptions/clientError');

class UsersHandler {
    constructor(service, validator) {
        const usersService = service;
        this._service = usersService;
        this._validator = validator;

        this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    }

    async postUserHandler({ payload }, h) {
        try {
            this._validator.validateUserPayload(payload);
            const userId = await this._service.addUser(payload);

            const response = h.response({
                status: 'success',
                message: 'User berhasil ditambahkan',
                data: { userId },
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
                message: 'Maaf terjadi kegagalan di server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getUserByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const user = await this._service.getUserById(id);

            return {
                status: 'success',
                data: { user },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            //  Server error
            const response = h.response({
                status: 'error',
                message: 'Maaf terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}
module.exports = UsersHandler;