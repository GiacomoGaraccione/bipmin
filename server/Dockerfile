# syntax=docker/dockerfile:1

FROM node:16.17.0-bullseye-slim

RUN mkdir /src
WORKDIR /src

COPY . /src/
# add `/node_modules/.bin` to $PATH
ENV PATH /src/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json src/package.json

RUN npm install 

EXPOSE 3001

# start app
CMD node server.js