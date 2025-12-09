const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  slug: { type: String, required: true, unique: true },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
