# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runtime

WORKDIR /app

# Install ffmpeg for voice messages
RUN apk add --no-cache ffmpeg

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/index.js"]
