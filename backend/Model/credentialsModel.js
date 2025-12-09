  const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');


const credentialSchema = new mongoose.Schema({
    email: {
      type:String,
      required:true,
      unique:true
    },
  username: {
    type:String,
    required:true,
    trim:true //trim remove white space from begining and the end of string
  },
  yourname:{
    type:String,
    required:true,
    trim:true
  },
  mobile: {
    type:String,
    required:true,
  },
  address:{
    type:String,
    // required:true
  },
  role:{
    type:String,
    required:true
  },
  password: {
    type:String,
    required:true,
  }, // Store hashed passwords!

  createdAt: { type: Date, default: Date.now }

})


// Hash password before saving
credentialSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password during login
credentialSchema.methods.comparePassword =  function (candidatePassword) {
  return  bcrypt.compare(candidatePassword, this.password);
};






const credentialmodels = mongoose.model("Credential",credentialSchema)


module.exports = credentialmodels