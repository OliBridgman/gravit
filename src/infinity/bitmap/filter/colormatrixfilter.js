(function (_) {
    /**
     * Color matrix filter
     * @class IFColorMatrixFilter
     * @constructor
     */
    function IFColorMatrixFilter() {
    };

    IFColorMatrixFilter.COLOR_MATRIX_IDENTITY = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    IFColorMatrixFilter.COLOR_MATRIX_INVERT = [
        -1, 0, 0, 0, 255,
        0, -1, 0, 0, 255,
        0, 0, -1, 0, 255,
        0, 0, 0, 1, 0
    ];

    IFColorMatrixFilter.COLOR_MATRIX_GRAYSCALE = [
        0.33, 0.33, 0.33, 0, 0,
        0.33, 0.33, 0.33, 0, 0,
        0.33, 0.33, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**
     * Apply a color matrix filter whereas the
     * color-identity-matrix looks like this:
     *
     * |---|-R-|-G-|-B-|-A-|-Offset-|
     * |-R-| 1 | 0 | 0 | 0 |    0   |
     * |-G-| 0 | 1 | 0 | 0 |    0   |
     * |-B-| 0 | 0 | 1 | 0 |    0   |
     * |-A-| 0 | 0 | 0 | 1 |    0   |
     *
     * @param {Array<Number>} args the color matrix to be applied (4x5)
     */
    IFColorMatrixFilter.apply = function (pixels, width, height, args) {
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var index = (y * width + x) * 4;

                var oR = pixels[index];
                var oG = pixels[index + 1];
                var oB = pixels[index + 2];
                var oA = pixels[index + 3];

                pixels[index] = (args[0] * oR) + (args[1] * oG) + (args[2] * oB) + (args[3] * oA) + args[4];
                pixels[index + 1] = (args[5] * oR) + (args[6] * oG) + (args[7] * oB) + (args[8] * oA) + args[9];
                pixels[index + 2] = (args[10] * oR) + (args[11] * oG) + (args[12] * oB) + (args[13] * oA) + args[14];
                pixels[index + 3] = (args[15] * oR) + (args[16] * oG) + (args[17] * oB) + (args[18] * oA) + args[19];
            }
        }
    };

    _.IFColorMatrixFilter = IFColorMatrixFilter;
})(this);