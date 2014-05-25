(function (_) {
    /**
     * A text shape
     * @class IFText
     * @extends IFShape
     * @constructor
     */
    function IFText() {
        IFShape.call(this);
        this._setDefaultProperties(IFText.GeometryProperties);
        this._vertices = new IFVertexContainer();
        this._verticesDirty = false;
    }

    IFNode.inherit("text", IFText, IFShape);

    /**
     * The geometry properties of text with their default values
     */
    IFText.GeometryProperties = {
        /** Fixed width or not */
        fw: false,
        /** Fixed height or not */
        fh: false
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText.Chunk Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Chunk
     * @extends IFNode
     * @mixes IFNode.Store
     * @private
     */
    IFText.Chunk = function (content) {
        IFNode.call(this);
        this._content = content;
    }

    IFNode.inheritAndMix("txChk", IFText.Chunk, IFNode, [IFNode.Store]);

    /**
     * @type {String}
     * @private
     */
    IFText.Chunk.prototype._content = null;

    /**
     * @returns {String}
     */
    IFText.Chunk.prototype.getContent = function () {
        return this._content;
    };

    /** @override */
    IFText.Chunk.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            blob.cnt = this._content;
            return true;
        }
        return false;
    };

    /** @override */
    IFText.Chunk.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this._content = blob.cnt;
            return true;
        }
        return false;
    };

    /** @override */
    IFText.Chunk.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText.Block;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText.Break Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Break
     * @extends IFNode
     * @mixes IFNode.Store
     * @private
     */
    IFText.Break = function () {
        IFNode.call(this);
    }

    IFNode.inheritAndMix("txBrk", IFText.Break, IFNode, [IFNode.Store]);

    /** @override */
    IFText.Break.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText.Block;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText.Block Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Block
     * @extends IFNode
     * @mixes IFNode.Properties
     * @mixes IFNode.Store
     * @private
     */
    IFText.Block = function () {
        this._setDefaultProperties(IFText.Block.Properties);
    };

    IFObject.inheritAndMix(IFText.Block, IFNode, [IFNode.Properties, IFNode.Store]);

    /**
     * The style of a text
     * @enum
     */
    IFText.Block.TextStyle = {
        Normal: 'n',
        Bold: 'b',
        Italic: 'i',
        BoldItalic: 'bi'
    };

    /**
     * The geometry properties of a block with their default values
     */
    IFText.Block.Properties = {
        /** The font family */
        ff: null,
        /** The font size */
        fi: null,
        /** The font style (IFText.Block.TextStyle) */
        fs: null,
        /** The font color */
        fc: null,
        /** The character spacing */
        cs: null,
        /** The word spacing */
        ws: null
    };

    IFText.Block.propertyToCss = function (property, value, css) {
        if (property === 'ff') {
            css['font-family'] = value;
        } else if (property === 'fi') {
            css['font-size'] = value + 'px';
        } else if (property === 'fs') {
            switch (value) {
                case IFText.Block.TextStyle.Normal:
                    css['font-weight'] = 'normal';
                    css['font-style'] = 'normal';
                    break;
                case IFText.Block.TextStyle.Bold:
                    css['font-weight'] = 'bold';
                    css['font-style'] = 'normal';
                    break;
                case IFText.Block.TextStyle.Italic:
                    css['font-weight'] = 'normal';
                    css['font-style'] = 'italic';
                    break;
                case IFText.Block.TextStyle.BoldItalic:
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

    IFText.Block.cssToProperty = function (property, css) {
        if (property === 'ff') {
            if (css['font-family']) {
                var family = css['font-family'];
                if (family.length > 0) {
                    if (family.charAt(0) === '"' || family.charAt(0) === "'") {
                        family = family.substr(1);
                    }
                    if (family.charAt(family.length-1) === '"' || family.charAt(family.length-1) === "'") {
                        family = family.substr(0, family.length - 1);
                    }

                    return family;
                }
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
                return IFText.Block.TextStyle.BoldItalic;
            } else if (bold) {
                return IFText.Block.TextStyle.Bold;
            } else if (italic) {
                IFText.Block.TextStyle.Italic;
            } else {
                return IFText.Block.TextStyle.Normal;
            }
        } else if (property === 'fc') {
            var value = IFColor.parseCSSColor(css['color']);
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
     * @return {IFText}
     */
    IFText.Block.prototype.getText = function () {
        for (var parent = this.getParent(); parent !== null; parent = parent.getParent()) {
            if (parent instanceof IFText) {
                return parent;
            }
        }
        return null;
    };

    /** @override */
    IFText.Block.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText.Block;
    };

    /** @override */
    IFText.Block.prototype._handleChange = function (change, args) {
        var text = this.getText();

        if (text) {
            if (text._handleGeometryChangeForProperties(change, args, IFText.Block.Properties) && change == IFNode._Change.BeforePropertiesChange) {
                text._verticesDirty = true;
            } else if (change == IFNode._Change.BeforeChildInsert || change == IFNode._Change.BeforeChildRemove) {
                text.beginUpdate();
            } else if (change == IFNode._Change.AfterChildInsert || change == IFNode._Change.AfterChildRemove) {
                text._verticesDirty = true;
                text.endUpdate();
            }
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * @param {{}} css
     * @returns {{}}
     */
    IFText.Block.prototype.propertiesToCss = function (css) {
        return this._propertiesToCss(css, IFText.Block.Properties, IFText.Block.propertyToCss);
    };

    /**
     * @param {{}} css
     */
    IFText.Block.prototype.cssToProperties = function (css) {
        this._cssToProperties(css, IFText.Block.Properties, IFText.Block.cssToProperty);
    };

    IFText.Block.prototype._propertiesToCss = function (css, propertyMap, propertyConverter) {
        for (var property in propertyMap) {
            var value = this.getProperty(property);
            if (value !== null) {
                propertyConverter(property, value, css);
            }
        }
        return css;
    };

    IFText.Block.prototype._cssToProperties = function (css, propertyMap, propertyConverter) {
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
    // IFText.Span Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Span
     * @extends IFText.Block
     * @mixes IFNode.Container
     * @private
     */
    IFText.Span = function () {
        IFText.Block.call(this);
        this._setDefaultProperties(IFText.Span.Properties);
    }

    IFNode.inheritAndMix("txSpan", IFText.Span, IFText.Block, [IFNode.Container]);

    /** @override */
    IFText.Span.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText.Paragraph || parent instanceof IFText.Span;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText.Paragraph Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Paragraph
     * @extends IFText.Block
     * @mixes IFNode.Container
     * @private
     */
    IFText.Paragraph = function () {
        IFText.Block.call(this);
        this._setDefaultProperties(IFText.Paragraph.Properties);
    }

    IFNode.inheritAndMix("txPara", IFText.Paragraph, IFText.Block, [IFNode.Container]);

    /**
     * Alignment of a paragraph
     * @enum
     */
    IFText.Paragraph.Alignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * Wrap-Mode of a paragraph
     * @enum
     */
    IFText.Paragraph.WrapMode = {
        /**
         * No word-break
         */
        None: 'n',

        /**
         * Break after words only
         */
        Words: 'w',

        /**
         * Break anywhere including characters
         */
        All: 'a'
    };

    /**
     * The geometry properties of a paragraph with their default values
     */
    IFText.Paragraph.Properties = {
        /** Column count */
        cc: null,
        /** Column gap */
        cg: null,
        /** Wrap-Mode of a paragraph (IFText.Paragraph.WrapMode) */
        wm: null,
        /** The paragraph's alignment (IFText.Paragraph.Alignment) */
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

    IFText.Paragraph.propertyToCss = function (property, value, css) {
        if (property === 'cc') {
            value = value || 1;
            css['column-count'] = value;
            css['-webkit-column-count'] = value;
            css['-moz-column-count'] = value;
        } else if (property === 'cg') {
            css['column-gap'] = value;
            css['-webkit-column-gap'] = value;
            css['-moz-column-gap'] = value;
        } else if (property === 'wm') {
            switch (value) {
                case IFText.Paragraph.WrapMode.None:
                    css['white-space'] = 'nowrap';
                    break;
                case IFText.Paragraph.WrapMode.Words:
                    css['white-space'] = 'pre-wrap';
                    break;
                case IFText.Paragraph.WrapMode.All:
                    css['white-space'] = 'pre-wrap';
                    css['word-break'] = 'break-all';
                    break;
            }
        } else if (property === 'al') {
            switch (value) {
                case IFText.Paragraph.Alignment.Left:
                    css['text-align'] = 'left';
                    break;
                case IFText.Paragraph.Alignment.Center:
                    css['text-align'] = 'center';
                    break;
                case IFText.Paragraph.Alignment.Right:
                    css['text-align'] = 'right';
                    break;
                case IFText.Paragraph.Alignment.Justify:
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

    IFText.Paragraph.cssToProperty = function (property, css) {
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
        } else if (property === 'wm') {
            var wspace = css['white-space'];
            var wbreak = css['word-break'];

            if (wspace === 'pre-wrap') {
                if (wbreak === 'break-all') {
                    return IFText.Paragraph.WrapMode.All;
                } else {
                    return IFText.Paragraph.WrapMode.Words;
                }
            } else if (wspace === 'nowrap') {
                return IFText.Paragraph.WrapMode.None;
            }
        } else if (property === 'al') {
            if (value === 'left') {
                return IFText.Paragraph.Alignment.Left;
            } else if (value === 'center') {
                return IFText.Paragraph.Alignment.Center;
            } else if (value === 'right') {
                return IFText.Paragraph.Alignment.Right;
            } else if (value === 'justify') {
                return IFText.Paragraph.Alignment.Justify;
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
    IFText.Paragraph.prototype._handleChange = function (change, args) {
        var text = this.getText();

        if (text) {
            if (text._handleGeometryChangeForProperties(change, args, IFText.Paragraph.Properties) && change == IFNode._Change.BeforePropertiesChange) {
                text._verticesDirty = true;
            }
        }

        IFText.Block.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFText.Paragraph.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText.Content;
    };

    /** @override */
    IFText.Paragraph.prototype.propertiesToCss = function (css) {
        this._propertiesToCss(css, IFText.Paragraph.Properties, IFText.Paragraph.propertyToCss);
        return IFText.Block.prototype.propertiesToCss.call(this, css);
    };

    /**
     * @param {{}} css
     */
    IFText.Paragraph.prototype.cssToProperties = function (css) {
        this._cssToProperties(css, IFText.Paragraph.Properties, IFText.Paragraph.cssToProperty);
        IFText.Block.prototype.cssToProperties.call(this, css);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText.Content Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Content
     * @extends IFText.Paragraph
     * @private
     */
    IFText.Content = function () {
        IFText.Paragraph.call(this);
        this._flags |= IFNode.Flag.Shadow;

        // Setup default font stuff
        this.$ff = 'Open Sans';
        this.$fi = 20;
        this.$fs = IFText.Block.TextStyle.Italic;
        this.$lh = 1;
        this.$wm = IFText.Paragraph.WrapMode.All;
    };

    IFNode.inherit("txContent", IFText.Content, IFText.Paragraph);

    /** @override */
    IFText.Content.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText;
    };

    /** @override */
    IFText.Content.prototype.propertiesToCss = function (css) {
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

        return IFText.Paragraph.prototype.propertiesToCss.call(this, css);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {IFText.Content}
     * @private
     */
    IFText.prototype._content = null;

    /**
     * @type {GPoint}
     * @private
     */
    IFText.prototype._size = null;

    /**
     * @type {IFVertexContainer}
     * @private
     */
    IFText.prototype._vertices = null;

    /**
     * @type {boolean}
     * @private
     */
    IFText.prototype._verticesDirty = false;

    /**
     * Returns the content container of the text node
     * @returns {IFText.Content}
     */
    IFText.prototype.getContent = function () {
        // If we have a _content reference and it not
        // has ourself as a parent, then clear it, first
        if (this._content && this._content.getParent() !== this) {
            this._content = null;
        }

        if (!this._content) {
            // Find our content and save reference for faster access
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                if (child instanceof IFText.Content) {
                    this._content = child;
                    break;
                }
            }

            if (!this._content) {
                this._content = new IFText.Content();
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
    IFText.prototype.asHtml = function (segments) {
        var dummy = $('<div></div>');
        this._asHtml(dummy, this.getContent(), segments);
        return dummy.html();
    };

    /**
     * Clears and replaces the contents of this text from
     * a given html string
     * @param {String} html
     */
    IFText.prototype.fromHtml = function (html) {
        this.beginUpdate();
        try {
            var content = this.getContent();

            // Clear our contents
            content.clearChildren(true);

            // Parse html into a dummy element for iterating (if any)
            if (html && html !== "") {
                var doc = document.createElement('div');
                doc.innerHTML = html;
                for (var child = doc.firstChild; child !== null; child = child.nextSibling) {
                    this._fromHtml(child, content);
                }
            }
        } finally {
            this.endUpdate();
        }
    };

    /** @override */
    IFText.prototype.store = function (blob) {
        if (IFShape.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFText.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFText.prototype.restore = function (blob) {
        if (IFShape.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFText.GeometryProperties);
            this._verticesDirty = true;
            return true;
        }
        return false;
    };

    /** @override */
    IFText.prototype.rewindVertices = function (index) {
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
                    'width': textBox.getWidth() > 1 && this.$fw ? textBox.getWidth() + 'px' : '',
                    'height': textBox.getHeight() > 1 && this.$fh ? textBox.getHeight() + 'px' : ''
                })
                .html(this.asHtml(true))
                .appendTo($('body'));

            // Prepare size information
            var maxWidth = null;
            var maxHeight = null;

            container.find('span:not(:has(span))').each(function (index, span) {
                var $span = $(span);
                var rect = span.getBoundingClientRect();
                var textContent = $span.text();
                if (textContent.length === 0) {
                    return;
                }
                var char = textContent[0];

                // Ignore zero height spans and empty spans
                if (rect.height <= 0 || char === ' ') {
                    return;
                }

                var css = {
                    'font-family' : $span.css('font-family'),
                    'font-size' : $span.css('font-size')
                }
                var fontFamily = IFText.Block.cssToProperty('ff', css);
                var fontSize = IFText.Block.cssToProperty('fi', css);
                var fontVariant = ifFont.getVariant(fontFamily, IFFont.Style.Italic, IFFont.Weight.Regular);

                var baseline = ifFont.getGlyphBaseline(fontFamily, fontVariant, fontSize, char);
                var left = textBox.getX() + rect.left;
                var top = textBox.getY() + rect.top + baseline;
                var outline = ifFont.getGlyphOutline(fontFamily, fontVariant, fontSize, left, top, char);

                this._vertices.appendVertices(outline);

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
            this._size = maxWidth && maxHeight ? new GPoint(maxWidth, maxHeight) : null;

            // We're done here
            this._verticesDirty = false;
        }
        return this._vertices ? this._vertices.rewindVertices(index) : false;
    };

    /** @override */
    IFText.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
    };

    /** @override */
    IFText.prototype._calculateGeometryBBox = function () {
        // Always rewind to ensure integrity
        this.rewindVertices(0);

        // Not having a size means not having a bbox
        if (!this._size) {
            return null;
        }

        var textBox = GRect.fromPoints(new GPoint(0, 0), new GPoint(1, 1));
        if (this.$trf) {
            textBox = this.$trf.mapRect(textBox);
        }

        var width = this.$fw ? textBox.getWidth() : this._size.getX();
        var height = this.$fh ? textBox.getHeight() : this._size.getY();

        return new GRect(textBox.getX(), textBox.getY(), width, height);
    };

    /** @override */
    IFText.prototype._preparePaint = function (context) {
        if (IFShape.prototype._preparePaint.call(this, context)) {
            // Check if we need to clip rect
            var clipBox = this._getClipBox(context);
            if (clipBox) {
                context.canvas.clipRect(clipBox.getX(), clipBox.getY(), clipBox.getWidth(), clipBox.getHeight());
            }

            return true;
        }
        return false;
    };

    /** @override */
    IFText.prototype._finishPaint = function (context) {
        // Reset clipping if done previously
        if (this._getClipBox(context) !== null) {
            context.canvas.resetClip();
        }

        IFShape.prototype._finishPaint.call(this, context);
    };

    /** @override */
    IFText.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // For now, text is always hit-test by its bbox only so return ourself
        // TODO : Add support for detailed range hit test information here
        return new IFElement.HitResult(this);
    };

    /** @override */
    IFText.prototype._handleChange = function (change, args) {
        IFShape.prototype._handleChange.call(this, change, args);

        if (this._handleGeometryChangeForProperties(change, args, IFText.GeometryProperties) && change == IFNode._Change.BeforePropertiesChange) {
            this._verticesDirty = true;
        }

        if (change === IFNode._Change.BeforePropertiesChange) {
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
     * Returns a clip-box if required, otherwise null
     * @param context
     * @returns {GRect}
     * @private
     */
    IFText.prototype._getClipBox = function (context) {
        var bbox = this.getGeometryBBox();
        if (this._size &&
            ((this.$fw && this._size.getX() >= bbox.getWidth()) ||
                (this.$fh && this._size.getY() >= bbox.getHeight()))) {

            return new GRect(bbox.getX(), bbox.getY(),
                this.$fw ? bbox.getWidth() : context.canvas.getWidth(),
                this.$fh ? bbox.getHeight() : context.canvas.getHeight());
        }
        return null;
    };

    /**
     * Convert contents to html
     * @param parent
     * @param node
     * @param segments
     * @private
     */
    IFText.prototype._asHtml = function (parent, node, segments) {
        if (node instanceof IFText.Break) {
            $('<br>')
                .appendTo(parent);
        } else if (node instanceof IFText.Chunk) {
            var content = node.getContent();
            if (content && content !== "") {
                if (segments) {
                    for (var i = 0; i < content.length; ++i) {
                        $('<span></span>')
                            .text(content[i])
                            .appendTo(parent);
                    }
                } else {
                    parent.append(document.createTextNode(content));
                }
            }
        } else if (node instanceof IFText.Content) {
            // ignore root
        } else if (node instanceof IFText.Paragraph) {
            parent = $('<p></p>')
                .css(node.propertiesToCss({}))
                .appendTo(parent);
        } else if (node instanceof IFText.Span) {
            parent = $('<span></span>')
                .css(node.propertiesToCss({}))
                .appendTo(parent);
        }
        if (node.hasMixin(IFNode.Container)) {
            for (var child = node.getFirstChild(); child !== null; child = child.getNext()) {
                this._asHtml(parent, child, segments);
            }
        }
    };

    /**
     * @param element
     * @param parent
     * @private
     */
    IFText.prototype._fromHtml = function (node, parent) {
        if (node.nodeType === 1) {
            var nodeName = node.nodeName.toLowerCase();

            if (nodeName === 'p' || nodeName === 'div') {
                var paragraph = new IFText.Paragraph();
                paragraph.cssToProperties(node.style);
                parent.appendChild(paragraph);
                parent = paragraph;
            } else if (nodeName === 'span' || nodeName === 'b' || nodeName === 'strong' || nodeName === 'i') {
                var span = new IFText.Span();
                span.cssToProperties(node.style);
                parent.appendChild(span);
                parent = span;

                if (nodeName === 'b' || nodeName === 'strong') {
                    span.setProperty('fs', IFText.Block.TextStyle.Bold);
                } else if (nodeName === 'i') {
                    span.setProperty('fs', IFText.Block.TextStyle.Italic);
                }
            } else if (nodeName === 'br') {
                parent.appendChild(new IFText.Break());
                return; // no children for breaks
            } else {
                // ignore the element alltogether
                return;
            }

            for (var child = node.firstChild; child !== null; child = child.nextSibling) {
                this._fromHtml(child, parent);
            }
        } else if (node.nodeType === 3) {
            if (node.textContent !== "") {
                parent.appendChild(new IFText.Chunk(node.textContent));
            }
        }
    };

    /** @override */
    IFText.prototype.toString = function () {
        return "[IFText]";
    };

    _.IFText = IFText;
})(this);