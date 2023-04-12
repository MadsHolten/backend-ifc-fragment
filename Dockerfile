FROM node:16.15.1
RUN mkdir /application
WORKDIR /application
COPY . /application
RUN yarn install
# VOLUME ["/application/temp"]
CMD yarn execute