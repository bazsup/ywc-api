import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

import app from "../app";
import {Certificate} from "crypto";

require("babel-polyfill");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// run http & https server
if (process.env.NODE_ENV === "production") {
  // cloudflare credentials
  const credentials = {
    key: process.env.PRIVATE_KEY || "",
    cert: process.env.CERTIFICATE || "",
  };

  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(PORT + 443, () => {
    console.log(`Listening https on port ${PORT + 443}`);
  });
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
