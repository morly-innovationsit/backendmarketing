const mongoose = require('mongoose');
const AddNewSchema = new mongoose.Schema({

  company: {
    type: String,
    // required: true
  },
    software: {
    type: String,
  },
  softwarename: {
    type: String,
  },
    satisfied: {
    type: String,
    // required: true
  },
  plansfornew: {
    type: String,
    // required: true
  },
  comments: {
    type: String,
    // required: true
  },
  fleetstrength: {
    type: Number,
    // required: true
  },
    website: {
    type: String,
    // required: true
  },
  email: {
    type: String,
    // required: true
  },
    contact1name: {
    type: String,
    // required: true
  },
  designation1: {
    type: String,
    // required: true
  },
    GSM1: {
    type: String,
    // required: true
  },
  email1: {
    type: String,
    // required: true
  },
     contact2name: {
    type: String,
    // required: true
  },
  designation2: {
    type: String,
    // required: true
  },
    GSM2: {
    type: String,
    // required: true
  },
  email2: {
    type: String,
    // required: true
  },
   socialmedia1: {
    type: String,
    // required: true
  },
    socialmedia2: {
    type: String,
    // required: true
  },
    socialmedia3: {
    type: String,
    // required: true
  },
    socialmedia4: {
    type: String,
    // required: true
  },
  lat :{
   type: Number
  },
   long: { 
    type: Number,
    //  required: true 
    },
    notes: {
    type: String,
    // required: true
  },
  boardpic: {
    data: Buffer,
    contentType: String,
  },
// Define the schema properly with subdocument structure
image: [{
  data: { type: Buffer, required: false },
  contentType: { type: String, required: false },
  type: { type: String, required: false },  // "one", "two", etc.
  filename: { type: String, required: false }
}]

}, { collection: 'AddNew' } )
module.exports = mongoose.model("AddNew", AddNewSchema);