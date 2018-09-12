# production build dockerfile
FROM node:8.5.0-alpine

# Setup environment
ENV NODE_ENV=production

# Create the directory
WORKDIR /usr/src/app

# install python
RUN apk --no-cache add --virtual native-deps \
  git g++ gcc libgcc libstdc++ linux-headers make python

RUN npm install node-gyp -g &&\
  npm install &&\
  npm rebuild bcrypt --build-from-source && \
  npm cache clean --force &&\
  apk del native-deps

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle the app src
COPY . .

# build application
RUN npm run build

# Expose the port and run application
EXPOSE 3000
CMD ["node", "build/bin/server"]
