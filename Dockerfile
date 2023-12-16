# Stage 1: Build dependencies
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy your application source code 
COPY . .

# Stage 2: Build the final image
FROM node:16-alpine

WORKDIR /app

# Copy the Express application files
COPY --from=builder /app/ .

# Expose the port your API listens on (e.g., 3000)
EXPOSE 3000

# Start the API server
CMD ["npm", "start"]
