(function (_) {
    /**
     * A RGB Byte Triplet [0 - 255, 0 - 255, 0 - 255]
     * @typedef {(Array<Number>} RGB
     */
    /**
     * A HSV Triplet [0 - 360, 0 - 1.0, 0 - 1.0]
     * @typedef {(Array<Number>} HSV
     */
    /**
     * A CMYK Quadlet [0 - 1.0, 0 - 1.0, 0 - 1.0, 0 - 1.0]
     * @typedef {(Array<Number>} CMYK
     */

    /**
     * A class representing a color
     * @class IFColor
     * @extends IFPattern
     * @constructor
     */
    function IFColor(value) {
        this._value = value && value instanceof Array ? value.slice() : null;
    }

    IFObject.inherit(IFColor, IFPattern);

    function round_clamp_byte (byte) {
        return Math.min(255, Math.max(0, Math.round(byte)));
    };

    /**
     * Convert RGB to HSV
     * @param {RGB} rgb
     * @return {HSV}
     */
    IFColor.rgbToHSV = function (rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        var minRGB = Math.min(r, Math.min(g, b));
        var maxRGB = Math.max(r, Math.max(g, b));

        // Black-gray-white
        if (minRGB === maxRGB) {
            return [0, 0, minRGB];
        }

        var d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r);
        var h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5);

        return [
            Math.min(360, Math.max(0, Math.round(60 * (h - d / (maxRGB - minRGB))))),
            (maxRGB - minRGB) / maxRGB,
            maxRGB
        ];
    };

    /**
     * Convert HSV to RGB
     * @param {HSV} hsv
     * @return {RGB}
     */
    IFColor.hsvToRGB = function (hsv) {
        var c = hsv[2] * hsv[1];
        var h1 = hsv[0] / 60;
        var x = c * (1 - Math.abs((h1 % 2) - 1));
        var m = hsv[2] - c;
        var rgb;

        if (h1 < 1) rgb = [c, x, 0];
        else if (h1 < 2) rgb = [x, c, 0];
        else if (h1 < 3) rgb = [0, c, x];
        else if (h1 < 4) rgb = [0, x, c];
        else if (h1 < 5) rgb = [x, 0, c];
        else if (h1 <= 6) rgb = [c, 0, x];

        return [
            round_clamp_byte(255 * (rgb[0] + m)),
            round_clamp_byte(255 * (rgb[1] + m)),
            round_clamp_byte(255 * (rgb[2] + m))
        ];
    };

    /**
     * Convert a CMY/CMYK Color into a RGB Color
     * @param {CMY|CMYK} cmyk
     * @param {Boolean} [noCMS] if set, no color management
     * will be used. Defaults to false.
     * @returns {RGB}
     */
    IFColor.cmykToRGB = function (cmyk, noCMS) {
        var k = cmyk.length === 4 ? cmyk[3] : 0.0;
        var c = (cmyk[0] * (1 - k) + k);
        var m = (cmyk[1] * (1 - k) + k);
        var y = (cmyk[2] * (1 - k) + k);

        return [
            round_clamp_byte((1 - c) * 255),
            round_clamp_byte((1 - m) * 255),
            round_clamp_byte((1 - y) * 255)
        ];
    };

    /**
     * Convert a RGB Color into a CMYK Color
     * @param {RGB} rgb
     * @param {Boolean} [noCMS] if set, no color management
     * will be used. Defaults to false.
     * @returns {CMYK}
     */
    IFColor.rgbToCMYK = function (rgb, noCMS) {
        var c = 1 - (rgb[0] / 255);
        var m = 1 - (rgb[1] / 255);
        var y = 1 - (rgb[2] / 255);
        var k = Math.min(y, Math.min(m, Math.min(c, 1)));

        return [
            Math.min(1.0, Math.max(0.0, (c - k) / (1 - k))),
            Math.min(1.0, Math.max(0.0, (m - k) / (1 - k))),
            Math.min(1.0, Math.max(0.0, (y - k) / (1 - k))),
            Math.min(1.0, Math.max(0.0, k)),
        ];
    };

    /**
     * Convert a rgb color into a hex color
     * @param {RGB} rgb
     * @returns {string}
     */
    IFColor.rgbToHtmlHex = function (rgb) {
        var bin = rgb[0] << 16 | rgb[1] << 8 | rgb[2];
        return '#' + (function (h) {
            return new Array(7 - h.length).join("0") + h
        })(bin.toString(16).toUpperCase());
    };

    /**
     * @type {Array<{Number}>}
     * @private
     */
    IFColor.prototype._value = null;

    /**
     * Return the underlying color value
     * @returns {Array<{Number}>}
     */
    IFColor.prototype.getValue = function () {
        return this._value;
    };

    /** @override */
    IFColor.prototype.serialize = function () {
        return this._value ? JSON.stringify(this._value) : '';
    };

    /** @override */
    IFColor.prototype.deserialize = function (string) {
        if (string) {
            this._value = JSON.parse(string);
        }
    };

    /**
     * Converts and returns the underlying color as readable human string
     * @returns {String}
     */
    IFColor.prototype.toHumanString = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Converts and returns the underlying color as RGB Screen value
     * @param {Boolean} [noCMS] if set to true, no cms will be used
     * to convert to screen color
     * @returns {RGB}
     */
    IFColor.prototype.toScreen = function (noCMS) {
        throw new Error('Not Supported.');
    };

    /**
     * Converts and returns the underlying color as CSS Screen value
     * @param {Boolean} [noCMS] if set to true, no cms will be used
     * to convert to screen color
     * @param {Number} [opacity]
     * @returns {String}
     */
    IFColor.prototype.toScreenCSS = function (noCMS, opacity) {
        if (typeof opacity === 'number' && opacity !== 1.0) {
            var rgb = this.toScreen(noCMS);
            return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + opacity + ')';
        } else {
            return IFColor.rgbToHtmlHex(this.toScreen(noCMS));
        }
    };

    /** @override */
    IFColor.prototype.asCSSBackground = function (opacity) {
        var cssColor = this.toScreenCSS(false, opacity);
        return 'linear-gradient(' + cssColor + ', ' + cssColor + ')';
    };

    /** @override */
    IFColor.prototype.toString = function () {
        return "[Object IFColor]";
    };

    _.IFColor = IFColor;
})(this);