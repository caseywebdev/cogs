FROM node:0.10.35-slim

# Install dependencies.
COPY package.json /usr/local/src/
WORKDIR /usr/local/src
RUN npm install --production

# Symlink cogs executable for convenience.
COPY bin/cogs /usr/local/src/bin/
RUN ln -s /usr/local/src/bin/cogs /usr/local/bin/

# Copy the code into the container.
COPY . /usr/local/src

# Set default envvars.
ENV ROOT_DIR /assets
ENV CONFIG cogs.json

# Run cogs in the given directory with the given config file.
CMD cd $ROOT_DIR && exec cogs -C $CONFIG
