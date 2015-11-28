var commentWrapper = require('./commentWrapper');

module.exports = {
    createComments: function(gutil) {
        var comments = [
            'Nguyen Ly <lyphtec [at] gmail [dot] com>',
            'Copyright 2015',
            'MIT License',
            'Compiled on ' + gutil.date('mmm d, yyyy h:MM:ss TT Z')
        ];

        return commentWrapper.wrap(comments);
    }
};
