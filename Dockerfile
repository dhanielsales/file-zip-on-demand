FROM node:latest

WORKDIR /usr/src/app
COPY . .
ENV PORT 4000

RUN yarn cache clean && yarn install
