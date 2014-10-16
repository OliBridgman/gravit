(function (_) {
    function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
        i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
        return i < 0 ? 0 : i > 255 ? 255 : i;
    }

    /**
     * A class representing a RGB Color
     * @param {RGB} rgb
     * @class IFRGBColor
     * @extends IFColor
     * @constructor
     */
    function IFRGBColor(rgb) {
        rgb = rgb ? [clamp_css_byte(rgb[0]), clamp_css_byte(rgb[1]), clamp_css_byte(rgb[2])] : [0, 0, 0];
        IFColor.call(this,  rgb);
    }

    IFPattern.inherit('C', IFRGBColor, IFColor);

    IFRGBColor.BLACK = new IFRGBColor([0, 0, 0]);
    IFRGBColor.WHITE = new IFRGBColor([255, 255, 255]);

    /**
     * Parse a CSS Color String
     * @param {String} cssString
     * @return {IFRGBColor}
     */
    IFRGBColor.parseCSSColor = function (cssString) {
        // http://www.w3.org/TR/css3-color/
        var kCSSColorTable = {
            "aliceblue": [240, 248, 255],
            "antiquewhite": [250, 235, 215], "aqua": [0, 255, 255],
            "aquamarine": [127, 255, 212], "azure": [240, 255, 255],
            "beige": [245, 245, 220], "bisque": [255, 228, 196],
            "black": [0, 0, 0], "blanchedalmond": [255, 235, 205],
            "blue": [0, 0, 255], "blueviolet": [138, 43, 226],
            "brown": [165, 42, 42], "burlywood": [222, 184, 135],
            "cadetblue": [95, 158, 160], "chartreuse": [127, 255, 0],
            "chocolate": [210, 105, 30], "coral": [255, 127, 80],
            "cornflowerblue": [100, 149, 237], "cornsilk": [255, 248, 220],
            "crimson": [220, 20, 60], "cyan": [0, 255, 255],
            "darkblue": [0, 0, 139], "darkcyan": [0, 139, 139],
            "darkgoldenrod": [184, 134, 11], "darkgray": [169, 169, 169],
            "darkgreen": [0, 100, 0], "darkgrey": [169, 169, 169],
            "darkkhaki": [189, 183, 107], "darkmagenta": [139, 0, 139],
            "darkolivegreen": [85, 107, 47], "darkorange": [255, 140, 0],
            "darkorchid": [153, 50, 204], "darkred": [139, 0, 0],
            "darksalmon": [233, 150, 122], "darkseagreen": [143, 188, 143],
            "darkslateblue": [72, 61, 139], "darkslategray": [47, 79, 79],
            "darkslategrey": [47, 79, 79], "darkturquoise": [0, 206, 209],
            "darkviolet": [148, 0, 211], "deeppink": [255, 20, 147],
            "deepskyblue": [0, 191, 255], "dimgray": [105, 105, 105],
            "dimgrey": [105, 105, 105], "dodgerblue": [30, 144, 255],
            "firebrick": [178, 34, 34], "floralwhite": [255, 250, 240],
            "forestgreen": [34, 139, 34], "fuchsia": [255, 0, 255],
            "gainsboro": [220, 220, 220], "ghostwhite": [248, 248, 255],
            "gold": [255, 215, 0], "goldenrod": [218, 165, 32],
            "gray": [128, 128, 128], "green": [0, 128, 0],
            "greenyellow": [173, 255, 47], "grey": [128, 128, 128],
            "honeydew": [240, 255, 240], "hotpink": [255, 105, 180],
            "indianred": [205, 92, 92], "indigo": [75, 0, 130],
            "ivory": [255, 255, 240], "khaki": [240, 230, 140],
            "lavender": [230, 230, 250], "lavenderblush": [255, 240, 245],
            "lawngreen": [124, 252, 0], "lemonchiffon": [255, 250, 205],
            "lightblue": [173, 216, 230], "lightcoral": [240, 128, 128],
            "lightcyan": [224, 255, 255], "lightgoldenrodyellow": [250, 250, 210],
            "lightgray": [211, 211, 211], "lightgreen": [144, 238, 144],
            "lightgrey": [211, 211, 211], "lightpink": [255, 182, 193],
            "lightsalmon": [255, 160, 122], "lightseagreen": [32, 178, 170],
            "lightskyblue": [135, 206, 250], "lightslategray": [119, 136, 153],
            "lightslategrey": [119, 136, 153], "lightsteelblue": [176, 196, 222],
            "lightyellow": [255, 255, 224], "lime": [0, 255, 0],
            "limegreen": [50, 205, 50], "linen": [250, 240, 230],
            "magenta": [255, 0, 255], "maroon": [128, 0, 0],
            "mediumaquamarine": [102, 205, 170], "mediumblue": [0, 0, 205],
            "mediumorchid": [186, 85, 211], "mediumpurple": [147, 112, 219],
            "mediumseagreen": [60, 179, 113], "mediumslateblue": [123, 104, 238],
            "mediumspringgreen": [0, 250, 154], "mediumturquoise": [72, 209, 204],
            "mediumvioletred": [199, 21, 133], "midnightblue": [25, 25, 112],
            "mintcream": [245, 255, 250], "mistyrose": [255, 228, 225],
            "moccasin": [255, 228, 181], "navajowhite": [255, 222, 173],
            "navy": [0, 0, 128], "oldlace": [253, 245, 230],
            "olive": [128, 128, 0], "olivedrab": [107, 142, 35],
            "orange": [255, 165, 0], "orangered": [255, 69, 0],
            "orchid": [218, 112, 214], "palegoldenrod": [238, 232, 170],
            "palegreen": [152, 251, 152], "paleturquoise": [175, 238, 238],
            "palevioletred": [219, 112, 147], "papayawhip": [255, 239, 213],
            "peachpuff": [255, 218, 185], "peru": [205, 133, 63],
            "pink": [255, 192, 203], "plum": [221, 160, 221],
            "powderblue": [176, 224, 230], "purple": [128, 0, 128],
            "red": [255, 0, 0], "rosybrown": [188, 143, 143],
            "royalblue": [65, 105, 225], "saddlebrown": [139, 69, 19],
            "salmon": [250, 128, 114], "sandybrown": [244, 164, 96],
            "seagreen": [46, 139, 87], "seashell": [255, 245, 238],
            "sienna": [160, 82, 45], "silver": [192, 192, 192],
            "skyblue": [135, 206, 235], "slateblue": [106, 90, 205],
            "slategray": [112, 128, 144], "slategrey": [112, 128, 144],
            "snow": [255, 250, 250], "springgreen": [0, 255, 127],
            "steelblue": [70, 130, 180], "tan": [210, 180, 140],
            "teal": [0, 128, 128], "thistle": [216, 191, 216],
            "tomato": [255, 99, 71], "turquoise": [64, 224, 208],
            "violet": [238, 130, 238], "wheat": [245, 222, 179],
            "white": [255, 255, 255], "whitesmoke": [245, 245, 245],
            "yellow": [255, 255, 0], "yellowgreen": [154, 205, 50]}

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
            return new IFRGBColor(kCSSColorTable[str].slice());
        }

        // #abc and #abc123 syntax.
        if (str[0] === '#') {
            if (str.length === 4) {
                var iv = parseInt(str.substr(1), 16);
                if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
                return new IFRGBColor([((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
                    (iv & 0xf0) | ((iv & 0xf0) >> 4),
                    (iv & 0xf) | ((iv & 0xf) << 4)]);
            } else if (str.length === 7) {
                var iv = parseInt(str.substr(1), 16);
                if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
                return new IFRGBColor([(iv & 0xff0000) >> 16,
                    (iv & 0xff00) >> 8,
                    iv & 0xff]);
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
                    alpha = Math.round(parse_css_float(params.pop()) * 100);
                // Fall through.
                case 'rgb':
                    if (params.length !== 3) return null;
                    return new IFRGBColor([parse_css_int(params[0]),
                        parse_css_int(params[1]),
                        parse_css_int(params[2])]);
                case 'hsla':
                    if (params.length !== 4) return null;
                    alpha = Math.round(parse_css_float(params.pop()) * 100);
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
                    return new IFRGBColor([clamp_css_byte(css_hue_to_rgb(m1, m2, h + 1 / 3) * 255),
                        clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                        clamp_css_byte(css_hue_to_rgb(m1, m2, h - 1 / 3) * 255)]);
                default:
                    return null;
            }
        }

        // Hack - try again by prepending dash
        return IFRGBColor.parseCSSColor('#' + cssString);
    };

    IFRGBColor.equals = function (left, right) {
        if (left instanceof IFRGBColor && right instanceof  IFRGBColor) {
            return IFUtil.equals(left._value, right._value);
        }
        return false;
    };

    /** @override */
    IFRGBColor.prototype.toHumanString = function () {
        return 'rgb ' +
            this._value[0] + ',' +
            this._value[1] + ',' +
            this._value[2];
    };

    /** @override */
    IFRGBColor.prototype.toScreen = function (noCMS) {
        return this._value;
    };

    /** @override */
    IFRGBColor.prototype.clone = function () {
        return new IFRGBColor(this._value);
    };

    /** @override */
    IFRGBColor.prototype.toString = function () {
        return "[Object IFRGBColor]";
    };

    _.IFRGBColor = IFRGBColor;
})(this);