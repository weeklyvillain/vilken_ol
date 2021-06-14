 # syntax=docker/dockerfile:1
 FROM node

 COPY . .
 CMD ["node", "express.js"]

 