# Build frontend
FROM node:16-alpine AS frontend-builder
WORKDIR /app/frontend
COPY sites/package*.json ./
RUN npm install
COPY sites/ ./

# Pass environment variables to the build process
ARG VUE_APP_GOOGLE_CLIENT_ID
ENV VUE_APP_GOOGLE_CLIENT_ID="515386869438-ab5b2e5ju1sfnd0vt5fnj7ceuh0rc2fm.apps.googleusercontent.com"

RUN npm run build

# Build backend
FROM node:16-alpine
WORKDIR /app
# Copy backend files
COPY server/ ./server/
COPY swagger.js ./
COPY swagger.js ./server/
COPY routes/ ./routes/
COPY routes/ ./server/routes/
COPY package*.json ./
RUN npm install --production

# Copy built frontend files
COPY --from=frontend-builder /app/frontend/dist ./public

# Create start script
RUN printf '#!/bin/sh\nnode server/server.js\n' > /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]