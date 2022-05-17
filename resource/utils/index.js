const mapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    album_id
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    album_id
});

const mapDBToAlbumsModel = ({
    id,
    name,
    year,
    coverUrl,
}) => ({
    id,
    name,
    year,
    coverUrl,
})

module.exports = { mapDBToModel, mapDBToAlbumsModel };