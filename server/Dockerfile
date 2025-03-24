FROM node:16-alpine
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY server/ /app/
COPY swagger.js /app/    # Copia anche swagger.js
EXPOSE 3000
CMD ["node", "server.js"]