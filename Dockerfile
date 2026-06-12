FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app
COPY server.js .

# Create data directory
RUN mkdir -p data

# Create .env file
RUN echo "PORT=3000" > .env && \
    echo "JWT_SECRET=change_me_in_fly_secrets" >> .env && \
    echo "SESSION_TTL=86400" >> .env && \
    echo "DB_FILE=/data/db.sqlite" >> .env

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
