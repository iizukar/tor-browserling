# Use the official Puppeteer image (which includes Chromium)
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Switch to root to perform installation and cleanup
USER root

# Remove conflicting Google repository files causing GPG errors
RUN rm -f /etc/apt/sources.list.d/google-chrome.list /etc/apt/sources.list.d/google.list

# Update package list and install Tor
RUN apt-get update && apt-get install -y tor

# Copy the custom torrc file into the container
COPY torrc /etc/tor/torrc

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Switch back to non-root (the official image uses 'node')
USER node

# (Optional) Set environment variable for Puppeteer executable path if needed.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files and install dependencies using npm install
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Use the entrypoint script to start Tor and your Node.js app automatically.
CMD ["/app/entrypoint.sh"]
