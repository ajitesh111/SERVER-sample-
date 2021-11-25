const mongoose = require('mongoose')

if(process.argv.length < 3) //argv is the command line arguments
{
  console.log('you need to enter the user password in the command line')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://ajitesh:${password}@cluster0.akddb.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', phonebookSchema)    //model is a constructor function enabling method calls for its objects

if(process.argv.length === 5)
{
  const person = new Person({ //object defined with the Person model constructor
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
    console.log('number saved!#!')
    mongoose.connection.close()
  })
}

if(process.argv.length === 3)
{
  Person.find({}).then(result => {    //{} signifies no filter
    result.forEach(person => {
      console.log(person)
    })

    mongoose.connection.close()
  })
}