const mongoose = require("mongoose")

// Define the Relay model schema
const RelaySchema = new mongoose.Schema({
  name: {
    type: String
  },
  type: {
    type: String
  },
  open: {
    type: Boolean,
    default: false
  },
  Id: {
    type: String
  },
  HID: {
    type: String
  },
  product: {
    type: String
  },
  serial: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model("Relay", RelaySchema);