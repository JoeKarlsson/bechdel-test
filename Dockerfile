FROM node:9.4.0
RUN npm install --global npm@5.6.0

ENV HOME=/home/app
WORKDIR $HOME/bechdelTest

COPY package.json $HOME/bechdelTest
COPY package-lock.json $HOME/bechdelTest

RUN npm install

COPY . $HOME/bechdelTest

RUN npm uninstall --save node-sass
RUN npm install --save node-sass

RUN mkdir -p node_modules/node-sass/vendor/linux-x64-59
RUN curl -L https://github.com/sass/node-sass/releases/download/v4.7.2/linux-x64-59_binding.node -o node_modules/node-sass/vendor/linux-x64-59/binding.node

EXPOSE 3000

CMD ["npm", "start"]
