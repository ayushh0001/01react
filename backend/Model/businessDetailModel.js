const mongoose = require("mongoose");

const businessDetailSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential',
    required: true
  },
  fullName: String,
  displayName: String,
  description:String,
  pincode: String,
  gstNumber: String,
  panNumber: String,
  verified: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
});


const businessmodels = mongoose.model("BusinessDetail", businessDetailSchema)

module.exports = businessmodels