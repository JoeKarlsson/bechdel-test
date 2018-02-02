# Coding Style Guide

Please see `Contributing to bechdel.io <CONTRIBUTING.html>`\_\_ for more guidelines on
contributing to bechdel.io.

bechdel.io uses the (AirBnb JavaScript Style guide)[http://airbnb.io/javascript/]

This file explains coding-style considerations that are beyond the
syntax check of the _Standard_.

There are three sections:

* _General_: coding styles that are applicable to all JavaScript code.
* _Client_: coding styles that are only applicable to in-browser code.
* _Server_: coding styles that are only applicable in server code.

_Note: Client and Server coding styles can be contradicting, make sure
to read these carefully_.

## General

File Structure

A typical JavaScript file looks like this (without the comments). Sort
all modules that you `require` alphabetically within their blocks.

    // If your module exports something, put it on top
    module.exports = myMethod

    // require Node.js core modules in the 1st block (separaeted by empty line).
    // These are modules that come with Node.js and are not listed in package.json.
    // See https://nodejs.org/api/ for a list of Node.js core modules
    var EventEmitter = require('events').EventEmitter
    var util = require('util')

    // In the 2nd block, require all modules listed in package.json
    var async = require('async')
    var lodash = require('lodash')

    // in the 3rd block, require all modules using relative paths
    var helpers = require('./utils/helpers')
    var otherMethod = require('./other-method')

    function myMethod () {
      // code here
    }

Folder Structure

In the root, have

* `package.json`
* `.gitignore` (should at least list node_modules)
* `README.md`
* `LICENSE` (Apache License Version 2.0)

In most cases you will have `entry.js` file which is listed in
`package.json` as the `"main"` property.

If you want to split up logic into separate files, move them into a
`server/` folder. Put reusable, state-less helper methods into
`server/utils/`

For all test files, they should end with `-spec.js`.

## Client

### Testing

Client code should be tested using
[Jest](https://www.npmjs.com/package/jest). And Integration testing should be done with [Enzyme](https://www.npmjs.com/package/enzyme)

For client-side JavaScript code, it is important to limit the amount of
code that is downloaded to the client to the code that is actually
needed. The `loadash <https://lodash.com>`\_\_ library is a collection of
utilities that are useful individually and in combination.

For example, if you want to use the `merge` function of lodash,
require it like this:

.. code:: javascript

    var merge = require('lodash/merge')

If you want to use more than one function within one module, or if you
want to combine multiple functions for a single operation, require the
full lodash module:

.. code:: javascript

    var _ = require('lodash')

If multiple modules use the same lodash function, `our frontend bundling tool <http://browserify.org>`\_\_ will do the right thing and only include
that code once.

## Server

### Testing

Server code should be tested using [Jest](https://www.npmjs.com/package/jest). And end to end route testing should be done with [Super Test](https://www.npmjs.com/package/super-test)

Libraries with sub-modules that can be required individually, like lodash

For server-side code, it is important to load the minimal amount of code
into memory.

On the server require the full library, e.g.

    var _ = require('lodash')

    var c = _.merge(a, b)

That way, all of our server code will only ever load a single instance
of lodash into memory.
