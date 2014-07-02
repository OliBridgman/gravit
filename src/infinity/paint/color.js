(function (_) {
    /**
     * A class representing a color
     * @param {IFColor.Type} type
     * @param {Array<Number>|String> [value]
     * @class IFColor
     * @constructor
     */
    function IFColor(type, value) {
        this._type = type;
        this._value = value && value instanceof Array ? value.slice() : value;
    }

    /**
     * Color's mime-type
     * @type {string}
     */
    IFColor.MIME_TYPE = "application/infinity+color";

    /**
     * @enum
     */
    IFColor.Type = {
        /** RGB Color - "rgb(0..255, 0..255, 0..255, 0..100)" */
        RGB: {
            key: 'rgb',
            space: IFColorSpace.RGB,
            fromString: function (string) {
                var result = [0, 0, 0, 0];
                var values = string.split(',');
                if (values.length !== 4) {
                    result = null;
                } else {
                    for (var i = 0; i < 4; ++i) {
                        var val = parseInt(values[i]);
                        if (isNaN(val) || val < 0 || (i === 3 && val > 100) || (i < 3 && val > 255)) {
                            result = null;
                            break;
                        } else {
                            result[i] = val;
                        }
                    }
                }
                return result;
            },
            toString: function (value) {
                return value.join(',');
            }
        },
        /** HSL Color - "hsl(0..360, 0..100, 0..100, 0..100)" */
        HSL: {
            key: 'hsl',
            space: IFColorSpace.RGB,
            fromString: function (string) {
                var result = [0, 0, 0, 0];
                var values = string.split(',');
                if (values.length !== 4) {
                    result = null;
                } else {
                    for (var i = 0; i < 4; ++i) {
                        var val = parseInt(values[i]);
                        if (isNaN(val) || val < 0 || (i === 0 && val > 360) || (i > 0 && val > 100)) {
                            result = null;
                            break;
                        } else {
                            result[i] = val;
                        }
                    }
                }
                return result;
            },
            toString: function (value) {
                return value.join(',');
            }
        },
        /** Tone Color - "tone(0..100, 0..100)" */
        Tone: {
            key: 'tone',
            space: IFColorSpace.RGB,
            fromString: function (string) {
                var result = [0, 0];
                var values = string.split(',');
                if (values.length !== 2) {
                    result = null;
                } else {
                    for (var i = 0; i < 2; ++i) {
                        var val = parseInt(values[i]);
                        if (isNaN(val) || val < 0 || val > 100) {
                            result = null;
                            break;
                        } else {
                            result[i] = val;
                        }
                    }
                }
                return result;
            },
            toString: function (value) {
                return value.join(',');
            }
        },
        /** CMYK Color - "cmyk(0..100, 0..100, 0..100)" */
        CMYK: {
            key: 'cmyk',
            space: IFColorSpace.CMYK,
            fromString: function (string) {
                var result = [0, 0, 0, 0];
                var values = string.split(',');
                if (values.length !== 4) {
                    result = null;
                } else {
                    for (var i = 0; i < 4; ++i) {
                        var val = parseInt(values[i]);
                        if (isNaN(val) || val < 0 || val > 100) {
                            result = null;
                            break;
                        } else {
                            result[i] = val;
                        }
                    }
                }
                return result;
            },
            toString: function (value) {
                return value.join(',');
            }
        },

        /** Reference to another color - "#ReferenceId" */
        Reference: {
            key: '#',
            space: IFColorSpace.None,
            fromString: function (string) {
                return string;
            },
            toString: function (value) {
                return value;
            }
        },

        /** Special white point - "white" - value = null */
        White: {
            key: 'white',
            space: IFColorSpace.None
        },
        /** Special black point - "black"- value = null */
        Black: {
            key: 'black',
            space: IFColorSpace.None
        },
        /** Special registration point - "registration" - value = null */
        Registration: {
            key: 'registration',
            space: IFColorSpace.None
        }
    };

    // Pre-defined color constants
    IFColor.BLACK = new IFColor(IFColor.Type.Black);
    IFColor.WHITE = new IFColor(IFColor.Type.White);

    IFColor.SELECTION_OUTLINE = new IFColor(IFColor.Type.RGB, [0, 168, 255, 100]);
    IFColor.HIGHLIGHT_OUTLINE = new IFColor(IFColor.Type.RGB, [0, 168, 255, 100]);


    /**
     * Returns a css3 background definition for the color value.
     * If the color has an alpha component, the background
     * definition will include a blended chessboard pattern. If
     * the color is null, only the chessboard pattern will be returned.
     * @param {IFColor} color the color to be used
     * @param {Number} [size] size of the chessboard pattern,
     * if not provided defaults to 4 pixels
     * @return {*} a css declaration object
     */
    IFColor.blendedCSSBackground = function (color, size) {
        var colorRGB = color ? color.asRGB() : null;
        if (colorRGB && colorRGB[3] === 100) {
            return {
                'background': color.asCSSString()
            };
        } else {
            size = size || 4;

            var alpha = colorRGB ? colorRGB[3] / 100.0 : 1;
            var colorBack = [255, 255, 255];
            var colorFore = [205, 205, 205];
            colorBack = ifUtil.rgbToHtmlHex(colorRGB ? ifUtil.blendRGBColors(colorBack, colorRGB, alpha) : colorBack);
            colorFore = ifUtil.rgbToHtmlHex(colorRGB ? ifUtil.blendRGBColors(colorFore, colorRGB, alpha) : colorFore);

            return {
                'background': 'linear-gradient(45deg, ' + colorFore + ' 25%, transparent 25%, transparent 75%, ' + colorFore + ' 75%, ' + colorFore + '),' +
                    'linear-gradient(45deg, ' + colorFore + ' 25%, transparent 25%, transparent 75%, ' + colorFore + ' 75%, ' + colorFore + '), ' +
                    colorBack,
                'background-size': (size * 2).toString() + 'px ' + (size * 2).toString() + 'px',
                'background-position': '0 0,' + size + 'px ' + size + 'px'
            };
        }
    };

    /**
     * Parse a string into a IFColor
     * @param {String} string
     * @return {IFColor}
     */
    IFColor.parseColor = function (string) {
        if (!string || string === "") {
            return null;
        }

        for (var typeKey in IFColor.Type) {
            var type = IFColor.Type[typeKey];
            if (string.indexOf(type.key) === 0) {
                if (type.fromString) {
                    var value = type.fromString(string.substring(type.key.length));
                    if (value) {
                        return new IFColor(type, value);
                    }
                } else {
                    return new IFColor(type);
                }
            }
        }

        return null;
    };

    /**
     * Parse a CSS Color String
     * @param {String} cssString
     * @return {IFColor}
     */
    IFColor.parseCSSColor = function (cssString) {
        // http://www.w3.org/TR/css3-color/
        var kCSSColorTable = {
            "transparent": [0, 0, 0, 0], "aliceblue": [240, 248, 255, 100],
            "antiquewhite": [250, 235, 215, 100], "aqua": [0, 255, 255, 100],
            "aquamarine": [127, 255, 212, 100], "azure": [240, 255, 255, 100],
            "beige": [245, 245, 220, 100], "bisque": [255, 228, 196, 100],
            "black": [0, 0, 0, 100], "blanchedalmond": [255, 235, 205, 100],
            "blue": [0, 0, 255, 100], "blueviolet": [138, 43, 226, 100],
            "brown": [165, 42, 42, 100], "burlywood": [222, 184, 135, 100],
            "cadetblue": [95, 158, 160, 100], "chartreuse": [127, 255, 0, 100],
            "chocolate": [210, 105, 30, 100], "coral": [255, 127, 80, 100],
            "cornflowerblue": [100, 149, 237, 100], "cornsilk": [255, 248, 220, 100],
            "crimson": [220, 20, 60, 100], "cyan": [0, 255, 255, 100],
            "darkblue": [0, 0, 139, 100], "darkcyan": [0, 139, 139, 100],
            "darkgoldenrod": [184, 134, 11, 100], "darkgray": [169, 169, 169, 100],
            "darkgreen": [0, 100, 0, 100], "darkgrey": [169, 169, 169, 100],
            "darkkhaki": [189, 183, 107, 100], "darkmagenta": [139, 0, 139, 100],
            "darkolivegreen": [85, 107, 47, 100], "darkorange": [255, 140, 0, 100],
            "darkorchid": [153, 50, 204, 100], "darkred": [139, 0, 0, 100],
            "darksalmon": [233, 150, 122, 100], "darkseagreen": [143, 188, 143, 100],
            "darkslateblue": [72, 61, 139, 100], "darkslategray": [47, 79, 79, 100],
            "darkslategrey": [47, 79, 79, 100], "darkturquoise": [0, 206, 209, 100],
            "darkviolet": [148, 0, 211, 100], "deeppink": [255, 20, 147, 100],
            "deepskyblue": [0, 191, 255, 100], "dimgray": [105, 105, 105, 100],
            "dimgrey": [105, 105, 105, 100], "dodgerblue": [30, 144, 255, 100],
            "firebrick": [178, 34, 34, 100], "floralwhite": [255, 250, 240, 100],
            "forestgreen": [34, 139, 34, 100], "fuchsia": [255, 0, 255, 100],
            "gainsboro": [220, 220, 220, 100], "ghostwhite": [248, 248, 255, 100],
            "gold": [255, 215, 0, 100], "goldenrod": [218, 165, 32, 100],
            "gray": [128, 128, 128, 100], "green": [0, 128, 0, 100],
            "greenyellow": [173, 255, 47, 100], "grey": [128, 128, 128, 100],
            "honeydew": [240, 255, 240, 100], "hotpink": [255, 105, 180, 100],
            "indianred": [205, 92, 92, 100], "indigo": [75, 0, 130, 100],
            "ivory": [255, 255, 240, 100], "khaki": [240, 230, 140, 100],
            "lavender": [230, 230, 250, 100], "lavenderblush": [255, 240, 245, 100],
            "lawngreen": [124, 252, 0, 100], "lemonchiffon": [255, 250, 205, 100],
            "lightblue": [173, 216, 230, 100], "lightcoral": [240, 128, 128, 100],
            "lightcyan": [224, 255, 255, 100], "lightgoldenrodyellow": [250, 250, 210, 100],
            "lightgray": [211, 211, 211, 100], "lightgreen": [144, 238, 144, 100],
            "lightgrey": [211, 211, 211, 100], "lightpink": [255, 182, 193, 100],
            "lightsalmon": [255, 160, 122, 100], "lightseagreen": [32, 178, 170, 100],
            "lightskyblue": [135, 206, 250, 100], "lightslategray": [119, 136, 153, 100],
            "lightslategrey": [119, 136, 153, 100], "lightsteelblue": [176, 196, 222, 100],
            "lightyellow": [255, 255, 224, 100], "lime": [0, 255, 0, 100],
            "limegreen": [50, 205, 50, 100], "linen": [250, 240, 230, 100],
            "magenta": [255, 0, 255, 100], "maroon": [128, 0, 0, 100],
            "mediumaquamarine": [102, 205, 170, 100], "mediumblue": [0, 0, 205, 100],
            "mediumorchid": [186, 85, 211, 100], "mediumpurple": [147, 112, 219, 100],
            "mediumseagreen": [60, 179, 113, 100], "mediumslateblue": [123, 104, 238, 100],
            "mediumspringgreen": [0, 250, 154, 100], "mediumturquoise": [72, 209, 204, 100],
            "mediumvioletred": [199, 21, 133, 100], "midnightblue": [25, 25, 112, 100],
            "mintcream": [245, 255, 250, 100], "mistyrose": [255, 228, 225, 100],
            "moccasin": [255, 228, 181, 100], "navajowhite": [255, 222, 173, 100],
            "navy": [0, 0, 128, 100], "oldlace": [253, 245, 230, 100],
            "olive": [128, 128, 0, 100], "olivedrab": [107, 142, 35, 100],
            "orange": [255, 165, 0, 100], "orangered": [255, 69, 0, 100],
            "orchid": [218, 112, 214, 100], "palegoldenrod": [238, 232, 170, 100],
            "palegreen": [152, 251, 152, 100], "paleturquoise": [175, 238, 238, 100],
            "palevioletred": [219, 112, 147, 100], "papayawhip": [255, 239, 213, 100],
            "peachpuff": [255, 218, 185, 100], "peru": [205, 133, 63, 100],
            "pink": [255, 192, 203, 100], "plum": [221, 160, 221, 100],
            "powderblue": [176, 224, 230, 100], "purple": [128, 0, 128, 100],
            "red": [255, 0, 0, 100], "rosybrown": [188, 143, 143, 100],
            "royalblue": [65, 105, 225, 100], "saddlebrown": [139, 69, 19, 100],
            "salmon": [250, 128, 114, 100], "sandybrown": [244, 164, 96, 100],
            "seagreen": [46, 139, 87, 100], "seashell": [255, 245, 238, 100],
            "sienna": [160, 82, 45, 100], "silver": [192, 192, 192, 100],
            "skyblue": [135, 206, 235, 100], "slateblue": [106, 90, 205, 100],
            "slategray": [112, 128, 144, 100], "slategrey": [112, 128, 144, 100],
            "snow": [255, 250, 250, 100], "springgreen": [0, 255, 127, 100],
            "steelblue": [70, 130, 180, 100], "tan": [210, 180, 140, 100],
            "teal": [0, 128, 128, 100], "thistle": [216, 191, 216, 100],
            "tomato": [255, 99, 71, 100], "turquoise": [64, 224, 208, 100],
            "violet": [238, 130, 238, 100], "wheat": [245, 222, 179, 100],
            "white": [255, 255, 255, 100], "whitesmoke": [245, 245, 245, 100],
            "yellow": [255, 255, 0, 100], "yellowgreen": [154, 205, 50, 100]}

        function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
            i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
            return i < 0 ? 0 : i > 255 ? 255 : i;
        }

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
        if (str in kCSSColorTable) return new IFColor(IFColor.Type.RGB, kCSSColorTable[str].slice());  // dup.

        // #abc and #abc123 syntax.
        if (str[0] === '#') {
            if (str.length === 4) {
                var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
                if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
                return new IFColor(IFColor.Type.RGB, [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
                    (iv & 0xf0) | ((iv & 0xf0) >> 4),
                    (iv & 0xf) | ((iv & 0xf) << 4),
                    100]);
            } else if (str.length === 7) {
                var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
                if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
                return new IFColor(IFColor.Type.RGB, [(iv & 0xff0000) >> 16,
                    (iv & 0xff00) >> 8,
                    iv & 0xff,
                    100]);
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
                    return new IFColor(IFColor.Type.RGB, [parse_css_int(params[0]),
                        parse_css_int(params[1]),
                        parse_css_int(params[2]),
                        alpha]);
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
                    return new IFColor(IFColor.Type.RGB, [clamp_css_byte(css_hue_to_rgb(m1, m2, h + 1 / 3) * 255),
                        clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                        clamp_css_byte(css_hue_to_rgb(m1, m2, h - 1 / 3) * 255),
                        alpha]);
                default:
                    return null;
            }
        }

        return null;
    };

    /**
     * Compare two colors for equality Also takes care of null parameters
     * @param {IFColor} left left side color
     * @param {IFColor} right right side color
     * @return {Boolean} true if left and right are equal (also if they're null!)
     * @version 1.0
     */
    IFColor.equals = function (left, right) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (left._type === right._type) {
                var v1 = left._value;
                var v2 = right._value;

                if (!v1 && v1 === v2) {
                    return true;
                }

                if (v1 instanceof Array && v2 instanceof Array) {
                    if (v1.length !== v2.length) {
                        return false;
                    }

                    for (var i = 0; i < v1.length; ++i) {
                        if (v1[i] !== v2[i]) {
                            return false;
                        }
                    }

                    return true;
                } else {
                    return v1 === v2;
                }
            }
        }
        return false;
    };

    /**
     * @type {IFColor.Type}
     * @private
     */
    IFColor.prototype._type = null;

    /**
     * @type {Array<Number>|String|null}
     * @private
     */
    IFColor.prototype._value = null;

    /**
     * @returns {IFColor.Type}
     */
    IFColor.prototype.getType = function () {
        return this._type;
    };

    /**
     * DO NOT MODIFY RETURN VALUE!!!
     * @returns {Array<Number>|String|null}
     */
    IFColor.prototype.getValue = function () {
        return this._value;
    };

    /**
     * @return {IFColorSpace}
     */
    IFColor.prototype.getSpace = function () {
        return this._type.space;
    };

    /**
     * Return new instanceof this color with type RGB
     * @returns {IFColor}
     */
    IFColor.prototype.toRGB = function () {
        return new IFColor(IFColor.Type.RGB, this.asRGB());
    };

    /**
     * Return new instanceof this color with type HSL
     * @returns {IFColor}
     */
    IFColor.prototype.toHSL = function () {
        return new IFColor(IFColor.Type.HSL, this.asHSL());
    };

    /**
     * Return new instance of this color with type Tone
     * @returns {IFColor}
     */
    IFColor.prototype.toTone = function () {
        return new IFColor(IFColor.Type.Tone, this.asTone());
    };

    /**
     * Return new instanceof this color with type CMYK
     * @returns {IFColor}
     */
    IFColor.prototype.toCMYK = function () {
        return new IFColor(IFColor.Type.CMYK, this.asCMYK());
    };

    /**
     * Return new instanceof this color converted
     * into a given color type. If the type is not a real
     * color space like a reference or white black then
     * this function will return a copy of the same color
     * like this one with type RGB
     * @param {IFColor.Type} type the target type
     * @returns {IFColor}
     */
    IFColor.prototype.toType = function (type) {
        switch (type) {
            case IFColor.Type.HSL:
                return this.toHSL();
            case IFColor.Type.CMYK:
                return this.toCMYK();
            case IFColor.Type.Tone:
                return this.toTone();
            default:
                return this.toRGB();
        }
    };

    /**
     * Return color as RGB-Array
     * @return Array<Number> (0..255, 0..255, 0..255, 0..100)
     */
    IFColor.prototype.asRGB = function () {
        if (this._type === IFColor.Type.RGB) {
            return this._value.slice();
        } else if (this._type === IFColor.Type.HSL) {
            var h = this._value[0] / 360;
            var s = this._value[1] / 100;
            var l = this._value[2] / 100;
            var r, g, b;
            var temp1, temp2, temp3;
            if (s === 0) {
                r = g = b = l;
            } else {
                if (l < 0.5) temp2 = l * (1 + s);
                else temp2 = (l + s) - (s * l);
                temp1 = 2 * l - temp2;

                // calculate red
                temp3 = h + (1 / 3);
                if (temp3 < 0) temp3 += 1;
                if (temp3 > 1) temp3 -= 1;
                if ((6 * temp3) < 1) r = temp1 + (temp2 - temp1) * 6 * temp3;
                else if ((2 * temp3) < 1) r = temp2;
                else if ((3 * temp3) < 2) r = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
                else r = temp1;

                // calculate green
                temp3 = h;
                if (temp3 < 0) temp3 += 1;
                if (temp3 > 1) temp3 -= 1;
                if ((6 * temp3) < 1) g = temp1 + (temp2 - temp1) * 6 * temp3;
                else if ((2 * temp3) < 1) g = temp2;
                else if ((3 * temp3) < 2) g = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
                else g = temp1;

                // calculate blue
                temp3 = h - (1 / 3);
                if (temp3 < 0) temp3 += 1;
                if (temp3 > 1) temp3 -= 1;
                if ((6 * temp3) < 1) b = temp1 + (temp2 - temp1) * 6 * temp3;
                else if ((2 * temp3) < 1) b = temp2;
                else if ((3 * temp3) < 2) b = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
                else b = temp1;
            }

            var R = Math.min(255, Math.max(0, Math.round(r * 255)));
            var G = Math.min(255, Math.max(0, Math.round(g * 255)));
            var B = Math.min(255, Math.max(0, Math.round(b * 255)));

            return [R, G, B, this._value[3]];
        } else if (this._type === IFColor.Type.Tone) {
            var t = 255 - Math.min(255, Math.max(0, Math.round(this._value[0] / 100 * 255)));
            return [t, t, t, this._value[1]];
        } else if (this._type === IFColor.Type.CMYK) {
            // CMYK -> CMY
            var c = this._value[0] / 100;
            var m = this._value[1] / 100;
            var y = this._value[2] / 100;
            var k = this._value[3] / 100;

            var C = (c * (1 - k) + k);
            var M = (m * (1 - k) + k);
            var Y = (y * (1 - k) + k);

            // CMY -> RGB
            var R = Math.min(255, Math.max(0, Math.round((1 - C) * 255)));
            var G = Math.min(255, Math.max(0, Math.round((1 - M) * 255)));
            var B = Math.min(255, Math.max(0, Math.round((1 - Y) * 255)));

            return [R, G, B, 100];
        } else if (this._type === IFColor.Type.White) {
            return [255, 255, 255, 100];
        } else if (this._type === IFColor.Type.Black) {
            return [0, 0, 0, 100];
        } else if (this._type === IFColor.Type.Registration) {
            return [0, 0, 0, 100];
        } else {
            throw new Error('Unable to convert to rgb from color type.');
        }
    };

    /**
     * Return color as 32-Bit integer
     * @return {Number}
     */
    IFColor.prototype.asRGBInt = function () {
        var rgb = this.asRGB();
        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        var a = Math.round(rgb[3] * 2.55);

        if (ifSystem.littleEndian) {
            return (a << 24) | (b << 16) | (g << 8) | r;
        } else {
            return (r << 24) | (g << 16) | (b << 8) | a;
        }
    };

    /**
     * Return color as HSL-Array
     * @return Array<Number> (0..360, 0..100, 0..100, 0..100)
     */
    IFColor.prototype.asHSL = function () {
        if (this._type === IFColor.Type.HSL) {
            return this._value.slice();
        } else {
            var rgb = this.asRGB();

            var r = rgb[0] / 255,
                g = rgb[1] / 255,
                b = rgb[2] / 255,
                a = rgb[3],
                min = Math.min(r, g, b),
                max = Math.max(r, g, b),
                chroma = max - min,
                h,
                s,
                l = (max + min) / 2;
            if (chroma === 0) {
                // No chroma
                h = 0;
                s = 0;
            } else {
                // Chromatic data
                if (l < 0.5) s = chroma / (max + min);
                else s = chroma / (2 - max - min);
                var DR = (((max - r) / 6) + (chroma / 2)) / chroma;
                var DG = (((max - g) / 6) + (chroma / 2)) / chroma;
                var DB = (((max - b) / 6) + (chroma / 2)) / chroma;
                if (r === max) h = DB - DG;
                else if (g === max) h = (1 / 3) + DR - DB;
                else if (b === max) h = (2 / 3) + DG - DR;
                if (h < 0) h += 1;
                if (h > 1) h -= 1;
            }

            var H = Math.min(360, Math.max(0, Math.round(h * 360)));
            var S = Math.min(100, Math.max(0, Math.round(s * 100)));
            var L = Math.min(100, Math.max(0, Math.round(l * 100)));

            return [H, S, L, a];
        }
    };

    /**
     * Return color as Tone
     * @return {Array<Number>} (0..100, 0..100)
     */
    IFColor.prototype.asTone = function () {
        if (this._type === IFColor.Type.Tone) {
            return this._value.slice();
        } else {
            var rgb = this.asRGB();

            var r = rgb[0] / 255.0;
            var g = rgb[1] / 255.0;
            var b = rgb[2] / 255.0;
            var a = rgb[3];

            // linear tone
            var t = 0.299 * r + 0.587 * g + 0.114 * b;
            var T = 100 - Math.min(100, Math.max(0, Math.round(t * 100)));

            return [T, a];
        }
    };

    /**
     * Return color as CMYK-Array
     * @return Array<Number> (0..100, 0..100, 0.100, 0..100)
     */
    IFColor.prototype.asCMYK = function () {
        if (this._type === IFColor.Type.CMYK) {
            return this._value.slice();
        } else {
            var rgb = this.asRGB();

            // RGB -> CMY
            var c = 1 - (rgb[0] / 255);
            var m = 1 - (rgb[1] / 255);
            var y = 1 - (rgb[2] / 255);
            var k = Math.min(y, Math.min(m, Math.min(c, 1)));
            var a = rgb[3] / 100;

            // CMY -> CMYK
            var C = Math.round((c - k) / (1 - k) * 100 * a);
            var M = Math.round((m - k) / (1 - k) * 100 * a);
            var Y = Math.round((y - k) / (1 - k) * 100 * a);
            var K = k * 100 * a;

            return [C, M, Y, K];
        }
    };

    /**
     * Return color as XYZ-Array
     * @param Array<Number> whitePointReference the whitepoint
     * reference as XYZ (0..1.0, 0..1.0, 0..1.0)
     * @return Array<Number> (0..1.0, 0..1.0, 0..1.0)
     */
    IFColor.prototype.asXYZ = function (whitePointReference) {
        var rgb = this.asRGB();
        var whitePointReference = whitePointReference ? whitePointReference : [];

        // TODO : Calculate matrix and convert
    };

    /**
     * Return color as LAB-Array
     * @param Array<Number> whitePointReference the whitepoint
     * reference as XYZ (0..1.0, 0..1.0, 0..1.0)
     * @return Array<Number> TODO : Output description ranges
     */
    IFColor.prototype.asLAB = function (whitePointReference) {
        var xyz = this.asXYZ(whitePointReference);

        var convert = function (channel) {
            return channel > 0.008856 ?
                Math.pow(channel, 1 / 3) :
                7.787037 * channel + 4 / 29;
        };

        var x = convert(xyz[0] / 95.047);
        var y = convert(xyz[1] / 100.000);
        var z = convert(xyz[2] / 108.883);

        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
    };

    /**
     * Return string representation of the underlying color
     * @return {String}
     */
    IFColor.prototype.asString = function () {
        var result = this._type.key;
        if (this._type.toString) {
            result += this._type.toString(this._value);
        }
        return result;
    };

    /**
     * Return CSS-Compatible string representation of the underlying color
     * @return {String}
     */
    IFColor.prototype.asCSSString = function () {
        var rgb = this.asRGB();
        if (rgb[3] === 100) {
            return this.asHTMLHexString();
        } else {
            return 'rgba(' + rgb[0].toString() + ',' + rgb[1].toString() + ',' + rgb[2].toString() + ',' + (rgb[3] / 100.0).toString() + ')';
        }
    };

    /**
     * Return a html 6-digit hex color code excluding any alpha component
     * @return {String}
     */
    IFColor.prototype.asHTMLHexString = function () {
        var rgb = this.asRGB();

        var bin = rgb[0] << 16 | rgb[1] << 8 | rgb[2];
        return '#' + (function (h) {
            return new Array(7 - h.length).join("0") + h
        })(bin.toString(16).toUpperCase());
    };

    /**
     * Return new instanceof of this color with a given tint
     * @param {Number} tint the tint from 0..100
     * @returns {IFColor}
     */
    IFColor.prototype.withTint = function (tint) {
        if (this._type === IFColor.Type.CMYK) {
            // Special handling for CMYK
            var factor = tint / 100.0;
            var cmyk = this._value.slice();
            for (var i = 0; i < 4; ++i) {
                cmyk[i] = Math.round(cmyk[i] * factor);
            }
            return new IFColor(IFColor.Type.CMYK, cmyk);
        } else {
            // All others use rgb and try to convert back to source type
            var factor = 1.0 - (tint / 100.0);
            var rgb = this.asRGB();
            rgb[0] = Math.round(((255 - rgb[0]) * factor) + rgb[0]);
            rgb[1] = Math.round(((255 - rgb[1]) * factor) + rgb[1]);
            rgb[2] = Math.round(((255 - rgb[2]) * factor) + rgb[2]);

            return new IFColor(IFColor.Type.RGB, rgb).toType(this._type);
        }
    };

    /**
     * Return new instanceof of this color with a given shade
     * @param {Number} shade the shade from 0..100
     * @returns {IFColor}
     */
    IFColor.prototype.withShade = function (shade) {
        if (this._type === IFColor.Type.CMYK) {
            // Special handling for CMYK
            var cmyk = this.asCMYK();
            cmyk[3] = shade;
            return new IFColor(IFColor.Type.CMYK, cmyk).toType(this._type);
        } else {
            // All others use rgb and try to convert back to source tpye
            var factor = 1.0 - (shade / 100.0);
            var rgb = this.asRGB();
            rgb[0] = Math.round(rgb[0] * factor);
            rgb[1] = Math.round(rgb[1] * factor);
            rgb[2] = Math.round(rgb[2] * factor);

            return new IFColor(IFColor.Type.RGB, rgb).toType(this._type);
        }
    };

    /**
     * Return new instanceof of this color with a given tone
     * @param {Number} tone the tone from 0..100
     * @returns {IFColor}
     */
    IFColor.prototype.withTone = function (tone) {
        return this.withTint(tone).withShade(tone);
    };

    /** @override */
    IFColor.prototype.toString = function () {
        return "[Object IFColor]";
    };

    _.IFColor = IFColor;
})(this);