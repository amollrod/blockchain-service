FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx hardhat clean
RUN npx hardhat compile

# Build time variables
ARG PRIVATE_KEY
ARG SEPOLIA_RPC_URL
ARG CONTRACT_ADDRESS

# Execution time variables
ENV PRIVATE_KEY=${PRIVATE_KEY}
ENV SEPOLIA_RPC_URL=${SEPOLIA_RPC_URL}
ENV CONTRACT_ADDRESS=${CONTRACT_ADDRESS}

RUN echo "BUILD DEBUG - PRIVATE_KEY=$PRIVATE_KEY"

EXPOSE 3000

CMD ["node", "server.js"]
