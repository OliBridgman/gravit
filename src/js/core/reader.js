(function (_) {
    /**
     * IO Reader class
     * @class GReader
     * @constructor
     */
    function GReader() {
    };

    GReader.InputType = {
        String: 0,
        ArrayBuffer: 1
    };

    GReader.prototype.getInputType = function () {
        throw new Error('Not Supported.');
    };

    GReader.prototype.getMimeType = function () {
        throw new Error('Not Supported.');
    };

    GReader.prototype.getFileExtensions = function () {
        throw new Error('Not Supported.');
    };

    GReader.prototype.readInput = function (input, callback, settings) {
        throw new Error('Not Supported.');
    };

    _.GReader = GReader;
})(this);