FROM node:20.8.0-bullseye-slim AS BUILD_IMAGE

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY ./ ./

ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc

RUN npm i
RUN npm i -g typescript

RUN npm run build 

# # Running this again to install only production dependencies and not dev dependencies
RUN npm ci --include=prod

RUN rm -f .npmrc

FROM node:20.8.0-bullseye-slim

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "dist/src/server.js"]