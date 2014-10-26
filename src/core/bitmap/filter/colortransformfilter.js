(function (_) {
    /**
     * Color transform filter
     * @class GColorTransformFilter
     * @constructor
     */
    function GColorTransformFilter() {
    };

    /**
     * Apply a color transformation filter with rgba-multipliers and
     * rgba-offsets
     *
     * @param {{multiplier: Array<Number>, offsets: Array<Number>}}
     */
    GColorTransformFilter.apply = function (pixels, width, height, args) {
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var index = (y * width + x) * 4;
                pixels[index] = pixels[index] * args.multiplier[0] + args.offsets[0];
                pixels[index + 1] = pixels[index + 1] * args.multiplier[1] + args.offsets[1];
                pixels[index + 2] = pixels[index + 2] * args.multiplier[2] + args.offsets[2];
                pixels[index + 3] = pixels[index + 3] * args.multiplier[3] + args.offsets[3];
            }
        }
    };

    _.GColorTransformFilter = GColorTransformFilter;
})(this);