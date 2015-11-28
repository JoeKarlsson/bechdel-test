// from https://github.com/johnpapa/ng-demos/blob/master/grunt-gulp/build-gulp/commentWrapper.js

module.exports = {
    wrap: function(comments) {
        var output = '/*\n';
        comments.forEach(function(line) {
            output = output + '* ' + line + '\n';
        });
        output = output + '*/\n';
        
        return output;
    }
};
