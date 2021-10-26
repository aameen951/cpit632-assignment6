FROM node:14-alpine
MAINTAINER Ameen Sayegh
WORKDIR ~/app
COPY ./package*.json .
RUN npm install
COPY ./* .
EXPOSE 80
CMD ["node", "main.js"]
