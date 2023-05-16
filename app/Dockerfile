# Basics.
FROM node:19-alpine
WORKDIR /app

# Update the container.
RUN apk upgrade --update --no-cache
RUN npm i -g typescript

# Create the user.
RUN chown -R node /app
USER node

# Install the packages.
COPY --chown=node package.json .
RUN yarn

# Copy the project.
COPY --chown=node ./tsconfig.json .
COPY --chown=node ./proto ./proto
COPY --chown=node ./src ./src

# Init the project
RUN yarn run build
CMD yarn run start:prod
