FROM node:alpine as build-deps
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY --from=build-deps /usr/src/app /usr/src/app
CMD ["npm", "start"]
