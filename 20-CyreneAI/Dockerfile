# Use an official Node.js runtime as a build stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install necessary build dependencies
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev

# Create a symlink for python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install dependencies with --ignore-scripts to avoid native module builds
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Pass build-time environment variables
ARG API_BASE_URL
ARG MESSAGE_API_URL
ARG CYRENE_AI_ID
ARG TTS_API_URL
ARG MODEL_PROVIDER
ARG OPENAI_API_KEY
ARG NEXT_PUBLIC_PROJECT_ID

ENV API_BASE_URL=${API_BASE_URL}
ENV MESSAGE_API_URL=${MESSAGE_API_URL}
ENV CYRENE_AI_ID=${CYRENE_AI_ID}
ENV TTS_API_URL=${TTS_API_URL}
ENV MODEL_PROVIDER=${MODEL_PROVIDER}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}

# Build the Next.js application
RUN npm run build

# Use a minimal base image for the final stage
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/node_modules /app/node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment variable for runtime
ENV NODE_ENV=production

# Ensure runtime environment variables are available
ENV API_BASE_URL=${API_BASE_URL}
ENV MESSAGE_API_URL=${MESSAGE_API_URL}
ENV CYRENE_AI_ID=${CYRENE_AI_ID}
ENV TTS_API_URL=${TTS_API_URL}
ENV MODEL_PROVIDER=${MODEL_PROVIDER}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}

# Use next start to run the app in production mode
CMD ["npm", "run", "start"]
