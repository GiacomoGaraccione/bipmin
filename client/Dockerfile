# base image
FROM node:16.17.0-bullseye-slim

# set working directory
RUN mkdir /src
WORKDIR /src

# add src
COPY . /src

# add `/node_modules/.bin` to $PATH
ENV PATH /src/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json src/package.json

RUN npm install 
RUN npm run build --env.PUBLIC_URL="/bipmin"

EXPOSE 3000

# start app
CMD npm start