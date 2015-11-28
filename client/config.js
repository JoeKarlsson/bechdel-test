System.config({
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime"
    ]
  },
  paths: {
    "app/*": "js/*.js",
    "github:*": "lib/github/*",
    "npm:*": "lib/npm/*"
  },

  map: {
    "babel": "npm:babel-core@5.8.14",
    "babel-core": "npm:babel-core@5.8.14",
    "babel-runtime": "npm:babel-runtime@5.8.12",
    "core-js": "npm:core-js@0.9.18",
    "fastclick": "npm:fastclick@1.0.6",
    "foundation": "github:zurb/bower-foundation@5.5.2",
    "jquery": "github:components/jquery@2.1.4",
    "modernizr": "github:Modernizr/Modernizr@2.8.3",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:zurb/bower-foundation@5.5.2": {
      "jquery": "github:components/jquery@2.1.4"
    },
    "npm:babel-runtime@5.8.12": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:core-js@0.9.18": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    }
  }
});
