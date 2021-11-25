const mongoose = require('mongoose')

const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to mongoDB')
  })
  .catch((error) => {
    console.log('error establishing connection to MongoDB:', error.message)
  })

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true    //uniqueValidator will work on this attribute
  },
  number: {
    type: String,
    minLength: 8,
    required: true
  }
})
//checks if the fields with unique: true is unique
phonebookSchema.plugin(uniqueValidator)

//by Default validator does not run on updates in mongoose
//pre is a middleware that changes how 'findOneAndUpdate' functions
//findByIdAndUpdate calls findOneAndUpdate
phonebookSchema.pre('findOneAndUpdate', function(next) {
  this.options.runValidators = true
  next()
})

phonebookSchema.set('toJSON', { //all instances of models produced with this schema will be modified, response.json callbacks to this function (probably)
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', phonebookSchema)