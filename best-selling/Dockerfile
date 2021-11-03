FROM node:14-alpine
MAINTAINER Ameen Sayegh
WORKDIR ~/app
COPY ./package.json ./package-lock.json .
RUN npm install --production
COPY ./* .
CMD node main.js
