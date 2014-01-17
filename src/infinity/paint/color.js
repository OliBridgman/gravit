(function (_) {
    /**
     * A class representing a color
     * @param {GXColor.Type} type
     * @param {Array<Number>|String> [value]
     * @class GXColor
     * @constructor
     */
    function GXColor(type, value) {
        this._type = type;
        this._value = value && value instanceof Array ? value.slice() : value;
    }

    /**
     * Parse a string
     * @param string
     */
    GXColor.parseColor = function (string) {
        if (!string || string === "") {
            return null;
        }

        for (var typeKey in GXColor.Type) {
            var type = GXColor.Type[typeKey];
            if (string.indexOf(type.key) === 0) {
                if (type.fromString) {
                    var value = type.fromString(string.substring(type.key.length));
                    if (value) {
                        return new GXColor(type, value);
                    }
                } else {
                    return new GXColor(type);
                }
            }
        }

        return null;
    };

    /**
     * Compare two colors for equality Also takes care of null parameters
     * @param {GXColor} left left side color
     * @param {GXColor} right right side color
     * @return {Boolean} true if left and right are equal (also if they're null!)
     * @version 1.0
     */
    GXColor.equals = function (left, right) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (left.getType() === right.getType()) {
                var v1 = left.getValue();
                var v2 = right.getValue();

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
     * @enum
     */
    GXColor.Type = {
        /** RGB Color - "rgb(0..255, 0..255, 0..255, 0..100)" */
        RGB: {
            key: 'rgb',
            space: GXColorSpace.RGB,
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
            space: GXColorSpace.RGB,
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
            space: GXColorSpace.RGB,
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
            space: GXColorSpace.CMYK,
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
            space: GXColorSpace.None,
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
            space: GXColorSpace.None
        },
        /** Special black point - "black"- value = null */
        Black: {
            key: 'black',
            space: GXColorSpace.None
        },
        /** Special registration point - "registration" - value = null */
        Registration: {
            key: 'registration',
            space: GXColorSpace.None
        }
    };

    /**
     * @type {GXColor.Type}
     * @private
     */
    GXColor.prototype._type = null;

    /**
     * @type {Array<Number>|String|null}
     * @private
     */
    GXColor.prototype._value = null;

    /**
     * @returns {GXColor.Type}
     */
    GXColor.prototype.getType = function () {
        return this._type;
    };

    /**
     * @returns {Array<Number>|String|null}
     */
    GXColor.prototype.getValue = function () {
        return this._value;
    };

    /**
     * @return {GXColorSpace}
     */
    GXColor.prototype.getSpace = function () {
        return this._type.space;
    };

    /**
     * Return new instanceof this color with type RGB
     * @returns {GXColor}
     */
    GXColor.prototype.toRGB = function () {
        return new GXColor(GXColor.Type.RGB, this.asRGB());
    };

    /**
     * Return new instanceof this color with type HSL
     * @returns {GXColor}
     */
    GXColor.prototype.toHSL = function () {
        return new GXColor(GXColor.Type.HSL, this.asHSL());
    };

    /**
     * Return new instance of this color with type Tone
     * @returns {GXColor}
     */
    GXColor.prototype.toTone = function () {
        return new GXColor(GXColor.Type.Tone, this.asTone());
    };

    /**
     * Return new instanceof this color with type CMYK
     * @returns {GXColor}
     */
    GXColor.prototype.toCMYK = function () {
        return new GXColor(GXColor.Type.CMYK, this.asCMYK());
    };

    /**
     * Return new instanceof this color converted
     * into a given color type. If the type is not a real
     * color space like a reference or white black then
     * this function will return a copy of the same color
     * like this one with type RGB
     * @param {GXColor.Type} type the target type
     * @returns {GXColor}
     */
    GXColor.prototype.toType = function (type) {
        switch (type) {
            case GXColor.Type.HSL:
                return this.toHSL();
            case GXColor.Type.CMYK:
                return this.toCMYK();
            case GXColor.Type.Tone:
                return this.toTone();
            default:
                return this.toRGB();
        }
    };

    /**
     * Return color as RGB-Array
     * @return Array<Number> (0..255, 0..255, 0..255, 0..100)
     */
    GXColor.prototype.asRGB = function () {
        if (this._type === GXColor.Type.RGB) {
            return this._value.slice();
        } else if (this._type === GXColor.Type.HSL) {
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
        } else if (this._type === GXColor.Type.Tone) {
            var t = 255 - Math.min(255, Math.max(0, Math.round(this._value[0] / 100 * 255)));
            return [t, t, t, this._value[1]];
        } else if (this._type === GXColor.Type.CMYK) {
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
        } else if (this._type === GXColor.Type.White) {
            return [255, 255, 255, 100];
        } else if (this._type === GXColor.Type.Black) {
            return [0, 0, 0, 100];
        } else if (this._type === GXColor.Type.Registration) {
            return [0, 0, 0, 100];
        } else {
            throw new Error('Unable to convert to rgb from color type.');
        }
    };

    /**
     * Return color as 32-Bit integer
     * @return {Number}
     */
    GXColor.prototype.asRGBInt = function () {
        var rgb = this.asRGB();
        return gColor.build(rgb[0], rgb[1], rgb[2], rgb[3] * 2.5);
    };

    /**
     * Return color as HSL-Array
     * @return Array<Number> (0..360, 0..100, 0..100, 0..100)
     */
    GXColor.prototype.asHSL = function () {
        if (this._type === GXColor.Type.HSL) {
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
    GXColor.prototype.asTone = function () {
        if (this._type === GXColor.Type.Tone) {
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
    GXColor.prototype.asCMYK = function () {
        if (this._type === GXColor.Type.CMYK) {
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
    GXColor.prototype.asXYZ = function (whitePointReference) {
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
    GXColor.prototype.asLAB = function (whitePointReference) {
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
    GXColor.prototype.asString = function () {
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
    GXColor.prototype.asCSSString = function () {
        var rgb = this.asRGB();

        return 'rgba(' + rgb[0].toString() + ',' + rgb[1].toString() + ',' + rgb[2].toString() + ',' + (rgb[3] / 100.0).toString() + ')';
    };

    /**
     * Return new instanceof of this color with a given tint
     * @param {Number} tint the tint from 0..100
     * @returns {GXColor}
     */
    GXColor.prototype.withTint = function (tint) {
        if (this._type === GXColor.Type.CMYK) {
            // Special handling for CMYK
            var factor = tint / 100.0;
            var cmyk = this._value.slice();
            for (var i = 0; i < 4; ++i) {
                cmyk[i] = Math.round(cmyk[i] * factor);
            }
            return new GXColor(GXColor.Type.CMYK, cmyk);
        } else {
            // All others use rgb and try to convert back to source type
            var factor = 1.0 - (tint / 100.0);
            var rgb = this.asRGB();
            rgb[0] = Math.round(((255 - rgb[0]) * factor) + rgb[0]);
            rgb[1] = Math.round(((255 - rgb[1]) * factor) + rgb[1]);
            rgb[2] = Math.round(((255 - rgb[2]) * factor) + rgb[2]);

            return new GXColor(GXColor.Type.RGB, rgb).toType(this._type);
        }
    };

    /**
     * Return new instanceof of this color with a given shade
     * @param {Number} shade the shade from 0..100
     * @returns {GXColor}
     */
    GXColor.prototype.withShade = function (shade) {
        if (this._type === GXColor.Type.CMYK) {
            // Special handling for CMYK
            var cmyk = this.asCMYK();
            cmyk[3] = shade;
            return new GXColor(GXColor.Type.CMYK, cmyk).toType(this._type);
        } else {
            // All others use rgb and try to convert back to source tpye
            var factor = 1.0 - (shade / 100.0);
            var rgb = this.asRGB();
            rgb[0] = Math.round(rgb[0] * factor);
            rgb[1] = Math.round(rgb[1] * factor);
            rgb[2] = Math.round(rgb[2] * factor);

            return new GXColor(GXColor.Type.RGB, rgb).toType(this._type);
        }
    };

    /**
     * Return new instanceof of this color with a given tone
     * @param {Number} tone the tone from 0..100
     * @returns {GXColor}
     */
    GXColor.prototype.withTone = function (tone) {
        return this.withTint(tone).withShade(tone);
    };

    /** @override */
    GXColor.prototype.toString = function () {
        return "[Object GXColor]";
    };

    _.GXColor = GXColor;
})(this);