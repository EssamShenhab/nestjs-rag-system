FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    python3 \
    curl \
    unzip

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build

# Copy entrypoint
COPY docker/nestjs-rag-system/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/main"]
