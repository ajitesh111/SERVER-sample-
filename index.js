const express = require('express')
const { response } = require('express')
const app = express()

const cors = require('cors')  //required to allow requests with other origin
app.use(cors())

app.use(express.json()) //converts json to js object (used in 'post')
const morgan = require('morgan')

morgan.token('postBody', (request,response) => {
  if(request.method === 'POST')
    return JSON.stringify(request.body)
})

// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :response-time[3] :postBody'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendick",
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request,response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request,response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if(person)
    response.json(person)
  else
    response.status(404).end()
})

app.get('/info', (request, response) => {
    response.send(`<div>Phonebook has info for ${persons.length}</div> <br> ${new Date()}`)
})

app.delete('/api/persons/:id', (request,response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request,response) => {
  const body = request.body

  if(!body.name || !body.number)
  {
    return response.status(400).json({
      error: 'content-missing'
    })
  }

  if(persons.find(person => person.name === body.name))
  {
    return response.status(409).json({
      error: `a record with name ${body.name} already exists in the phonebook`
    })
  }

  const newPerson = {
    id: Math.floor(Math.random()*1000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

const PORT = process.env.PORT || 3001 //env is used for heroku
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})