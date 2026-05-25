FROM node:18-alpine

RUN apk add --update --no-cache mongodb-tools bash

RUN npm install -g @nestjs/cli@9.2.0

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY . .

RUN npm install --legacy-peer-deps

RUN npm install webpack

RUN npm install jest

RUN npm install -D @types/jest

RUN npm run build

CMD ["npm", "run", "start:dev"]

# FROM node:18-alpine as runner

# RUN apk add --update --no-cache mongodb-tools bash

# WORKDIR /home/node/app

# COPY --from=builder /home/node/app/package*.json ./
# COPY --from=builder /home/node/app/node_modules ./node_modules
# COPY --from=builder /home/node/app/dist ./dist

# EXPOSE 5524

# CMD ["npm", "run", "start:dev"]