import mongoose from "mongoose"

const {Schema} = mongoose
const {ObjectId} = Schema.Types

const schema = new Schema({
  facebook: String,
  status: {
    type: String,
    enum: ["in progress", "completed"],
  },
  questions: {type: ObjectId, ref: "Question"},
  completed_at: Date,

  // Step 1: user information
  title: {
    type: String,
    enum: ["นาย", "นางสาว"],
  },
  firstName: String,
  lastName: String,
  firstNameEN: String,
  lastNameEN: String,
  nickname: String,
  faculty: String,
  department: String,
  academicYear: {
    type: String,
    enum: [
      "ปี 1",
      "ปี 2",
      "ปี 3",
      "ปี 4",
      "ปี 5",
      "ปี 6",
      "ปวส. ปี 1",
      "ปวส. ปี 2",
    ],
  },
  university: String,
  sex: {
    type: String,
    enum: ["ชาย", "หญิง"],
  },
  birthdate: Date,
  religion: {
    type: String,
    enum: ["พุทธ", "คริสต์", "อิสลาม", "พราหมณ์", "สิกข์", "ไม่ระบุ"],
  },
  blood: {
    type: String,
    enum: ["A", "B", "O", "AB"],
  },
  age: Number,

  // Step 2: contact information
  address: String,
  province: String,
  postalCode: String,
  email: String,
  phone: String,
  emergencyPhone: String,
  emergencyPhoneRelated: String,
  emergencyName: String,
  shirtSize: String,
  food: String,
  disease: String,
  med: String,
  foodAllergy: String,
  medAllergy: String,
  otherContact: String,
  // Step 3: ywc insight
  knowCamp: [String],
  activities: String,

  major: {
    type: String,
    enum: ["content", "programming", "design", "marketing"],
  },

  // grading system
  isPassStaff: Boolean,
  staffComment: String,

  // reference to admin model (store comiitee object id)
  committeeVote: [ObjectId],
  committeeComment: String,

  // is user pass to interview
  passInterview: Boolean,
})

export default mongoose.model("User", schema)
