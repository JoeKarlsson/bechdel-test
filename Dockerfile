# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy webpack config files (needed for postinstall script)
COPY webpack.config*.js ./

# Copy source files (needed for webpack build)
COPY src/ ./src/

# Install dependencies with legacy peer deps (skip postinstall)
RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy remaining files
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "run", "runProd"]
