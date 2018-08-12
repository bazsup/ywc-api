export const majorAsText = (major) =>
  `Web ${major.charAt(0).toUpperCase()}${major.slice(1)}`

export const createJsonResponse = (status, payload) =>
  payload ? {status, payload} : {status}
