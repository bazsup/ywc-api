export const emptyValidator = fields => (req, res, next) => {
  fields.forEach(field => {
    req.checkBody(field, `${field} can't be empty`).notEmpty()
  })

  fields.forEach(field => {
    req.sanitizeBody(field)
  })

  const errors = req.validationErrors()

  if (errors) {
    return next(new Error(errors[0].msg))
  }

  req.fields = fields
  return next()
}
