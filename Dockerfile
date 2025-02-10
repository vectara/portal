FROM node:latest AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:latest
WORKDIR /app
COPY --from=builder /app ./
RUN apt-get update && apt-get install -y postgresql-client

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

ENTRYPOINT ["/app/start.sh"]