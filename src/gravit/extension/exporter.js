(function (_) {
    /**
     * The base for an exporter
     * @class GExporter
     * @constructor
     */
    function GExporter() {
    };

    /**
     * @param {String} size ?|({Number}[{Unit|x|w|h}])[@?|({Number}[{Unit|x}])]
     * @return {{width: Number|GLength, height: Number|GLength}}
     */
    GExporter.parseSize = function (size) {
        var width = null;
        var height = null;

        var wh = size.split('@');

        var _parseValue = function (value) {
            if (value === '?') {
                return null;
            }

            var number = GUtil.parseNumber(value);
            if (typeof number != "number") {
                return null;
            }

            var unitStr = value.substr(number.toString().length);
            if (unitStr && unitStr.length > 0) {
                unitStr = unitStr.trim().toLowerCase();
                if (unitStr === 'x') {
                    return number;
                }
            }

            return GLength.parseLength(value);
        }

        var width = null;
        var height = null;

        switch (wh[0].charAt(wh[0].length - 1)) {
            case 'w':
            case 'W':
                width = _parseValue(wh[0].substr(0, wh[0].length - 1));
                break;
            case 'h':
            case 'H':
                height = _parseValue(wh[0].substr(0, wh[0].length - 1));
                break;
            default:
                width = _parseValue(wh[0]);
                if (wh.length > 1) {
                    height = _parseValue(wh[1]);
                }
        }

        return {
            width: width,
            height: height
        }
    };

    /**
     * Returns whether this exporter only exports a whole scene
     * or can also export individual parts of it
     */
    GExporter.prototype.isStandalone = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The name of the exporter
     */
    GExporter.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The extensions this export filter produces like ['png', 'jpg'].
     * Ensure to always return extensions in lower-case only!
     * @return {Array<String>} the extension
     */
    GExporter.prototype.getExtensions = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Called to let the exporter export a part. This will never be
     * called when the exporter is standalone only
     * @param {GElement} part the part to be exported
     * @param {String} size desired see. See GExporter.parseSize
     * @param {GStorage} storage the storage to be used for storing
     * @param {String} url the url to store the part within the storage
     * @param {String} extension the extension to be used, this is one
     * of the extensions supplied by this exporter
     */
    GExporter.prototype.exportPart = function (part, size, storage, url, extension) {
        throw new Error('Not Supported.');
    };

    _.GExporter = GExporter;
})(this);
