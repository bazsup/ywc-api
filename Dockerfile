# production build dockerfile
FROM node:10

# Create the directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN yarn install

# Bundle the app src
COPY . .

# update environment
ENV NODE_ENV=production

# build application
RUN yarn run build

# Expose the port (http & https) and run application
EXPOSE 3000

CMD ["node", "build/bin/server.js"]
