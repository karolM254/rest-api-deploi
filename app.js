// Creación del primer servidor 
const express = require('express') // utilizamos require por que estamos utilizando commonJS

// permite crear id unicos, por medio de la biblioteca nativa de node.js
const crypto = require('node:crypto')

const cors = require('cors')

// importar el movies.json
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

// Creamos nuestro express
const app = express()

// middleware para poder acceder al request body
app.use(express.json())

app.use(cors({
    origin: (origin, callback) => {
        // Tener una lista que acepte origins, ya que si no se tiene la lista el acepta todo
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev'
      ]
  
      // si esto incluye el origen se acepta
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
  
      // Si no tiene le origen también se acepta
      if (!origin) {
        return callback(null, true)
      }
  
      // Si no hay un error
      return callback(new Error('Not allowed by CORS'))
    }
}))

app.disable('x-powered-by') // dehabilitar el header x-Powered-By: Express, esta es una cabecera que cuando se hace una petición a esta API aparece

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

// Todos los recursos que sean MOVIES  se identifican cono /movies
// Recuperar todas las peliculas
app.get('/movies', (req, res) => {
    const { genre } = req.query
    if (genre) {
        // Si se tiene el género, se filtra por el género
        const filteredMovies = movies.filter(
            // el .some transforma los géneros que tiene la pelicula a minuscula y por lo tanto en el api se le puede pasar todo en mayuscula o minuscula
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

//Recuperar un pelicula 
app.get('/movies/:id', (req, res) => { // path-to-regexp
    const { id } = req.params
    // recueparar la pelicula
    const movie = movies.find(movie => movie.id === id)
    // si se tiene la pelicula se devuelve el json(movie)
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
})

// Crear el POST 
app.post('/movies', (req, res) => {
    // El resultado se obtine de valirdar request.body
    const result = validateMovie(req.body)

    // Si el resultado a tenido un error
    if (!result.success) {
        // devuelve res.status(400)
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    // crear un nuevo objeto
    const newMovie = {
        id: crypto.randomUUID(), // esto te crea (uuid v4) un nuevo id version 4 
        // Aqui se tiene todos los datos que hemos validado
        ...result.data
    }

    // Esto nos seria REST, porque estamos guardando el estado de la aplicación en memoria
    movies.push(newMovie)

    // le indicamos que se a creado el recurso
    res.status(201).json(newMovie) // actualizar la caché del cliente 
})

//Borar
app.delete('movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    movies.splice(movieIndex, 1)
  
    return res.json({ message: 'Movie deleted' })
})

// Actualizar una película
app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message)})
    }

    //Se recupera el id
    const { id } = req.params
    //Buscar la película 
    const movieIndex = movies.findIndex(movie => movie.id === id)

    //Si no encontramos la película
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not fund' })
    }

    // Actualizar la película
    const updateMovie = {
        //Todo lo que se tiene en movieIndex
        ...movies[movieIndex],
        ...result.data
    }

    //Guardar la película en el índice
    movies[movieIndex] = updateMovie

    // Se devuelve el json de la película
    return res.json(updateMovie)
})

//Vamos a escuchar en el puerto que sea el process.env.PORT o si no por defecto se le coloca 1234 o el que se quiera
const PORT = process.env.PORT ?? 1234

//Vamos a escuchar que nuestra aplicación escuche en este puerto
app.listen(PORT, () => {
    //Se le coloca el mensaje
    console.log(`server listening on port http://localhost:${PORT}`)
})