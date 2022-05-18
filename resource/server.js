require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

//  Song
const songs = require('./api/songs');
const SongsService = require('./service/postgres/songsService');
const SongsValidator = require('./validator/songs');
//  Album
const AlbumService = require('./service/postgres/albumService');
const AlbumValidator = require('./validator/albums');
const albums = require('./api/albums');
//  Users
const users = require('./api/users');
const UsersService = require('./service/postgres/usersService');
const UsersValidator = require('./validator/users');
//  Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/authenticationsService');
const TokenManager = require('./tokenize/tokenManager');
const AuthenticationsValidator = require('./validator/authentications');
//  Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/collaborationsServices');
const CollaborationsValidator = require('./validator/collaborations');
//  Playlist
const playlists = require('./api/playlists');
const PlaylistService = require('./service/postgres/playlistsService');
const PlaylistValidator = require('./validator/playlists');
//  Playlist Song
const playlistSongs = require('./api/playlist_songs');
const PlaylistSongsService = require('./service/postgres/playlistSongsService');
const PlaylistSongsValidator = require('./validator/playlist_songs');
//  Playlist Song Activities
const playlistSongsActivities = require('./api/playlist_song_activities');
const PlaylistSongsActivitiesService = require('./service/postgres/playlistSongActivitiesService');
//  Exports
const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitmq/producerService');
const ExportsValidator = require('./validator/exports');
//  Uploads
const uploads = require('./api/uploads');
const StorageService = require('./service/storage/storageService');
const UploadsValidator = require('./validator/uploads');
//  AlbumsLikes
const albumLikes = require('./api/album_likes');
const AlbumsLikesService = require('./service/postgres/albumLikesService');
//  Cache
const CacheService = require('./service/redis/cacheService');

const init = async () => {
    const songsService = new SongsService();
    const albumsService = new AlbumService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistService(collaborationsService);
    const playlistSongsService = new PlaylistSongsService();
    const playlistSongsActivitiesService = new PlaylistSongsActivitiesService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
    const cacheService = new CacheService();
    const albumsLikesService = new AlbumsLikesService(cacheService);

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });
        // registrasi plugin eksternal
        //  REVIEW
        // Di sini (sebelum registrasi plugin eksternal) kamu bisa membua
        //  extentions function untuk life cycle server onPreResponse,
        //  yang akan mengintervensi response sebelum dikirimkan ke client.
        //  Hal ini bisa dimanfaatkan untuk menerapkan penanganan error bila response
        //  tersebut merupakan client error.

    //  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    //     const {
    //         response
    //     } = request;

    //     if (response instanceof ClientError) {
    //         // membuat response baru dari response toolkit sesuai kebutuhan error handling
    //         const newResponse = h.response({
    //             status: 'fail',
    //             message: response.message,
    //         });
    //         newResponse.code(response.statusCode);
    //         return newResponse;
    //     }

    //     // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    //     return response.continue || response;
    // });
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    // Define strategy authentication jwt
    server.auth.strategy('openmusicapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: {
                    albumsService,
                    songsService,
                },
                validator: AlbumValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                service: {
                    collaborationsService,
                    playlistsService,
                    usersService,
                },
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistValidator,
            },
        },
        {
            plugin: playlistSongs,
            options: {
                service: {
                    playlistSongsService,
                    playlistsService,
                    songsService,
                    playlistSongsActivitiesService,
                },
                validator: PlaylistSongsValidator,
            },
        },
        {
            plugin: playlistSongsActivities,
            options: {
                service: {
                    playlistSongsActivitiesService,
                    playlistsService,
                },
            },
        },
        {
            plugin: _exports,
            options: {
                service: {
                    ProducerService,
                    playlistsService,
                },
                validator: ExportsValidator,
            },
        },
        {
            plugin: uploads,
            options: {
                service: {
                    storageService,
                    albumsService,
                },
                validator: UploadsValidator,
            },
        },
        {
            plugin: albumLikes,
            options: {
                service: {
                    albumsLikesService,
                    albumsService,
                },
            },
        },
    ]);

    await server.start();
    console.log(`Server has been run on ${server.info.uri}`);
};

init();