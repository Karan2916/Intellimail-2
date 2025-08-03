# Use an official lightweight Node.js image
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and package-lock.json from your server directory
# This step is optimized for Docker's caching
COPY server/package*.json ./

# Install only the production dependencies
RUN npm install --production

# Copy your server's source code into the container
COPY server/src ./src

# Tell Cloud Run what port your application will listen on
# (Cloud Run will provide the actual PORT environment variable)
EXPOSE 10000

# The command to run your application
CMD ["node", "src/index.js"]
