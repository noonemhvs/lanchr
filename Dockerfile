FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app
COPY server.js .
COPY .env.example .env

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
