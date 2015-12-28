/**
 * Things to do with Phonegap files
 * Mainly wrappers around their async functions to return Promises
 */

 (function (FMS, Backbone, _, $) {
    _.extend(FMS, {
        files: {
            // move  a file at from a uri to a desination directory. maintains file name
            moveURI: function (srcURI, newName ) {

                var fileEntry;
                return getFileFromURI(srcURI)
                    .pipe( function (file) {
                        fileEntry = file;

                        return getFileSystem();
                    })
                    .pipe( function (filesystem) {
                        FMS.printDebug('Filesystem returned: ' + filesystem);

                        return getDirectory(filesystem.root, CONFIG.FILES_DIR, {create: true});
                    })
                    .pipe( function(directory) {
                        return moveFile( fileEntry, directory, newName );
                    });
            },

            copyURI: function (srcURI, newName ) {

                var fileEntry;
                return getFileFromURI(srcURI)
                    .pipe( function (file) {
                        fileEntry = file;

                        return getFileSystem();
                    })
                    .pipe( function (filesystem) {
                        FMS.printDebug('Filesystem returned: ' + filesystem);

                        return getDirectory(filesystem.root, CONFIG.FILES_DIR, {create: true});
                    })
                    .pipe( function(directory) {
                        return copyFile( fileEntry, directory, newName );
                    });
            },

            deleteURI: function (uri) {
                FMS.printDebug('Deleting URI: ' + uri);

                return getFileFromURI(uri)
                    .pipe( function (file) {
                        var deletingFile = $.Deferred();
                        file.remove(deletingFile.resolve, deletingFile.reject);
                        return deletingFile;
                    });

            },

            // Delete a file from the filesystem
            deleteFile: function (path) {

                FMS.printDebug('Deleting file: ' + path);

                // Turn path into a filename
                var filename = path.split('/').pop();

                return getFileSystem()
                    .pipe(function (filesystem) {
                        return getDirectory(filesystem.root, CONFIG.FILES_DIR);
                    })
                    .pipe(function (directory) {
                        return getFile(directory, filename, {});
                    })
                    .pipe(function (file) {
                        var deletingFile = $.Deferred();
                        file.remove(deletingFile.resolve, deletingFile.reject);
                        return deletingFile;
                    });

            }
        }
    });

    // Wrap the async Phonegap way of getting a filesystem in a promise
    function getFileSystem() {

        FMS.printDebug('Getting the file system');

        var filesystem = $.Deferred();

        window.requestFileSystem(
            LocalFileSystem.PERSISTENT,
            0,
            filesystem.resolve,
            filesystem.reject );

        return filesystem.promise();
    }

    // Wrap the async Phonegap way of getting a directory in a promise
    function getDirectory (rootDirectory, path, options) {

        FMS.printDebug('Getting a directory: ' + path);

        var directory = $.Deferred();

        rootDirectory.getDirectory(path, options, directory.resolve, directory.reject);

        return directory.promise();
    }

    // Wrap the async Phonegap way of getting a file in a promise
    function getFile (directory, path, options) {

        FMS.printDebug('Getting a file with path: ' + path + ' in directory: ' + directory.fullPath);

        var file = $.Deferred();

        directory.getFile(path, options, file.resolve, file.reject);

        return file.promise();
    }

    function moveFile (src, dest, newName) {

        FMS.printDebug( 'moveing file ' + src.fullPath + ' to ' + dest.fullPath );

        var move = $.Deferred();

        var destPath = dest.fullPath + '/' + src.name;
        var srcPath = src.fullPath + '';
        if ( srcPath === destPath ) {
            FMS.printDebug('not moving because files are the same');
            move.resolve( src );
        } else {
            FMS.printDebug('paths differ so moving');
            src.moveTo( dest, newName, move.resolve, move.reject);
        }

        return move.promise();
    }

    function copyFile (src, dest, newName) {

        FMS.printDebug( 'copying file ' + src.fullPath + ' to ' + dest.fullPath );

        var copy = $.Deferred();

        var destPath = dest.fullPath + '/' + src.name;
        var srcPath = src.fullPath + '';
        if ( srcPath === destPath ) {
            FMS.printDebug('not copying because files are the same');
            copy.resolve( src );
        } else {
            FMS.printDebug('paths differ so copying');
            src.copyTo( dest, newName, copy.resolve, copy.reject);
        }

        return copy.promise();
    }

    function getFileFromURI(uri) {

        FMS.printDebug( 'getting file from uri ' + uri );

        var file = $.Deferred();

        window.resolveLocalFileSystemURI( uri, file.resolve, file.reject);

        return file.promise();
    }
})(FMS, Backbone, _, $);
