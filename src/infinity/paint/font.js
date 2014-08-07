(function (_) {

    /**
     * @class IFFont
     * @constructor
     */
    function IFFont() {
        this._types = {};
    };

    /**
     * The style of a font
     * @enum
     */
    IFFont.Style = {
        Normal: 'N',
        Italic: 'I'
    };

    /**
     * The weight of a font
     * @enum
     */
    IFFont.Weight = {
        Thin: 100,
        ExtraLight: 200,
        Light: 300,
        Regular: 400,
        Medium: 500,
        SemiBold: 600,
        Bold: 700,
        ExtraBold: 800,
        Heavy: 900
    };

    /**
     * Localized names for IFFont.Weight
     */
    IFFont.WeightName = {
        100: new IFLocale.Key(IFFont, 'weight.thin'),
        200: new IFLocale.Key(IFFont, 'weight.extra-light'),
        300: new IFLocale.Key(IFFont, 'weight.light'),
        400: new IFLocale.Key(IFFont, 'weight.regular'),
        500: new IFLocale.Key(IFFont, 'weight.medium'),
        600: new IFLocale.Key(IFFont, 'weight.semi-bold'),
        700: new IFLocale.Key(IFFont, 'weight.bold'),
        800: new IFLocale.Key(IFFont, 'weight.extra-bold'),
        900: new IFLocale.Key(IFFont, 'weight.heavy')
    };

    /**
     * The category of a font
     * @enum
     */
    IFFont.Category = {
        Other: 0,
        Serif: 100,
        Monospace: 200,
        Iconic: 300
    };

    /**
     * Localized names for IFFont.Category
     */
    IFFont.CategoryName = {
          0: new IFLocale.Key(IFFont, 'category.other'),
        100: new IFLocale.Key(IFFont, 'category.serif'),
        200: new IFLocale.Key(IFFont, 'category.monospace'),
        300: new IFLocale.Key(IFFont, 'category.iconic')
    };

    /**
     * @type {{}}
     * @private
     */
    IFFont.prototype._types = null;

    /**
     * Register a new font type
     * @param {String} family the font-family this type belongs to
     * @param {IFFont.Style} style the style of the type
     * @param {IFFont.Weight} weight the weight of the type
     * @param {String} url the url to load the font-file from
     * @param {Boolean} [category] the font type category. Needs to be called
     * on the first typeface added only. Defaults to IFFont.Category.Other
     */
    IFFont.prototype.addType = function (family, style, weight, url, category) {
        var type = this._types[family];

        if (!type) {
            type = {
                styles: {},
                weights: {},
                variants: {},
                category: category || IFFont.Category.Other
            }

            this._types[family] = type;
        }

        var variant = style + weight.toString();
        type.styles[style] = true;
        type.weights[weight] = true;

        var _styleToCss = function (style) {
            switch (style) {
                case IFFont.Style.Normal:
                    return 'normal';
                case IFFont.Style.Italic:
                    return 'italic';
                default:
                    throw new Error('Unknown style');
            }
        };

        // Start loading of font and add variant when done
        var request = new XMLHttpRequest();
        request.open('get', url);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            if (request.response && request.response instanceof ArrayBuffer) {
                var font = opentype.parse(request.response);
                if (font && font.supported) {
                    // Insert our variant
                    type.variants[variant] = {
                        url: url,
                        font: font,
                        outlines: {}
                    };

                    // Inject a new font-face style
                    $('<style></style>')
                        .attr('type', 'text/css')
                        .text('@font-face {' +
                            'font-family: "' + family + '";' +
                            'src: url("' + url + '");' +
                            'font-weight: ' + weight.toString() + ';' +
                            'font-style: ' + _styleToCss(style) + ';' +
                            '} ')
                        .appendTo($('body'));

                    // Sucks but inject an invisible span to ensure the font gets loaded
                    $('<span></span>')
                        .css({
                            'position': 'absolute',
                            'opacity': '0',
                            'font-family': family,
                            'font-weight': weight.toString(),
                            'font-style': _styleToCss(style)
                        })
                        .text('.')
                        .appendTo($('body'));
                }
            }
        };
        request.send();
    };

    /**
     * Returns an alphabetically sorted list of
     * available font families
     */
    IFFont.prototype.getFamilies = function () {
        var families = Object.keys(this._types);
        families.sort();
        return families;
    };

    /**
     * Returns the typeface category for a given family
     * @param {String} family
     * @returns {IFFont.Category}
     */
    IFFont.prototype.getCategory = function (family) {
        var type = this._types[family];
        if (type) {
            return type.category;
        }
        return IFFont.Category.Other;
    };

    /**
     * Returns all available styles for a given family
     * @param {String} family the family to query for
     * @return {Array<IFFont.Style>} null if there's
     * no such font-family or an array of available styles for the
     * given family
     */
    IFFont.prototype.getStyles = function (family) {
        var type = this._types[family];
        if (type) {
            return Object.keys(type.styles);
        }
        return null;
    };

    /**
     * Returns all available weights for a given family
     * @param {String} family the family to query for
     * @return {Array<IFFont.Weight>} null if there's
     * no such font-family or an array of available weights for the
     * given family
     */
    IFFont.prototype.getWeights = function (family) {
        var type = this._types[family];
        if (type) {
            var weights = Object.keys(type.weights);
            var result = [];
            for (var i = 0; i < weights.length; ++i) {
                result.push(parseInt(weights[i]));
            }
            result.sort();
            return result;
        }
        return null;
    };

    /**
     * Returns a variant for a given family, style and weight
     * @param {String} family the family to query for
     * @param {IFFont.Style} style the style of the variant
     * @param {IFFont.Weight} weight the weight of the variant
     * @param {Boolean} [matchExact] if set, no variant will be returned
     * if there's no exact match of the parameters, otherwise a closest
     * matching variant will be returned. Defaults to false.
     * @return {String} null if there's no such family. Otherwise a variant
     * that either exactly matches the given parameters or the closest
     * matching variant if matchExact is set to false
     */
    IFFont.prototype.getVariant = function (family, style, weight, matchExact) {
        var type = this._types[family];
        if (type) {
            if (!type.styles.hasOwnProperty(style) && !matchExact) {
                style = IFFont.Style.Normal;
            }

            weight = typeof weight === 'number' ? weight : parseInt(weight);

            if (!matchExact) {
                while (!type.weights.hasOwnProperty(weight) && weight >= 100) {
                    weight -= 100;
                }
                while (!type.weights.hasOwnProperty(weight) && weight <= 900) {
                    weight += 100;
                }
            }

            var variant = style + weight.toString();

            if (type.variants.hasOwnProperty(variant)) {
                return variant;
            }
        }
        return null;
    };

    /**
     *
     * @param family
     * @param variant
     * @param size
     * @param char
     * @returns {number}
     */
    IFFont.prototype.getGlyphBaseline = function (family, variant, size, char) {
        var font = this._types[family].variants[variant].font;
        var glyph = font.charToGlyph(char);
        var scale = 1 / font.unitsPerEm * size;
        var height = (glyph.yMax - glyph.yMin) * scale;
        return height + (((font.ascender) * scale) - height);
    };

    /**
     *
     * @param family
     * @param variant
     * @param size
     * @param x
     * @param y
     * @param char
     * @returns {IFVertexSource}
     */
    IFFont.prototype.getGlyphOutline = function (family, variant, size, x, y, char) {
        var fontVariant = this._types[family].variants[variant];
        var font = fontVariant.font;
        var outline = fontVariant.outlines[char];
        var scale = 1 / font.unitsPerEm * size;

        if (!outline) {
            var glyph = font.charToGlyph(char);
            var path = glyph.getPath(0, 0, font.unitsPerEm);
            outline = new IFVertexContainer();
            fontVariant.outlines[char] = outline;

            for (var i = 0; i < path.commands.length; i += 1) {
                var cmd = path.commands[i];
                if (cmd.type === 'M') {
                    outline.addVertex(IFVertex.Command.Move, cmd.x, cmd.y);
                } else if (cmd.type === 'L') {
                    outline.addVertex(IFVertex.Command.Line, cmd.x, cmd.y);
                } else if (cmd.type === 'C') {
                    outline.addVertex(IFVertex.Command.Curve2, cmd.x, cmd.y);
                    outline.addVertex(IFVertex.Command.Curve2, cmd.x1, cmd.y1);
                    outline.addVertex(IFVertex.Command.Curve2, cmd.x2, cmd.y2);
                } else if (cmd.type === 'Q') {
                    outline.addVertex(IFVertex.Command.Curve, cmd.x, cmd.y);
                    outline.addVertex(IFVertex.Command.Curve, cmd.x1, cmd.y1);
                } else if (cmd.type === 'Z') {
                    outline.addVertex(IFVertex.Command.Close);
                }
            }
        }

        return new IFVertexTransformer(outline, new IFTransform(scale, 0, 0, scale, x, y));
    };


    _.IFFont = IFFont;
    _.ifFont = new IFFont();
})(this);