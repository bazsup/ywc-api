export const respondErrors = (res) => (err, code) => {
  console.error("response error:", err)
  res.status(code || err.code || 500).send({
    message: err || "Internal Server Error",
  })
}

export const respondResult = (res) => (result) => res.status(200).send(result)

export const respondSuccess = (res) => () =>
  res.status(200).send({message: "Success"})
