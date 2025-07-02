FROM node:lts-alpine

WORKDIR /app

# Copy package.json and yarn.lock for consistent installs
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy rest of the app source code
COPY . .

# Build the app
RUN yarn build

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
