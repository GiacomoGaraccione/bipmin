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
RUN npm run build --env.PUBLIC_URL="/bipmin/app/build" 
RUN npm install serve
ENV NODE_ENV production
COPY ./public/.htaccess /app/build

EXPOSE 3000

# start app
CMD ["npx", "serve", "build"]