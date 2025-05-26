FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx hardhat clean
RUN npx hardhat compile

# Build-time arguments
ARG SEPOLIA_RPC_URL
ARG PRIVATE_KEY
ARG CONTRACT_ADDRESS

# Make them available at runtime
ENV SEPOLIA_RPC_URL=${SEPOLIA_RPC_URL}
ENV PRIVATE_KEY=${PRIVATE_KEY}
ENV CONTRACT_ADDRESS=${CONTRACT_ADDRESS}

EXPOSE 3000

CMD ["node", "server.js"]
