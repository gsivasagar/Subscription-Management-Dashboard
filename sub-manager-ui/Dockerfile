# /sub-manager-ui/Dockerfile

# Stage 1: Build the React App
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the build output to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 (Standard Web Port)
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]