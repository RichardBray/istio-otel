FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

ARG OTEL_ENABLED
ENV OTEL_ENABLED=$OTEL_ENABLED

CMD ["node", "index.js"]