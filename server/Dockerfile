FROM node:16-alpine
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY server/ /app/
EXPOSE 3000
CMD ["node", "server.js"]