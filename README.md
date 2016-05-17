# Gist-Manager
A GitHub Gist manager built using React JS
=====================

## Introduction
Gist Manager allows people to manage their Github Gists all from one place. This web app allows people to add, edit and delete Gists stored on their Github account.

## Install and Running
**NOTE!** Use the latest version of Node, 4.x.x.
1. cd gist-manager
2. npm install
3. npm start
4. navigate to http://localhost:3000 in your browser of choice.

### React by default
The project runs with React by default and hot replacement of changes to the modules. Currently it is on 0.14.3.

### CSS Modules
CSS files loaded into components are locally scoped and you can point to class names with javascript. You can also compose classes together, also from other files. These are also hot loaded. Read more about them [here](http://glenmaddern.com/articles/css-modules).

To turn off CSS Modules remove it from the `webpack.config.js` file.

### Babel and Linting
Both Node server and frontend code runs with Babel. And all of it is linted. With atom you install the `linter` package, then `linter-eslint` and `linter-jscs`. You are covered. Also run `npm run eslint` or `npm run jscs` to verify all files. I would recommend installing `language-babel` package too for syntax highlighting

### Beautify
With a beautify package installed in your editor it will also do that
