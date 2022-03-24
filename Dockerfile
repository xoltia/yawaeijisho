FROM xoltia/yawaeijisho-base:1.0

WORKDIR /app

RUN mkdir client
RUN mkdir api

# Copy NPM package files
COPY ./client/package*.json ./client
COPY ./api/package*.json ./api

# Install client dependencies
WORKDIR /app/client
RUN npm i --quiet --production

# Install API server dependencies 
WORKDIR /app/api
RUN npm i --quiet --production

# Copy built files
WORKDIR /app
COPY ./client/dist ./client
COPY ./api/dist ./api

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3080
ENV PUBLIC_FOLDER=../client
ENV USE_INDEX_FILE=true

# Expose port and start server
EXPOSE 3080
WORKDIR /app/api
CMD ["node", "index.js"]
