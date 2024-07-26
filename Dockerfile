FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN npm install --production
RUN npm run create-schema  # Run the create-schema command during build
EXPOSE 3000

CMD ["npm", "start"]
