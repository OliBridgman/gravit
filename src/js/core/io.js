(function (_) {
    /**
     * IO Management class
     * @class GIO
     * @constructor
     */
    function GIO() {
    }

    GIO._readers = [];

    GIO.registerReader = function (reader) {
        GIO._readers.push(reader);
    };

    /**
     * Read an input
     * @param {String} mimeTypeOrFileExt maybe a mime-type,
     * a file extension without dot or with dot or a whole file path
     * @param {File|Blob|String|ArrayBuffer} source
     * @param {Function(result)} callback called with the result.
     * If the given result argument is null an error may have ocurred.
     * @param {*} [settings] custom settings for the reader
     */
    GIO.read = function (mimeTypeOrFileExt, source, callback, settings) {
        var fileExtClean = mimeTypeOrFileExt.toLowerCase();

        if (fileExtClean.indexOf('.') > 0) {
            var dotPos = fileExtClean.lastIndexOf('.');
            fileExtClean = fileExtClean.substr(dotPos + 1);
        }

        var targetReader = null;

        for (var i = 0; i < GIO._readers.length; ++i) {
            var reader = GIO._readers[i];
            if (reader.getMimeType() === mimeTypeOrFileExt) {
                targetReader = reader;
                break;
            } else {
                var fileExts = reader.getFileExtensions();
                for (var k = 0; k < fileExts.length; ++k) {
                    if (fileExts[k].toLowerCase() === fileExtClean) {
                        targetReader = reader;
                        break;
                    }
                }
            }
        }

        if (targetReader) {
            var inputType = targetReader.getInputType();

            function doRead(input) {
                if (input) {
                    targetReader.readInput(input, callback, settings);
                } else {
                    callback(null);
                }
            }

            if (inputType === GReader.InputType.String) {
                if (typeof source === 'string') {
                    doRead(source);
                } else {
                    var blob = source instanceof ArrayBuffer ? new Blob([source]) : source;
                    var f = new FileReader();
                    f.onload = function (e) {
                        doRead(e.target.result);
                    };
                    f.readAsText(blob);
                }
            } else if (inputType === GReader.InputType.ArrayBuffer) {
                if (source instanceof ArrayBuffer) {
                    doRead(source);
                } else {
                    var blob = typeof source === 'string' ? new Blob([source]) : source;
                    var f = new FileReader();
                    f.onload = function (e) {
                        doRead(e.target.result);
                    };
                    f.readAsArrayBuffer(blob);
                }
            } else {
                doRead(null);
            }
        } else {
            callback(null);
        }
    };

    _.GIO = GIO;
})(this);