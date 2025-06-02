# Build frontend
FROM node:16-alpine AS frontend-builder
WORKDIR /app/frontend
COPY sites/package*.json ./
RUN npm install
COPY sites/ ./
RUN npm run build

# Build backend
FROM node:16-alpine
WORKDIR /app
# Copy backend files
COPY server/ ./server/
COPY swagger.js ./
COPY package*.json ./
RUN npm install --production

# Copy built frontend files
COPY --from=frontend-builder /app/frontend/dist ./public

# Create startup script
RUN echo '#!/bin/sh\nnode server/server.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]