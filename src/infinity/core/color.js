(function (_) {
    /**
     * A static color class to work with colors
     * @class GColor
     * @constructor
     * @version 1.0
     */
    function GColor() {
    };

    function _build_color(r, g, b, a) {
        if (typeof a != "number") a = 255;
        if (gSystem.littleEndian) {
            return (a << 24) | (b << 16) | (g << 8) | r;
        } else {
            return (r << 24) | (g << 16) | (b << 8) | a;
        }
    };

    /**
     * Constant about preset colors
     */
    GColor.PRESET = {
        darkMagenta: {
            back: _build_color(177, 63, 148),
            fore: _build_color(246, 231, 239)
        },
        lightMagenta: {
            back: _build_color(244, 182, 219),
            fore: _build_color(109, 34, 93)
        },
        darkGreen: {
            back: _build_color(66, 126, 83),
            fore: _build_color(222, 229, 198)
        },
        lightGreen: {
            back: _build_color(201, 219, 156),
            fore: _build_color(36, 66, 40)
        },
        darkBlue: {
            back: _build_color(60, 104, 187),
            fore: _build_color(219, 225, 235)
        },
        lightBlue: {
            back: _build_color(170, 209, 235),
            fore: _build_color(9, 55, 58)
        },
        darkRed: {
            back: _build_color(199, 63, 39),
            fore: _build_color(240, 222, 222)
        },
        lightRed: {
            back: _build_color(239, 189, 189),
            fore: _build_color(84, 21, 21)
        },
        darkCyan: {
            back: _build_color(0, 142, 170),
            fore: _build_color(235, 243, 247)
        },
        darkBrown: {
            back: _build_color(144, 100, 97),
            fore: _build_color(254, 245, 215)
        },
        darkBrown2: {
            back: _build_color(73, 60, 61),
            fore: _build_color(231, 232, 230)
        },
        lightBrown: {
            back: _build_color(206, 197, 198),
            fore: _build_color(26, 27, 6)
        },
        darkOrange: {
            back: _build_color(225, 112, 0),
            fore: _build_color(247, 230, 216)
        },
        lightOrange: {
            back: _build_color(250, 205, 170),
            fore: _build_color(127, 61, 6)
        },
        darkPurple: {
            back: _build_color(103, 67, 179),
            fore: _build_color(230, 223, 235)
        },
        lightPurple: {
            back: _build_color(182, 195, 219),
            fore: _build_color(21, 41, 81)
        },
        lightPurple2: {
            back: _build_color(218, 202, 224),
            fore: _build_color(42, 20, 86)
        },
        lightYellow: {
            back: _build_color(255, 237, 164),
            fore: _build_color(76, 53, 53)
        }
    };

    /** Array of presets in their natural order */
    GColor.PRESETS = ['darkMagenta', 'lightMagenta', 'darkGreen', 'lightGreen', 'darkBlue', 'lightBlue', 'darkRed',
        'lightRed', 'darkCyan', 'darkBrown', 'darkBrown2', 'lightBrown', 'darkOrange', 'lightOrange', 'darkPurple',
        'lightPurple', 'lightPurple2', 'lightYellow'];

    /**
     * Encode rgba compontents into a 32bit int color.
     * This takes care on big or little endianess
     * @param {Number} r getRed channel (0..255)
     * @param {Number} g getGreen channel (0..255)
     * @param {Number} b getBlue channel (0..255)
     * @param {Number} [a] getAlpha channel, defaults to 255 (0..255)
     * @returns {Number} 32bit-encoded color value
     * @version 1.0
     */
    GColor.prototype.build = function (r, g, b, a) {
        return _build_color(r, g, b, a);
    };

    /**
     * Extract the red component from a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to extract from
     * @return {Number} extract channel component value
     * @version 1.0
     */
    GColor.prototype.getRed = function (color) {
        if (gSystem.littleEndian) {
            return color & 255;
        } else {
            return color >> 24 & 255;
        }
    };

    /**
     * Set the red component for a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to set a new component to
     * @param {Number} value the new channel value (0..255)
     * @return {Number} a new color with modified channel
     * @version 1.0
     */
    GColor.prototype.setRed = function (color, value) {
        // TODO : Optimize this
        return this.build(value, this.getGreen(color), this.getBlue(color), this.getAlpha(color));
    };

    /**
     * Extract the green component from a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to extract from
     * @return {Number} extract channel component value
     * @version 1.0
     */
    GColor.prototype.getGreen = function (color) {
        if (gSystem.littleEndian) {
            return color >> 8 & 255;
        } else {
            return color >> 16 & 255;
        }
    };

    /**
     * Set the green component for a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to set a new component to
     * @param {Number} value the new channel value (0..255)
     * @return {Number} a new color with modified channel
     * @version 1.0
     */
    GColor.prototype.setGreen = function (color, value) {
        // TODO : Optimize this
        return this.build(this.getRed(color), value, this.getBlue(color), this.getAlpha(color));
    };

    /**
     * Extract the blue component from a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to extract from
     * @return {Number} extract channel component value
     * @version 1.0
     */
    GColor.prototype.getBlue = function (color) {
        if (gSystem.littleEndian) {
            return color >> 16 & 255;
        } else {
            return color >> 8 & 255;
        }
    };

    /**
     * Set the blue component for a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to set a new component to
     * @param {Number} value the new channel value (0..255)
     * @return {Number} a new color with modified channel
     * @version 1.0
     */
    GColor.prototype.setBlue = function (color, value) {
        // TODO : Optimize this
        return this.build(this.getRed(color), this.getGreen(color), value, this.getAlpha(color));
    };

    /**
     * Extract the alpha component from a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to extract from
     * @return {Number} extract channel component value
     * @version 1.0
     */
    GColor.prototype.getAlpha = function (color) {
        if (gSystem.littleEndian) {
            return color >> 24 & 255;
        } else {
            return color & 255;
        }
    };

    /**
     * Set the alpha component for a color.
     * This takes care on big or little endianess
     * @param {Number} color the color to set a new component to
     * @param {Number} value the new channel value (0..255)
     * @return {Number} a new color with modified channel
     * @version 1.0
     */
    GColor.prototype.setAlpha = function (color, value) {
        // TODO : Optimize this
        return this.build(this.getRed(color), this.getGreen(color), this.getBlue(color), value);
    };

    var HEX_ALPHA = "0123456789ABCDEF";

    /**
     * Convert a 32bit color into the shortest css representation
     * @param {Number} color the color to convert to css
     * @return {String} css color value
     * @version 1.0
     */
    GColor.prototype.toCSS = function (color) {
        var r = this.getRed(color);
        var g = this.getGreen(color);
        var b = this.getBlue(color);
        var a = this.getAlpha(color);

        if (a == 255) {
            return "#" + HEX_ALPHA.charAt((r - r % 16) / 16) + HEX_ALPHA.charAt(r % 16) +
                HEX_ALPHA.charAt((g - g % 16) / 16) + HEX_ALPHA.charAt(g % 16) +
                HEX_ALPHA.charAt((b - b % 16) / 16) + HEX_ALPHA.charAt(b % 16);
        } else {
            return "rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + (this.getAlpha(color) / 255.0).toFixed(4) + ")";
        }
    };

    // TODO : Read/Synch with global settings
    /**
     * Default color for selection outlining
     * @type Number
     * @version 1.0
     */
    GColor.prototype.selectionOutline = GColor.prototype.build(0, 168, 255, 255);

    /**
     * Default color for highlight outlining
     * @type Number
     * @version 1.0
     */
    GColor.prototype.highlightOutline = GColor.prototype.build(255, 0, 0, 255);

    _.GColor = GColor;
    _.gColor = new GColor();
})(this);