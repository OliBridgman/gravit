(function (_) {
    /**
     * IO Reader class
     * @class IFReader
     * @constructor
     */
    function IFReader() {
    };

    IFReader.InputType = {
        String: 0,
        ArrayBuffer: 1
    };

    IFReader.prototype.getInputType = function () {
        throw new Error('Not Supported.');
    };

    IFReader.prototype.getMimeType = function () {
        throw new Error('Not Supported.');
    };

    IFReader.prototype.getFileExtensions = function () {
        throw new Error('Not Supported.');
    };

    IFReader.prototype.readInput = function (input, callback) {
        throw new Error('Not Supported.');
    };

    _.IFReader = IFReader;
})(this);