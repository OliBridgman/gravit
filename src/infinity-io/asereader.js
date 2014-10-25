(function (_) {
    var COLOR_START = 0x0001
    var GROUP_START = 0xc001
    var GROUP_END = 0xc002

    var MODE_COLOR = 1
    var MODE_GROUP = 2

    var STATE_GET_MODE = 1
    var STATE_GET_LENGTH = 2
    var STATE_GET_NAME = 3
    var STATE_GET_MODEL = 4
    var STATE_GET_COLOR = 5
    var STATE_GET_TYPE = 6

    var ColorSize = {
        CMYK: 4,
        RGB: 3,
        LAB: 3,
        GRAY: 1
    };

    var ColorType = {
        0: 'global',
        1: 'spot',
        2: 'normal'
    };

    /**
     * Reader for Adobe Swatch Exchange files
     * @class GASEReader
     * @constructor
     * @extends GReader
     */
    function GASEReader() {
        GReader.call(this);
    };
    GObject.inherit(GASEReader, GReader);

    GASEReader.prototype.getInputType = function () {
        return GReader.InputType.ArrayBuffer;
    };

    GASEReader.prototype.getMimeType = function () {
        return 'application/x-adobe-ase';
    };

    GASEReader.prototype.getFileExtensions = function () {
        return ['ase'];
    };

    GASEReader.prototype.readInput = function (input, callback) {
        var view = new jDataView(input, undefined, undefined, false/*big-endian*/);
        var result = {};
        var groups = result.groups = [];
        var colors = result.colors = [];

        if (getChar8(0) !== 'A' || getChar8(1) !== 'S' || getChar8(2) !== 'E' || getChar8(3) !== 'F') {
            callback(null);
            return;
        }

        result.version = [view.getUint16(4), view.getUint16(6)].join('.');
        
        var blocks = view.getUint32(8);
        var state = STATE_GET_MODE;
        var mode = MODE_COLOR;
        var position = 12;
        var blockLength;
        var block;
        var group;
        var color;

        x: while (position < view.byteLength) {
            switch (state) {
                case STATE_GET_MODE:
                    readBlockMode();
                    continue x;
                case STATE_GET_LENGTH:
                    readBlockLength();
                    continue x;
                case STATE_GET_NAME:
                    readBlockName();
                    continue x;
                case STATE_GET_MODEL:
                    readBlockModel();
                    continue x;
                case STATE_GET_COLOR:
                    readBlockColor();
                    continue x;
                case STATE_GET_TYPE:
                    readBlockType();
                    continue x;
            }

            throw new Error('Unexpected');
        }

        // Internal helpers
        function readBlockMode() {
            switch (view.getUint16(position)) {
                case COLOR_START:
                    colors.push(block = color = {});
                    mode = MODE_COLOR;
                    break
                case GROUP_START:
                    groups.push(block = group = {colors: []});
                    mode = MODE_GROUP;
                    break
                case GROUP_END:
                    group = null;
                    break

                default:
                    throw new Error('Unexpected block type at byte #' + position)
            }

            if (group && block === color) {
                group.colors.push(color)
            }

            position += 2
            state = STATE_GET_LENGTH
        }

        function readBlockLength() {
            blockLength = view.getUint32(position)
            position += 4

            state = !blockLength
                ? STATE_GET_MODE
                : STATE_GET_NAME;
        }

        function readBlockName() {
            var length = view.getUint16(position)
            var name = ''

            while (--length) {
                name += getChar16(position += 2)
            }

            position += 4
            block.name = name

            state = mode === MODE_GROUP
                ? STATE_GET_MODE
                : STATE_GET_MODEL
        }

        function readBlockModel() {
            block.model = (
            getChar8(position++) +
            getChar8(position++) +
            getChar8(position++) +
            getChar8(position++)
            ).trim()

            state = STATE_GET_COLOR
        }

        function readBlockColor() {
            var model = block.model.toUpperCase()
            var count = ColorSize[model]
            var channels = []

            while (count--) {
                channels.push(view.getFloat32(position))
                position += 4
            }

            block.color = channels

            state = STATE_GET_TYPE
        }

        function readBlockType() {
            block.type = ColorType[view.getUint16(position)]
            position += 2
            state = STATE_GET_MODE
        }

        function getChar8(index) {
            return String.fromCharCode(view.getUint8(index))
        }

        function getChar16(index) {
            return String.fromCharCode(view.getUint16(index))
        }

        callback(result);
    };

    GIO.registerReader(new GASEReader());
})(this);