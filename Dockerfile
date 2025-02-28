FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx hardhat clean && npx hardhat compile

EXPOSE 3000

CMD ["node", "server.js"]
