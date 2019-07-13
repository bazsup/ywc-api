const mongoose = require('mongoose')

const { Schema } = mongoose

const answerSchema = new Schema({
  answer: String,
  point: { type: Number, select: false, default: 0 },
})

const schema = new Schema({
  confirmedMajor: {
    type: String,
    enum: ['content', 'programming', 'design', 'marketing'],
  },
  generalQuestions: [answerSchema],
  majorQuestions: [answerSchema],

})

export default mongoose.model('Question', schema)
