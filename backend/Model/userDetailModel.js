const mongoose = require("mongoose");

const userDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credential",
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{5,6}$/
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"]
  },
  profileImage:{
    type:String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("UserDetail", userDetailSchema);