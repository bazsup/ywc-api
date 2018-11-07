import fb from "fb";

export const getFacebookUser = accessToken =>
  new Promise((resolve, reject) => {
    fb.napi(
      "/me",
      {
        fields: "id,first_name,last_name,email",
        access_token: accessToken,
      },
      (err, data) => (err ? reject(err) : resolve(data)),
    );
  });
