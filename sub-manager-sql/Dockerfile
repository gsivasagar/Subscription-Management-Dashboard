# /backend/Dockerfile

# 1. Use Node.js
FROM node:18-alpine

# 2. Create app directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the backend code
COPY . .

# 5. Expose the port your backend runs on (usually 3000)
EXPOSE 3000

# 6. Start the server
CMD ["npm", "start"]