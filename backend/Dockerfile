FROM node:lts-alpine

# Install netcat for database connectivity check
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package.json and yarn.lock for consistent installs
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy rest of the app source code
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build the app
RUN yarn build

# Copy and make startup script executable
COPY start.sh .
RUN chmod +x start.sh

# Expose app port
EXPOSE 3000

# Start the app
CMD ["./start.sh"]
