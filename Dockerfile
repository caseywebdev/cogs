FROM node:0.10.35-slim

# Install dependencies.
COPY package.json /usr/local/src/
WORKDIR /usr/local/src
RUN npm install

# Symlink cogs executable for convenience.
COPY bin/cogs /usr/local/src/bin/
RUN ln -s /usr/local/src/bin/cogs /usr/local/bin/

# Copy the code into the container.
COPY . /usr/local/src

# Run the tests.
RUN make test

# Set default envvars.
ENV COGS_DIR /src
ENV COGS_CONFIG_PATH cogs.json

# Run cogs in the given directory with the given config file.
CMD [ "cogs" ]
