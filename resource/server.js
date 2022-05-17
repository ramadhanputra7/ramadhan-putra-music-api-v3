require('dotenv').config();
const path = require('path');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');

const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

const playlistSongs = require('./api/playlist_songs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlist_songs');

const Collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsServices');
const CollaborationsValidator = require('./validator/collaborations');

const playlistSongActivities = require('./api/playlist_song_activities');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/upload');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const albumLikes = require('./api/album_likes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');


const CacheService = require('./services/redis/CacheService');


const init = async () => {
  const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const playlistSongsService = new PlaylistSongsService();
    const playlistSongActivitiesService = new PlaylistSongActivitiesService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/covers'));
    const cacheService = new CacheService();
    const albumLikesService = new AlbumLikesService(cacheService);

    const server = Hapi.server({
      port: process.env.PORT,
      host: process.env.HOST,
      routes: {
          cors: {
              origin: ['*'],
          },
      },
  });

  //registrasi plugin externally

  await server.register([{
          plugin: Jwt,
      },
      {
          plugin: Inert,
      }
  ]);

  //mendeefinisikan strategy otentifikasi
  server.auth.strategy('openmusic_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
          aud: false,
          iss: false,
          sub: false,
          maxAgeSec: process.env.ACCESS_TOKEN_AGE
      },
      validate: (artifacts) => ({
          isValid: true,
          creedentials: {
              id: artifacts.decoded.payload.id,
          }
      })
  })
  await server.register([{
          plugin: songs,
          options: {
              service: songsService,
              validator: SongsValidator,
          },
      }, {
          plugin: albums,
          options: {
              service: albumsService,
              validator: AlbumsValidator,

          }
      },
      {
          plugin: users,
          options: {
              service: usersService,
              validator: UsersValidator,
          }
      },
      {
          plugin: playlists,
          options: {
              service: playlistsService,
              validator: PlaylistsValidator,
          }
      },
      {
          plugin: authentications,
          options: {
              authenticationsService,
              usersService,
              validator: AuthenticationsValidator,
              tokenManager: TokenManager,
          }
      },
      {
          plugin: Collaborations,
          options: {
              collaborationsService,
              validator: CollaborationsValidator,
              usersService,
              playlistsService,

          }
      },
      {
          plugin: playlistSongs,
          options: {
              playlistSongsService,
              songsService,
              playlistsService,
              validator: PlaylistSongsValidator,
          }
      },
      {
          plugin: _exports,
          options: {
              service: ProducerService,

              validator: ExportsValidator,
              playlistsService,
          }
      },
      {
          plugin: uploads,
          options: {
              service: storageService,
              validator: UploadsValidator,
              albumsService,
          }
      },
      {
          plugin: albumLikes,
          options: {
              service: albumLikesService,
              albumsService,
          }

      }

  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();