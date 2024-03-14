# syntax=docker/dockerfile:1

# ARG NODE_VERSION=18.18.0

# FROM node:${NODE_VERSION}-alpine

# ENV NODE_ENV production

# COPY  package*.json  .
# WORKDIR /app

# RUN npm install
# USER node

# COPY . .

# EXPOSE 7070

# CMD npm start
ARG NODE_VERSION=18.18.0

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app
EXPOSE 7070

FROM base as dev
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
USER node
COPY . .
CMD npm start

FROM base as prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY . .
CMD npm start