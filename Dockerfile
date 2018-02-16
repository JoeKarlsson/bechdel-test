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

EXPOSE 3000

CMD ["npm", "start"]
