const mongoose = require("mongoose");
const {Schema} = mongoose;

const schema = new Schema({
  __v: {type: Number, select: false},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true, select: false},
  major: {
    type: String,
    enum: ["content", "programming", "design", "marketing"],
  },
  role: {
    type: String,
    required: true,
    enum: ["staff", "committee", "admin", "manager"],
  },
});

export default mongoose.model("Admin", schema);
