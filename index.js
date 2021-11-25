//All middleware in express need to either return(end the route) OR next()(to continue on the next middleware)
require('dotenv').config()  //defines environment variables in root '.env' file
const express = require('express')
const { response } = require('express')
const app = express()
const Person = require('./models/person') //importing the module constructor

const cors = require('cors')  //required to allow requests with other origin
app.use(cors())

app.use(express.static('build'))  //first checks and renders if a file is present in build directory

app.use(express.json()) //converts json to js object, adds body attribute to 'request' (used in 'post',etc.)

const morgan = require('morgan')
morgan.token('postBody', (request,response) => {
  if(request.method === 'POST')
    return JSON.stringify(request.body)
})

// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :response-time[3] :postBody'))

// let persons = [
//     {
//       "id": 1,
//       "name": "Arto Hellas",
//       "number": "040-123456"
//     },
//     {
//       "id": 2,
//       "name": "Ada Lovelace",
//       "number": "39-44-5323523"
//     },
//     {
//       "id": 3,
//       "name": "Dan Abramov",
//       "number": "12-43-234345"
//     },
//     {
//       "id": 4,
//       "name": "Mary Poppendick",
//       "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons', (request,response) => {
  Person.find({}) //no filter, returns all objects
    .then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request,response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person)
        response.json(person)
      else
        response.status(404).end()
    })
    .catch(error => next(error))  //send error to the error handling middlewware

  // if(person)
  //   response.json(person)
  // else
  //   response.status(404).end()
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`<div>Phonebook has info for ${persons.length}</div> <br> ${new Date()}`)
  })
  // response.send(`<div>Phonebook has info for ${persons.length}</div> <br> ${new Date()}`)
})

app.delete('/api/persons/:id', (request,response,next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      if(result)
        response.status(200).end()
      else
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request,response,next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new:true }) //'new' is required otherwise non modified 'person' will be used
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request,response,next) => {
  const body = request.body

  //conditions are defined in the schema definition in person.js
  // if(!body.name || !body.number)
  // {
  //   return response.status(400).json({
  //     error: 'content-missing'
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })
  // const newPerson = {
  //   id: Math.floor(Math.random()*1000),
  //   name: body.name,
  //   number: body.number
  // }

  person.save()
    .then(savedPerson => { //schema constraints are checked here (if name already added)
      response.json(savedPerson)
    })
    .catch(error => next(error))

  // persons = persons.concat(newPerson)
  // response.json(newPerson)
})

//any functions with 4 parameters are error handlers in express
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError')
    return response.status(400).send({ error: 'malformatted id' })
  else if(error.name === 'ValidationError')
    return response.status(403).send(error.message)

  next(error) //forwards unhandled errors to the default error handler of express
}
//must be the last middleware to be loaded
app.use(errorHandler)

const PORT = process.env.PORT // dotenv for local
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})