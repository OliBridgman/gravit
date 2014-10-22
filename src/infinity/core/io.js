(function (_) {
    /**
     * IO Management class
     * @class IFIO
     * @constructor
     */
    function IFIO() {
    }

    IFIO._readers = [];

    IFIO.registerReader = function (reader) {
        IFIO._readers.push(reader);
    };

    /**
     * Read an input
     * @param {String} mimeTypeOrFileExt maybe a mime-type,
     * a file extension without dot or with dot or a whole file path
     * @param {File|Blob|String|ArrayBuffer} source
     * @param {Function(result)} callback called with the result.
     * If the given result argument is null an error may have ocurred.
     */
    IFIO.read = function (mimeTypeOrFileExt, source, callback) {
        var fileExtClean = mimeTypeOrFileExt.toLowerCase();

        if (fileExtClean.indexOf('.') > 0) {
            var dotPos = fileExtClean.lastIndexOf('.');
            fileExtClean = fileExtClean.substr(dotPos + 1);
        }

        var targetReader = null;

        for (var i = 0; i < IFIO._readers.length; ++i) {
            var reader = IFIO._readers[i];
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

        if (reader) {
            var inputType = reader.getInputType();

            function doRead(input) {
                if (input) {
                    reader.readInput(input, callback);
                } else {
                    callback(null);
                }
            }

            if (inputType === IFReader.InputType.String) {
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
            } else if (inputType === IFReader.InputType.ArrayBuffer) {
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

    _.IFIO = IFIO;
})(this);