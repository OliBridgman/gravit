(function (_) {
    /**
     * Reader for Adobe Swatch Exchange files
     * @class IFASEReader
     * @constructor
     * @extends IFReader
     */
    function IFASEReader() {
        IFReader.call(this);
    };
    IFObject.inherit(IFASEReader, IFReader);

    IFASEReader.prototype.getInputType = function () {
        return IFReader.InputType.ArrayBuffer;
    };

    IFASEReader.prototype.getMimeType = function () {
        return 'application/x-adobe-ase';
    };

    IFASEReader.prototype.getFileExtensions = function () {
        return ['ase'];
    };

    IFASEReader.prototype.readInput = function (input, callback) {
        alert('read_ase_now');
    };

    IFIO.registerReader(new IFASEReader());
})(this);