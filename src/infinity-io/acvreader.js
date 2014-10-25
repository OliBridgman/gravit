(function (_) {
    /**
     * Reader for Adobe Curve Files
     * @class GACVReader
     * @constructor
     * @extends GReader
     */
    function GACVReader() {
        GReader.call(this);
    };
    GObject.inherit(GACVReader, GReader);

    GACVReader.prototype.getInputType = function () {
        return GReader.InputType.ArrayBuffer;
    };

    GACVReader.prototype.getMimeType = function () {
        return 'application/x-adobe-acv';
    };

    GACVReader.prototype.getFileExtensions = function () {
        return ['acv'];
    };

    GACVReader.prototype.readInput = function (input, callback) {
        var view = new jDataView(input);

        var result = {
            rgb: [],
            r: [],
            g: [],
            b: []
        };

        view.seek(4);

        var length = view.getUint16();
        var ref = ['r', 'g', 'b'];
        var array = null;
        var x = null;
        var y = null;
        var i = null;
        var j = null;

        result.rgb.push([0, view.getUint16() ]);
        view.seek(view.tell() + 2);
        for (i = 1; i < length; i++) {
            y = view.getUint16();
            x = view.getUint16();
            result.rgb.push([x, y]);
        }

        // Now let's get the individual R, G, B curve result
        for (i = 0; i < 3; i++) {
            length = view.getUint16();
            array = result[ ref[ i ] ];
            for (j = 0; j < length; j++) {
                y = view.getUint16();
                x = view.getUint16();
                array.push([x, y]);
            }
        }

        callback(result);
    };

    GIO.registerReader(new GACVReader());
})(this);