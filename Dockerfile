# production build dockerfile
FROM node:alpine

# Create the directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle the app src
COPY . .

# build application
RUN npm run build

# Expose the port and run application
EXPOSE 3000
CMD ["npm", "run", "prod"]
