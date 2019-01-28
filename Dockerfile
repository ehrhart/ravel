# Stage 1 - the build process
FROM node:alpine as build-deps
MAINTAINER "Thibault Ehrhart" <thibault.ehrhart@gmail.com>
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

# Stage 2 - the production environment
FROM node:alpine
MAINTAINER "Thibault Ehrhart" <thibault.ehrhart@gmail.com>
WORKDIR /usr/src/app
RUN mkdir ./client
COPY --from=build-deps /usr/src/app/client/build ./client/build
COPY --from=build-deps /usr/src/app/server.js ./server.js
COPY --from=build-deps /usr/src/app/node_modules ./node_modules
RUN yarn global add nodemon

CMD NODE_ENV=production yarn start
