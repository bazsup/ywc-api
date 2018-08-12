import {Unique} from "../models"
import randomstring from "randomstring"

export const generateUniqueString = async (len = 8) => {
  // generate the new one
  const string = randomstring.generate(len)
  const found = await Unique.findOne({string})
  // if found generate it again
  if (found) {
    return await generateUniqueString(len)
  }
  // save to database and return
  const unique = new Unique({string})
  await unique.save()
  return string
}
