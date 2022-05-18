const albums = ({
    id, name, year, cover,
}) => ({
    id,
    name,
    year,
    coverUrl: cover,
});

const albumsSongs = ({
    id,
    name,
    year,
    cover,
    songs,
}) => ({
    id,
    name,
    year,
    coverUrl: cover,
    songs,
});

module.exports = { albums, albumsSongs };