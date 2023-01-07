# base image
FROM node:16.17.0-bullseye-slim

# Set the working directory to /app inside the container
WORKDIR /app
# Copy app files
COPY . .

# add `/node_modules/.bin` to $PATH
#ENV PATH /src/node_modules/.bin:$PATH

# install and cache app dependencies
#COPY package.json src/package.json

RUN npm ci
RUN npm run build
ENV NODE_ENV production

EXPOSE 3000

# start app
CMD ["npx", "serve", "build"]