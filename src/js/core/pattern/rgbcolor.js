(function (_) {
    function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
        i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
        return i < 0 ? 0 : i > 255 ? 255 : i;
    }

    /**
     * A class representing a RGB Color
     * @param {RGB} rgb
     * @class GRGBColor
     * @extends GColor
     * @constructor
     */
    function GRGBColor(rgb) {
        rgb = rgb ? [clamp_css_byte(rgb[0]), clamp_css_byte(rgb[1]), clamp_css_byte(rgb[2])] : [0, 0, 0];
        GColor.call(this,  rgb);
    }

    GPattern.inherit('C', GRGBColor, GColor);

    GRGBColor.BLACK = new GRGBColor([0, 0, 0]);
    GRGBColor.WHITE = new GRGBColor([255, 255, 255]);

    /**
     * Construct a rgb color from a css color string
     * @param {String} cssString
     * @returns {GRGBColor} might be null
     */
    GRGBColor.fromCSSColor = function (cssString) {
        var values = GRGBColor.parseCSSColor(cssString);
        if (values) {
            return new GRGBColor(values.slice(0, 3));
        }
        return null;
    }

    /**
     * Parse a CSS Color String
     * @param {String} cssString
     * @return {Array<Number>} RGBA whereas alpha value is from 0-1.0 or null on error
     */
    GRGBColor.parseCSSColor = function (cssString) {
        // http://www.w3.org/TR/css3-color/
        var kCSSColorTable = {
            "transparent": [255, 255, 255, 0], "aliceblue": [240, 248, 255, 1.0],
            "antiquewhite": [250, 235, 215, 1.0], "aqua": [0, 255, 255, 1.0],
            "aquamarine": [127, 255, 212, 1.0], "azure": [240, 255, 255, 1.0],
            "beige": [245, 245, 220, 1.0], "bisque": [255, 228, 196, 1.0],
            "black": [0, 0, 0, 1.0], "blanchedalmond": [255, 235, 205, 1.0],
            "blue": [0, 0, 255, 1.0], "blueviolet": [138, 43, 226, 1.0],
            "brown": [165, 42, 42, 1.0], "burlywood": [222, 184, 135, 1.0],
            "cadetblue": [95, 158, 160, 1.0], "chartreuse": [127, 255, 0, 1.0],
            "chocolate": [210, 105, 30, 1.0], "coral": [255, 127, 80, 1.0],
            "cornflowerblue": [100, 149, 237, 1.0], "cornsilk": [255, 248, 220, 1.0],
            "crimson": [220, 20, 60, 1.0], "cyan": [0, 255, 255, 1.0],
            "darkblue": [0, 0, 139, 1.0], "darkcyan": [0, 139, 139, 1.0],
            "darkgoldenrod": [184, 134, 11, 1.0], "darkgray": [169, 169, 169, 1.0],
            "darkgreen": [0, 100, 0, 1.0], "darkgrey": [169, 169, 169, 1.0],
            "darkkhaki": [189, 183, 107, 1.0], "darkmagenta": [139, 0, 139, 1.0],
            "darkolivegreen": [85, 107, 47, 1.0], "darkorange": [255, 140, 0, 1.0],
            "darkorchid": [153, 50, 204, 1.0], "darkred": [139, 0, 0, 1.0],
            "darksalmon": [233, 150, 122, 1.0], "darkseagreen": [143, 188, 143, 1.0],
            "darkslateblue": [72, 61, 139, 1.0], "darkslategray": [47, 79, 79, 1.0],
            "darkslategrey": [47, 79, 79, 1.0], "darkturquoise": [0, 206, 209, 1.0],
            "darkviolet": [148, 0, 211, 1.0], "deeppink": [255, 20, 147, 1.0],
            "deepskyblue": [0, 191, 255, 1.0], "dimgray": [105, 105, 105, 1.0],
            "dimgrey": [105, 105, 105, 1.0], "dodgerblue": [30, 144, 255, 1.0],
            "firebrick": [178, 34, 34, 1.0], "floralwhite": [255, 250, 240, 1.0],
            "forestgreen": [34, 139, 34, 1.0], "fuchsia": [255, 0, 255, 1.0],
            "gainsboro": [220, 220, 220, 1.0], "ghostwhite": [248, 248, 255, 1.0],
            "gold": [255, 215, 0, 1.0], "goldenrod": [218, 165, 32, 1.0],
            "gray": [128, 128, 128, 1.0], "green": [0, 128, 0, 1.0],
            "greenyellow": [173, 255, 47, 1.0], "grey": [128, 128, 128, 1.0],
            "honeydew": [240, 255, 240, 1.0], "hotpink": [255, 105, 180, 1.0],
            "indianred": [205, 92, 92, 1.0], "indigo": [75, 0, 130, 1.0],
            "ivory": [255, 255, 240, 1.0], "khaki": [240, 230, 140, 1.0],
            "lavender": [230, 230, 250, 1.0], "lavenderblush": [255, 240, 245, 1.0],
            "lawngreen": [124, 252, 0, 1.0], "lemonchiffon": [255, 250, 205, 1.0],
            "lightblue": [173, 216, 230, 1.0], "lightcoral": [240, 128, 128, 1.0],
            "lightcyan": [224, 255, 255, 1.0], "lightgoldenrodyellow": [250, 250, 210, 1.0],
            "lightgray": [211, 211, 211, 1.0], "lightgreen": [144, 238, 144, 1.0],
            "lightgrey": [211, 211, 211, 1.0], "lightpink": [255, 182, 193, 1.0],
            "lightsalmon": [255, 160, 122, 1.0], "lightseagreen": [32, 178, 170, 1.0],
            "lightskyblue": [135, 206, 250, 1.0], "lightslategray": [119, 136, 153, 1.0],
            "lightslategrey": [119, 136, 153, 1.0], "lightsteelblue": [176, 196, 222, 1.0],
            "lightyellow": [255, 255, 224, 1.0], "lime": [0, 255, 0, 1.0],
            "limegreen": [50, 205, 50, 1.0], "linen": [250, 240, 230, 1.0],
            "magenta": [255, 0, 255, 1.0], "maroon": [128, 0, 0, 1.0],
            "mediumaquamarine": [102, 205, 170, 1.0], "mediumblue": [0, 0, 205, 1.0],
            "mediumorchid": [186, 85, 211, 1.0], "mediumpurple": [147, 112, 219, 1.0],
            "mediumseagreen": [60, 179, 113, 1.0], "mediumslateblue": [123, 104, 238, 1.0],
            "mediumspringgreen": [0, 250, 154, 1.0], "mediumturquoise": [72, 209, 204, 1.0],
            "mediumvioletred": [199, 21, 133, 1.0], "midnightblue": [25, 25, 112, 1.0],
            "mintcream": [245, 255, 250, 1.0], "mistyrose": [255, 228, 225, 1.0],
            "moccasin": [255, 228, 181, 1.0], "navajowhite": [255, 222, 173, 1.0],
            "navy": [0, 0, 128, 1.0], "oldlace": [253, 245, 230, 1.0],
            "olive": [128, 128, 0, 1.0], "olivedrab": [107, 142, 35, 1.0],
            "orange": [255, 165, 0, 1.0], "orangered": [255, 69, 0, 1.0],
            "orchid": [218, 112, 214, 1.0], "palegoldenrod": [238, 232, 170, 1.0],
            "palegreen": [152, 251, 152, 1.0], "paleturquoise": [175, 238, 238, 1.0],
            "palevioletred": [219, 112, 147, 1.0], "papayawhip": [255, 239, 213, 1.0],
            "peachpuff": [255, 218, 185, 1.0], "peru": [205, 133, 63, 1.0],
            "pink": [255, 192, 203, 1.0], "plum": [221, 160, 221, 1.0],
            "powderblue": [176, 224, 230, 1.0], "purple": [128, 0, 128, 1.0],
            "red": [255, 0, 0, 1.0], "rosybrown": [188, 143, 143, 1.0],
            "royalblue": [65, 105, 225, 1.0], "saddlebrown": [139, 69, 19, 1.0],
            "salmon": [250, 128, 114, 1.0], "sandybrown": [244, 164, 96, 1.0],
            "seagreen": [46, 139, 87, 1.0], "seashell": [255, 245, 238, 1.0],
            "sienna": [160, 82, 45, 1.0], "silver": [192, 192, 192, 1.0],
            "skyblue": [135, 206, 235, 1.0], "slateblue": [106, 90, 205, 1.0],
            "slategray": [112, 128, 144, 1.0], "slategrey": [112, 128, 144, 1.0],
            "snow": [255, 250, 250, 1.0], "springgreen": [0, 255, 127, 1.0],
            "steelblue": [70, 130, 180, 1.0], "tan": [210, 180, 140, 1.0],
            "teal": [0, 128, 128, 1.0], "thistle": [216, 191, 216, 1.0],
            "tomato": [255, 99, 71, 1.0], "turquoise": [64, 224, 208, 1.0],
            "violet": [238, 130, 238, 1.0], "wheat": [245, 222, 179, 1.0],
            "white": [255, 255, 255, 1.0], "whitesmoke": [245, 245, 245, 1.0],
            "yellow": [255, 255, 0, 1.0], "yellowgreen": [154, 205, 50]}

        function clamp_css_float(f) {  // Clamp to float 0.0 .. 1.0.
            return f < 0 ? 0 : f > 1 ? 1 : f;
        }

        function parse_css_int(str) {  // int or percentage.
            if (str[str.length - 1] === '%')
                return clamp_css_byte(parseFloat(str) / 100 * 255);
            return clamp_css_byte(parseInt(str));
        }

        function parse_css_float(str) {  // float or percentage.
            if (str[str.length - 1] === '%')
                return clamp_css_float(parseFloat(str) / 100);
            return clamp_css_float(parseFloat(str));
        }

        function css_hue_to_rgb(m1, m2, h) {
            if (h < 0) h += 1;
            else if (h > 1) h -= 1;

            if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
            if (h * 2 < 1) return m2;
            if (h * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - h) * 6;
            return m1;
        }


        // Remove all whitespace, not compliant, but should just be more accepting.
        var str = cssString.replace(/ /g, '').toLowerCase();

        // Color keywords (and transparent) lookup.
        if (str in kCSSColorTable) {
            return kCSSColorTable[str].slice();
        }

        // #abc and #abc123 syntax.
        if (str[0] === '#') {
            if (str.length === 4) {
                var iv = parseInt(str.substr(1), 16);
                if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
                return [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
                    (iv & 0xf0) | ((iv & 0xf0) >> 4),
                    (iv & 0xf) | ((iv & 0xf) << 4), 1.0];
            } else if (str.length === 7) {
                var iv = parseInt(str.substr(1), 16);
                if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
                return [(iv & 0xff0000) >> 16,
                    (iv & 0xff00) >> 8,
                    iv & 0xff, 1.0];
            }

            return null;
        }

        var op = str.indexOf('('), ep = str.indexOf(')');
        if (op !== -1 && ep + 1 === str.length) {
            var fname = str.substr(0, op);
            var params = str.substr(op + 1, ep - (op + 1)).split(',');
            var alpha = 100;  // To allow case fallthrough.
            switch (fname) {
                case 'rgba':
                    if (params.length !== 4) return null;
                    alpha = parse_css_float(params.pop());
                // Fall through.
                case 'rgb':
                    if (params.length !== 3) return null;
                    return [parse_css_int(params[0]),
                        parse_css_int(params[1]),
                        parse_css_int(params[2]),
                    alpha];
                case 'hsla':
                    if (params.length !== 4) return null;
                    alpha = parse_css_float(params.pop());
                // Fall through.
                case 'hsl':
                    if (params.length !== 3) return null;
                    var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
                    // NOTE(deanm): According to the CSS spec s/l should only be
                    // percentages, but we don't bother and let float or percentage.
                    var s = parse_css_float(params[1]);
                    var l = parse_css_float(params[2]);
                    var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
                    var m1 = l * 2 - m2;
                    return [clamp_css_byte(css_hue_to_rgb(m1, m2, h + 1 / 3) * 255),
                        clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                        clamp_css_byte(css_hue_to_rgb(m1, m2, h - 1 / 3) * 255), alpha];
                default:
                    return null;
            }
        }

        // Hack - try again by prepending dash
        return GRGBColor.parseCSSColor('#' + cssString);
    };

    GRGBColor.equals = function (left, right) {
        if (left instanceof GRGBColor && right instanceof  GRGBColor) {
            return GUtil.equals(left._value, right._value);
        }
        return false;
    };

    /** @override */
    GRGBColor.prototype.toHumanString = function () {
        return 'rgb ' +
            this._value[0] + ',' +
            this._value[1] + ',' +
            this._value[2];
    };

    /** @override */
    GRGBColor.prototype.toScreen = function (noCMS) {
        return this._value;
    };

    /** @override */
    GRGBColor.prototype.clone = function () {
        return new GRGBColor(this._value);
    };

    /** @override */
    GRGBColor.prototype.toString = function () {
        return "[Object GRGBColor]";
    };

    _.GRGBColor = GRGBColor;
})(this);