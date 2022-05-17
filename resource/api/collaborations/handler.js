class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
      this._collaborationsService = collaborationsService;
      this._playlistsService = playlistsService;
      this._validator = validator;
  
      this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
      this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
    }
  
    async postCollaborationHandler(request, h) {
      this._validator.validateCollaborationPayload(request.payload);
  
      const { id: credentialId } = request.auth.credentials;
      const { playlist_id,user_id } = request.payload;
  
      await this._playlistsService.verifyPlaylistOwner(playlist_id, credentialId);
      const collaborationId = await this._collaborationsService.addCollaboration(playlist_id, user_id);
  
      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId
        }
      });
  
      response.code(201);
      return response;
    }
  
    async deleteCollaborationHandler(request, ) {
      this._validator.validateCollaborationPayload(request.payload);
  
      const { id: credentialId } = request.auth.credentials;
      const { playlist_id,user_id } = request.payload;
  
      await this._playlistsService.verifyPlaylistOwner(playlist_id, credentialId);
      await this._collaborationsService.deleteCollaboration(playlist_id, user_id);
  
      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus'
      };
    }
  }
  
  module.exports = CollaborationsHandler;