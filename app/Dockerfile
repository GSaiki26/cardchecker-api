# Basics.
FROM node:19-alpine
WORKDIR /app

# Update the container.
RUN apk update
RUN apk upgrade

# Create the user.
RUN chown -R node /app
USER node

# Install the packages.
COPY --chown=node package.json .
RUN yarn

# Copy the project.
COPY --chown=node tsconfig.json .
COPY --chown=node src ./src

# Init the project
CMD yarn run start:prod