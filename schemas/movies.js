// Permite hacer todas las validaciones de los tipos de datos que tenemos
const z = require('zod')

// Se crea un movie esquema
const movieSchema = z.object({
    title: z.string({
      invalid_type_error: 'Movie title must be a string',
      required_error: 'Movie title is required.'
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
      message: 'Poster must be a valid URL'
    }),
    genre: z.array(
      z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
      {
        required_error: 'Movie genre is required.',
        invalid_type_error: 'Movie genre must be an array of enum Genre'
      }
    )
})

// Se crea una función donde se le pasa el object
function validateMovie (object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}