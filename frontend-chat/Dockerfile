# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies without running postinstall scripts yet
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the rest of the source code
COPY . .

# Now run the postinstall (quasar prepare) since all files (index.html, etc) are present
RUN npm run postinstall

# Argument for the API URL, defaults to localhost if not provided
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Argument for Google Client ID
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the app
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine AS runtime

# Copy build output to nginx public directory
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
