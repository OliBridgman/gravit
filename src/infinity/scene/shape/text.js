(function (_) {

    var _fontArray = null;
    var _font = null;

    var request = new XMLHttpRequest();
    request.open('get', 'font/Arial.ttf', true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        if (request.status !== 200) {
            //return callback('Font could not be loaded: ' + request.statusText);
        }
        _fontArray = request.response;
        _font = opentype.parse(_fontArray);
        if (!_font.supported) {
            return callback('Font is not supported (is this a Postscript font?)');
        }
    };
    request.send();


    /**
     * A text shape
     * @class GXText
     * @extends GXShape
     * @constructor
     */
    function GXText() {
        GXShape.call(this);
        this._setDefaultProperties(GXText.GeometryProperties);
        this._vertices = new GXVertexContainer();
        this._verticesDirty = false;
    }

    GXNode.inherit("text", GXText, GXShape);

    /**
     * The geometry properties of text with their default values
     */
    GXText.GeometryProperties = {
        /** Fixed width or not */
        fw: false,
        /** Fixed height or not */
        fh: false
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText.Block Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXText.Block
     * @extends GXNode
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @private
     */
    GXText.Block = function () {
        this._setDefaultProperties(GXText.Block.Properties);
    };

    GObject.inheritAndMix(GXText.Block, GXNode, [GXNode.Properties, GXNode.Store]);

    /**
     * The style of a text
     * @enum
     */
    GXText.Block.TextStyle = {
        Normal: 'n',
        Bold: 'b',
        Italic: 'i',
        BoldItalic: 'bi'
    };

    /**
     * The geometry properties of a block with their default values
     */
    GXText.Block.Properties = {
        /** The font family */
        ff: null,
        /** The font size */
        fi: null,
        /** The font style (GXText.Block.TextStyle) */
        fs: null,
        /** The font color */
        fc: null,
        /** The character spacing */
        cs: null,
        /** The word spacing */
        ws: null
    };

    GXText.Block.propertyToCss = function (property, value, css) {
        if (property === 'ff') {
            css['font-family'] = value;
        } else if (property === 'fi') {
            css['font-size'] = value + 'px';
        } else if (property === 'fs') {
            switch (value) {
                case GXText.Block.TextStyle.Normal:
                    css['font-weight'] = 'normal';
                    css['font-style'] = 'normal';
                    break;
                case GXText.Block.TextStyle.Bold:
                    css['font-weight'] = 'bold';
                    css['font-style'] = 'normal';
                    break;
                case GXText.Block.TextStyle.Italic:
                    css['font-weight'] = 'normal';
                    css['font-style'] = 'italic';
                    break;
                case GXText.Block.TextStyle.BoldItalic:
                    css['font-weight'] = 'bold';
                    css['font-style'] = 'italic';
                    break;
            }
        } else if (property === 'fc') {
            css['color'] = value.asCSSString();
        } else if (property === 'cs') {
            css['letter-spacing'] = value + 'px';
        } else if (property === 'ws') {
            css['word-spacing'] = value + 'px';
        } else {
            throw new Error('Unimplemented property (propertyToCss): ' + property);
        }
    };

    GXText.Block.cssToProperty = function (property, css) {
        if (property === 'ff') {
            if (css['font-family']) {
                return css['font-family'];
            }
        } else if (property === 'fi') {
            var value = parseFloat(css['font-size']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'fs') {
            var bold = css['font-weight'] === 'bold';
            var italic = css['font-style'] === 'italic';

            if (bold && italic) {
                return GXText.Block.TextStyle.BoldItalic;
            } else if (bold) {
                return GXText.Block.TextStyle.Bold;
            } else if (italic) {
                GXText.Block.TextStyle.Italic;
            } else {
                return GXText.Block.TextStyle.Normal;
            }
        } else if (property === 'fc') {
            var value = GXColor.parseCSSColor(css['color']);
            if (value) {
                return value;
            }
        } else if (property === 'cs') {
            var value = parseFloat(css['letter-spacing']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'ws') {
            var value = parseFloat(css['word-spacing']);
            if (!isNaN(value)) {
                return value;
            }
        } else {
            throw new Error('Unimplemented property (cssToProperty): ' + property);
        }

        return null;
    };

    /**
     * @return {GXText}
     */
    GXText.Block.prototype.getText = function () {
        for (var parent = this.getParent(); parent !== null; parent = parent.getParent()) {
            if (parent instanceof GXText) {
                return parent;
            }
        }
        return null;
    };

    /** @override */
    GXText.Block.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText.Block;
    };

    /** @override */
    GXText.Block.prototype._handleChange = function (change, args) {
        var text = this.getText();

        if (text) {
            if (text._handleGeometryChangeForProperties(change, args, GXText.Block.Properties) && change == GXNode._Change.BeforePropertiesChange) {
                text._verticesDirty = true;
            } else if (change == GXNode._Change.BeforeChildInsert || change == GXNode._Change.BeforeChildRemove) {
                text.beginUpdate();
            } else if (change == GXNode._Change.AfterChildInsert || change == GXNode._Change.AfterChildRemove) {
                text._verticesDirty = true;
                text.endUpdate();
            }
        }

        GXNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * @param {{}} css
     * @returns {{}}
     */
    GXText.Block.prototype.propertiesToCss = function (css) {
        return this._propertiesToCss(css, GXText.Block.Properties, GXText.Block.propertyToCss);
    };

    /**
     * @param {{}} css
     */
    GXText.Block.prototype.cssToProperties = function (css) {
        this._cssToProperties(css, GXText.Block.Properties, GXText.Block.cssToProperty);
    };

    GXText.Block.prototype._propertiesToCss = function (css, propertyMap, propertyConverter) {
        for (var property in propertyMap) {
            var value = this.getProperty(property);
            if (value !== null) {
                propertyConverter(property, value, css);
            }
        }
        return css;
    };

    GXText.Block.prototype._cssToProperties = function (css, propertyMap, propertyConverter) {
        var properties = [];
        var values = [];
        for (var property in propertyMap) {
            var value = propertyConverter(property, css);
            properties.push(property);
            values.push(value);
        }

        if (properties.length > 0) {
            this.setProperties(properties, values);
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText.Break Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXText.Break
     * @extends GXText.Block
     * @private
     */
    GXText.Break = function () {
        GXText.Block.call(this);
    }

    GXNode.inherit("txBrk", GXText.Break, GXText.Block);

    /** @override */
    GXText.Break.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText.Paragraph || parent instanceof GXText.Span;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText.Span Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXText.Span
     * @extends GXText.Block
     * @mixes GXNode.Container
     * @private
     */
    GXText.Span = function (value) {
        GXText.Block.call(this);
        this._setDefaultProperties(GXText.Span.Properties);
        if (value) {
            this.$v = value;
        }
    }

    GXNode.inheritAndMix("txSpan", GXText.Span, GXText.Block, [GXNode.Container]);

    /**
     * The properties of a span with their default values
     */
    GXText.Span.Properties = {
        /** The text value / content */
        v: ""
    };

    /** @override */
    GXText.Span.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText.Paragraph || parent instanceof GXText.Span;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText.Paragraph Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXText.Paragraph
     * @extends GXText.Block
     * @mixes GXNode.Container
     * @private
     */
    GXText.Paragraph = function () {
        GXText.Block.call(this);
        this._setDefaultProperties(GXText.Paragraph.Properties);
    }

    GXNode.inheritAndMix("txPara", GXText.Paragraph, GXText.Block, [GXNode.Container]);

    /**
     * Alignment of a paragraph
     * @enum
     */
    GXText.Paragraph.Alignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * The geometry properties of a paragraph with their default values
     */
    GXText.Paragraph.Properties = {
        /** Column count */
        cc: null,
        /** Column gap */
        cg: null,
        /** The paragraph's alignment (GXText.Paragraph.Alignment) */
        al: null,
        /** The first line intendation */
        in: null,
        /** The line height whereas 1 = 100% */
        lh: null,
        /** Top margin */
        mt: null,
        /** Right margin */
        mr: null,
        /** Bottom margin */
        mb: null,
        /** Left margin */
        ml: null
    };

    GXText.Paragraph.propertyToCss = function (property, value, css) {
        if (property === 'cc') {
            value = value || 1;
            css['column-count'] = value;
            css['-webkit-column-count'] = value;
            css['-moz-column-count'] = value;
        } else if (property === 'cg') {
            css['column-gap'] = value;
            css['-webkit-column-gap'] = value;
            css['-moz-column-gap'] = value;
        } else if (property === 'al') {
            switch (value) {
                case GXText.Paragraph.Alignment.Left:
                    css['text-align'] = 'left';
                    break;
                case GXText.Paragraph.Alignment.Center:
                    css['text-align'] = 'center';
                    break;
                case GXText.Paragraph.Alignment.Right:
                    css['text-align'] = 'right';
                    break;
                case GXText.Paragraph.Alignment.Justify:
                    css['text-align'] = 'justify';
                    break;
            }
        } else if (property === 'in') {
            css['text-indent'] = value + 'px';
        } else if (property === 'lh') {
            css['line-height'] = value;
        } else if (property === 'mt') {
            css['margin-top'] = value + 'px';
        } else if (property === 'mr') {
            css['margin-right'] = value + 'px';
        } else if (property === 'mb') {
            css['margin-bottom'] = value + 'px';
        } else if (property === 'ml') {
            css['margin-left'] = value + 'px';
        } else {
            throw new Error('Unimplemented property (propertyToCss): ' + property);
        }
    };

    GXText.Paragraph.cssToProperty = function (property, css) {
        if (property === 'cc') {
            var str = css['column-count'] || css['-webkit-column-count'] || css['-moz-column-count'];
            var value = parseInt(str);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'cg') {
            var str = css['column-gap'] || css['-webkit-column-gap'] || css['-moz-column-gap'];
            var value = parseFloat(str);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'al') {
            if (value === 'left') {
                return GXText.Paragraph.Alignment.Left;
            } else if (value === 'center') {
                return GXText.Paragraph.Alignment.Center;
            } else if (value === 'right') {
                return GXText.Paragraph.Alignment.Right;
            } else if (value === 'justify') {
                return GXText.Paragraph.Alignment.Justify;
            }
        } else if (property === 'in') {
            var value = parseFloat(css['text-indent']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'lh') {
            var lineHeight = parseFloat(css['line-height']);
            if (!isNaN(lineHeight)) {
                return lineHeight;
            }
        } else if (property === 'mt') {
            var value = parseFloat(css['margin-top']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'mr') {
            var value = parseFloat(css['margin-right']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'mb') {
            var value = parseFloat(css['margin-bottom']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === 'ml') {
            var value = parseFloat(css['margin-left']);
            if (!isNaN(value)) {
                return value;
            }
        } else {
            throw new Error('Unimplemented property (cssToProperty): ' + property);
        }
        return null;
    };

    /** @override */
    GXText.Paragraph.prototype._handleChange = function (change, args) {
        var text = this.getText();

        if (text) {
            if (text._handleGeometryChangeForProperties(change, args, GXText.Paragraph.Properties) && change == GXNode._Change.BeforePropertiesChange) {
                text._verticesDirty = true;
            }
        }

        GXText.Block.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXText.Paragraph.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText.Content;
    };

    /** @override */
    GXText.Paragraph.prototype.propertiesToCss = function (css) {
        this._propertiesToCss(css, GXText.Paragraph.Properties, GXText.Paragraph.propertyToCss);
        return GXText.Block.prototype.propertiesToCss.call(this, css);
    };

    /**
     * @param {{}} css
     */
    GXText.Paragraph.prototype.cssToProperties = function (css) {
        this._cssToProperties(css, GXText.Paragraph.Properties, GXText.Paragraph.cssToProperty);
        GXText.Block.prototype.cssToProperties.call(this, css);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText.Content Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXText.Content
     * @extends GXText.Paragraph
     * @private
     */
    GXText.Content = function () {
        GXText.Paragraph.call(this);
        this._flags |= GXNode.Flag.Shadow;

        // Setup default font stuff
        this.$ff = 'Arial';
        this.$fi = 12;
        this.$lh = 1;
    };

    GXNode.inherit("txContent", GXText.Content, GXText.Paragraph);

    /** @override */
    GXText.Content.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText;
    };

    /** @override */
    GXText.Content.prototype.propertiesToCss = function (css) {
        css['word-wrap'] = 'break-word';

        // Setup default color taking care of attributes if any
        var color = 'black';
        var text = this._parent;
        if (text) {
            var fillColor = text.getAttributes().getFillColor();
            if (fillColor) {
                color = fillColor.asCSSString();
            }
        }
        css['color'] = color;

        return GXText.Paragraph.prototype.propertiesToCss.call(this, css);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {GXText.Content}
     * @private
     */
    GXText.prototype._content = null;

    /**
     * @type {GPoint}
     * @private
     */
    GXText.prototype._size = null;

    /**
     * @type {GXVertexContainer}
     * @private
     */
    GXText.prototype._vertices = null;

    /**
     * @type {boolean}
     * @private
     */
    GXText.prototype._verticesDirty = false;

    /**
     * Returns the content container of the text node
     * @returns {GXText.Content}
     */
    GXText.prototype.getContent = function () {
        // If we have a _content reference and it not
        // has ourself as a parent, then clear it, first
        if (this._content && this._content.getParent() !== this) {
            this._content = null;
        }

        if (!this._content) {
            // Find our content and save reference for faster access
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                if (child instanceof GXText.Content) {
                    this._content = child;
                    break;
                }
            }

            if (!this._content) {
                this._content = new GXText.Content();
                this.appendChild(this._content);
            }
        }

        return this._content;
    };

    /**
     * Converts the underlying content to a html string
     * @param {Boolean} segments if true, each single character
     * will be enclosed by a span. Defaults to false.
     * Defaults to false.
     * @returns {String}
     */
    GXText.prototype.asHtml = function (segments) {
        var dummy = $('<div></div>');
        this._asHtml(dummy, this.getContent(), segments);
        return dummy.html();
    };

    /**
     * Clears and replaces the contents of this text from
     * a given html string
     * @param {String} html
     */
    GXText.prototype.fromHtml = function (html) {
        this.beginUpdate();
        try {
            var content = this.getContent();

            // Clear our contents
            content.clearChildren(true);

            // Convert html code into a dom
            var htmlDoc = $(html);

            // Recursively iterate html dom and reconstruct our contents from it
            htmlDoc.each(function (index, element) {
                this._fromHtml($(element), content);
            }.bind(this));
        } finally {
            this.endUpdate();
        }
    };

    /** @override */
    GXText.prototype.store = function (blob) {
        if (GXShape.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXText.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXText.prototype.restore = function (blob) {
        if (GXShape.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXText.GeometryProperties);
            this._verticesDirty = true;
            return true;
        }
        return false;
    };

    /** @override */
    GXText.prototype.rewindVertices = function (index) {
        if (this._verticesDirty || this._vertices == null) {
            this._vertices.clearVertices();

            // TODO : Implement this right and into the subclasses!

            // Calculate our actual text box and line length
            var textBox = GRect.fromPoints(new GPoint(0, 0), new GPoint(1, 1));
            if (this.$trf) {
                textBox = this.$trf.mapRect(textBox);
            }

            // Create our temporary container for holding our html contents
            var container = $('<div></div>')
                .css(this.getContent().propertiesToCss({}))
                .css({
                    'position': 'absolute',
                    'top': '0px',
                    'left': '0px',
                    'visibility': 'hidden',
                    'width': textBox.getWidth() > 1 ? textBox.getWidth() + 'px' : ''
                })
                .html(this.asHtml(true))
                .appendTo($('body'));

            // Prepare size information
            var maxWidth = null;
            var maxHeight = null;

            container.find('span:not(:has(span))').each(function (index, span) {
                var $span = $(span);
                var rect = span.getBoundingClientRect();
                var fontSize = parseInt($span.css('font-size'));
                var font = _font; // TODO : FIX THIS
                var char = $span.text()[0];
                var glyph = font.charToGlyph(char);
                var scale = 1 / font.unitsPerEm * fontSize;
                var height = (glyph.yMax - glyph.yMin) * scale;

                // Ignore zero height spans and empty spans
                if (rect.height <= 0 || char === ' ') {
                    return;
                }

                // Calculate our span's baseline
                var baseline = rect.top + (height + (((font.ascender) * scale) - height));

                // Calculate our span's real x/y values
                var x = textBox.getX() + rect.left;
                var y = textBox.getY() + baseline;

                // Query the path for the glyph
                var path = glyph.getPath(x, y, fontSize);

                // Add the path to our vertices
                for (var i = 0; i < path.commands.length; i += 1) {
                    var cmd = path.commands[i];
                    if (cmd.type === 'M') {
                        this._vertices.addVertex(GXVertex.Command.Move, cmd.x, cmd.y);
                    } else if (cmd.type === 'L') {
                        this._vertices.addVertex(GXVertex.Command.Line, cmd.x, cmd.y);
                    } else if (cmd.type === 'C') {
                        this._vertices.addVertex(GXVertex.Command.Curve2, cmd.x, cmd.y);
                        this._vertices.addVertex(GXVertex.Command.Curve2, cmd.x1, cmd.y1);
                        this._vertices.addVertex(GXVertex.Command.Curve2, cmd.x2, cmd.y2);
                    } else if (cmd.type === 'Q') {
                        this._vertices.addVertex(GXVertex.Command.Curve, cmd.x, cmd.y);
                        this._vertices.addVertex(GXVertex.Command.Curve, cmd.x1, cmd.y1);
                    } else if (cmd.type === 'Z') {
                        this._vertices.addVertex(GXVertex.Command.Close);
                    }
                }

                // Contribute to size if necessary
                if (maxWidth === null || rect.right > maxWidth) {
                    maxWidth = rect.right;
                }
                if (maxHeight === null || rect.bottom > maxHeight) {
                    maxHeight = rect.bottom;
                }
            }.bind(this));

            // Remove our container now
            container.remove();

            // Assign new size information
            this._size = new GPoint(maxWidth, maxHeight);

            // We're done here
            this._verticesDirty = false;
        }
        return this._vertices ? this._vertices.rewindVertices(index) : false;
    };

    /** @override */
    GXText.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
    };

    /** @override */
    GXText.prototype._calculateGeometryBBox = function () {
        // Always rewind to ensure integrity
        this.rewindVertices(0);

        var origin = new GPoint(0, 0);
        if (this.$trf) {
            origin = this.$trf.mapPoint(origin);
        }

        return new GRect(origin.getX(), origin.getY(), this._size.getX(), this._size.getY());
    };

    /** @override */
    GXText.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // For now, text is always hit-test by its bbox only so return ourself
        // TODO : Add support for detailed range hit test information here
        return new GXElement.HitResult(this);
    };

    /** @override */
    GXText.prototype._handleChange = function (change, args) {
        GXShape.prototype._handleChange.call(this, change, args);

        if (this._handleGeometryChangeForProperties(change, args, GXText.GeometryProperties) && change == GXNode._Change.BeforePropertiesChange) {
            this._verticesDirty = true;
        }

        if (change === GXNode._Change.BeforePropertiesChange) {
            var transformIdx = args.properties.indexOf('trf');
            if (transformIdx >= 0 && !this._verticesDirty) {
                // TODO : Optimize for cases where no invalidation of vertices is required
                /*
                 // Check whether only translation was changed and if that's
                 // the case we'll simply translate our existing vertices,
                 // otherwise we'll invalidate the vertices
                 var newTransform = args.values[transformIdx];
                 var inverseTransform = this.$trf ? this.$trf.inverted() : new GTransform(1, 0, 0, 1, 0, 0);
                 var deltaTransform = newTransform.multiplied(inverseTransform);
                 if (deltaTransform.isIdentity(true)) {
                 if (this._vertices) {
                 var translation = deltaTransform.getTranslation();
                 this._vertices.transformVertices(new GTransform(1, 0, 0, 1, translation.getX(), translation.getY()));
                 }
                 } else {
                 this._verticesDirty = true;
                 }
                 */
                this._verticesDirty = true;
            }
        }
    };

    /**
     * Convert contents to html
     * @param parent
     * @param block
     * @param segments
     * @private
     */
    GXText.prototype._asHtml = function (parent, block, segments) {
        if (block instanceof GXText.Content) {
            // ignore root
        } else if (block instanceof GXText.Paragraph) {
            parent = $('<p></p>')
                .css(block.propertiesToCss({}))
                .appendTo(parent);
        } else if (block instanceof GXText.Break) {
            $('<br>')
                .appendTo(parent);
        } else if (block instanceof GXText.Span) {
            var value = block.getProperty('v');
            if (value && value !== "") {
                parent = $('<span></span>')
                    .css(block.propertiesToCss({}))
                    .appendTo(parent);

                if (segments) {
                    for (var i = 0; i < value.length; ++i) {
                        parent.append($('<span></span>')
                                .text(value[i]))
                            .appendTo(parent);
                    }
                } else {
                    parent.text(value);
                }
            }
        }

        if (block.hasMixin(GXNode.Container)) {
            for (var child = block.getFirstChild(); child !== null; child = child.getNext()) {
                this._asHtml(parent, child, segments);
            }
        }
    };

    /**
     * @param element
     * @param parent
     * @private
     */
    GXText.prototype._fromHtml = function (element, parent) {
        var tagName = element.prop('tagName');
        if (tagName === 'P') {
            var paragraph = new GXText.Paragraph();
            paragraph.cssToProperties(element[0].style);
            parent.appendChild(paragraph);
            parent = paragraph;

        } else if (tagName === 'BR') {
            parent.appendChild(new GXText.Break());
        } else if (tagName === 'SPAN') {
            var span = new GXText.Span();
            span.cssToProperties(element[0].style);
            parent.appendChild(span);
            parent = span;
            span.setProperty('v', element.text());
            span.setProperty('fi', parseInt(element.css('font-size')));
        }

        element.children().each(function (index, element) {
            this._fromHtml($(element), parent);
        }.bind(this));
    };

    /** @override */
    GXText.prototype.toString = function () {
        return "[GXText]";
    };

    _.GXText = GXText;
})(this);