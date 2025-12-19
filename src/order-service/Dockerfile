FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
EXPOSE 5002
CMD ["node", "index.js"]
