FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY ./server .
COPY ./swagger.js .
COPY ./routes /routes 
EXPOSE 3000
CMD ["node", "server.js"]