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
        this._runs = [];
        this._runsDirty = false;
    }

    IFNode.inherit("text", IFText, IFShape);

    /**
     * Vertical align of a text
     */
    IFText.VerticalAlign = {
        Top: 't',
        Middle: 'm',
        Bottom: 'b'
    };

    /**
     * The geometry properties of text with their default values
     */
    IFText.GeometryProperties = {
        /** Auto-width or not */
        aw: true,
        /** Auto-height or not */
        ah: true,
        /** Vertical alignment */
        va: IFText.VerticalAlign.Top
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
    IFText.Chunk.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText.Block;
    };

    /** @override */
    IFText.Chunk._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            args.cnt = this._content;
        } else if (change === IFNode._Change.Restore) {
            this._content = args.cnt;
        }

        IFNode.prototype._handleChange.call(this, change, args);
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
     * The geometry properties of a block with their default values
     */
    IFText.Block.Properties = {
        /** The font family */
        ff: null,
        /** The font size */
        fi: null,
        /** The font-weight (IFFont.Weight) */
        fw: null,
        /** The font-style (IFFont.Style) */
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
            css['font-family'] = value !== null ? value : '';
        } else if (property === 'fi') {
            css['font-size'] = value !== null ? value + 'px' : '';
        } else if (property === 'fw') {
            css['font-weight'] = value !== null ? value.toString() : '';
        } else if (property === 'fs') {
            if (value === null) {
                css['font-style'] = '';
            } else {
                switch (value) {
                    case IFFont.Style.Normal:
                        css['font-style'] = 'normal';
                        break;
                    case IFFont.Style.Italic:
                        css['font-style'] = 'italic';
                        break;
                    default:
                        break;
                }
            }
        } else if (property === 'fc') {
            css['color'] = value !== null ? value.asCSSString() : '';
        } else if (property === 'cs') {
            css['letter-spacing'] = value !== null ? value + 'px' : '';
        } else if (property === 'ws') {
            css['word-spacing'] = value !== null ? value + 'px' : '';
        } else {
            throw new Error('Unimplemented property (propertyToCss): ' + property);
        }
    };

    IFText.Block.cssToProperty = function (property, css) {
        if (property === 'ff') {
            if (css['font-family']) {
                var family = css['font-family'];
                if (family.length > 0) {
                    if (family.indexOf(',') >= 0) {
                        family = family.substr(0, family.indexOf(',')).trim();
                    }

                    if (family.charAt(0) === '"' || family.charAt(0) === "'") {
                        family = family.substr(1);
                    }
                    if (family.charAt(family.length - 1) === '"' || family.charAt(family.length - 1) === "'") {
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
        } else if (property === 'fw') {
            var value = parseInt(css['font-weight']);
            if (!isNaN(value)) {
                return value;
            } else {
                value = css['font-weight'];
                if (value === 'normal') {
                    return IFFont.Weight.Regular;
                } else if (value === 'bold') {
                    return IFFont.Weight.Bold;
                }
            }
        } else if (property === 'fs') {
            if (css['font-style'] === 'normal') {
                return IFFont.Style.Normal;
            } else if (css['font-style'] === 'italic') {
                return IFFont.Style.Italic;
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
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFText.Block.Properties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFText.Block.Properties);
        }

        var text = this.getText();
        if (text) {
            if (text._handleGeometryChangeForProperties(change, args, IFText.Block.Properties) && change == IFNode._Change.BeforePropertiesChange) {
                text._runsDirty = true;
            } else if (change == IFNode._Change.BeforeChildInsert || change == IFNode._Change.BeforeChildRemove) {
                text.beginUpdate();
            } else if (change == IFNode._Change.AfterChildInsert || change == IFNode._Change.AfterChildRemove) {
                text._runsDirty = true;
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
        lh: null
    };

    IFText.Paragraph.propertyToCss = function (property, value, css) {
        if (property === 'cc') {
            value = value !== null ? value : '';
            css['column-count'] = value;
            css['-webkit-column-count'] = value;
            css['-moz-column-count'] = value;
        } else if (property === 'cg') {
            value = value !== null ? value : '';
            css['column-gap'] = value;
            css['-webkit-column-gap'] = value;
            css['-moz-column-gap'] = value;
        } else if (property === 'wm') {
            if (value === null) {
                css['white-space'] = '';
                css['word-break'] = '';
            } else {
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
            }
        } else if (property === 'al') {
            if (value === null) {
                css['text-align'] = '';
            } else {
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
            }
        } else if (property === 'in') {
            css['text-indent'] = value !== null ? value + 'px' : '';
        } else if (property === 'lh') {
            css['line-height'] = value !== null ? value : '';
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
        } else {
            throw new Error('Unimplemented property (cssToProperty): ' + property);
        }
        return null;
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

    /** @override */
    IFText.Paragraph.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFText.Paragraph.Properties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFText.Paragraph.Properties);
        }

        var text = this.getText();
        if (text) {
            if (text._handleGeometryChangeForProperties(change, args, IFText.Paragraph.Properties) && change == IFNode._Change.BeforePropertiesChange) {
                text._runsDirty = true;
            }
        }

        IFText.Block.prototype._handleChange.call(this, change, args);
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

        // Setup default font stuff
        this.$ff = 'Open Sans';
        this.$fi = 20;
        this.$fw = IFFont.Weight.Regular;
        this.$fs = IFFont.Style.Normal;
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
        // Setup default color taking care of style if any
        var color = 'black';
        var text = this._parent;
        if (text) {
            // TODO : Take color of fill pattern and assign it to editor
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
     * @type {IFPoint}
     * @private
     */
    IFText.prototype._size = null;

    /**
     * @type {Array<{}>}
     * @private
     */
    IFText.prototype._runs = null;

    /**
     * @type {boolean}
     * @private
     */
    IFText.prototype._runsDirty = false;

    /**
     * @type {number}
     * @private
     */
    IFText.prototype._runItIndex = null;

    /**
     * @type {IFVertexSource}
     * @private
     */
    IFText.prototype._runItOutline = null;

    /**
     * Returns the content container of the text node
     * @returns {IFText.Content}
     */
    IFText.prototype.getContent = function () {
        if (!this._content) {
            this._content = new IFText.Content();
            this._content._parent = this;
        }

        return this._content;
    };

    /**
     * Returns the bounding box of the content
     * @return {IFRect} null if there's no bbox or a valid bbox
     */
    IFText.prototype.getContentBBox = function () {
        return this._size ? new IFRect(0, 0, this._size.getX(), this._size.getY()) : null;
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
    IFText.prototype.rewindVertices = function (index) {
        if (this._runsDirty || this._runs == null) {
            this._runs = [];

            // Calculate our actual text box and line length
            var textBox = IFRect.fromPoints(new IFPoint(0, 0), new IFPoint(1, 1));
            if (this.$trf) {
                textBox = this.$trf.mapRect(textBox);
            }

            // Create our temporary container for holding our html contents
            var container = $('<div></div>')
                .addClass('contenteditable')
                .css(this.getContent().propertiesToCss({}))
                .css({
                    'position': 'absolute',
                    'top': '0px',
                    'left': '0px',
                    'visibility': 'hidden',
                    'width': textBox.getWidth() > 1 && !this.$aw ? textBox.getWidth() + 'px' : '',
                    'height': textBox.getHeight() > 1 && this.$ah ? textBox.getHeight() + 'px' : ''
                })
                .html(this.asHtml(true))
                .appendTo($('body'));

            // Calculate dimensions, first
            var maxWidth = null;
            var maxHeight = null;
            container.find('p,span').each(function (index, element) {
                var $element = $(element);
                var offset = $element.offset();
                var width = $element.outerWidth();
                var height = $element.outerHeight();

                if (maxWidth === null || (offset.left + width) > maxWidth) {
                    maxWidth = offset.left + width;
                }
                if (maxHeight === null || (offset.top + height) > maxHeight) {
                    maxHeight = offset.top + height;
                }
            }.bind(this));

            // Assign calculated dimensions
            this._size = maxWidth !== null && maxHeight !== null ? new IFPoint(maxWidth, maxHeight) : null;

            // Calculate vertical shift depending on vertical alignment
            var verticalShift = 0;
            if (!this.$ah && this._size && this._size.getY() < textBox.getHeight()) {
                switch (this.$va) {
                    case IFText.VerticalAlign.Middle:
                        verticalShift = (textBox.getHeight() - this._size.getY()) / 2;
                        break;

                    case IFText.VerticalAlign.Bottom:
                        verticalShift = textBox.getHeight() - this._size.getY();
                        break;
                }
            }

            container.find('span:not(:has(span))').each(function (index, span) {
                var $span = $(span);
                var rect = span.getBoundingClientRect();
                var textContent = $span.text();
                if (textContent.length === 0) {
                    return;
                }
                var char = textContent[0];

                // Ignore zero height/width, spaces and binary chars
                if (rect.height <= 0 || rect.width <= 0 || char === ' ' || char >= '\x00' && char <= '\x1F') {
                    return;
                }

                var css = {
                    'font-family': $span.css('font-family'),
                    'font-size': $span.css('font-size'),
                    'font-style': $span.css('font-style'),
                    'font-weight': $span.css('font-weight')
                }
                var fontFamily = IFText.Block.cssToProperty('ff', css);
                var fontSize = IFText.Block.cssToProperty('fi', css);
                var fontStyle = IFText.Block.cssToProperty('fs', css);
                var fontWeight = IFText.Block.cssToProperty('fw', css);
                var fontVariant = ifFont.getVariant(fontFamily, fontStyle, fontWeight);
                var baseline = ifFont.getGlyphBaseline(fontFamily, fontVariant, fontSize, char);

                this._runs.push({
                    x: textBox.getX() + rect.left,
                    y: textBox.getY() + rect.top + verticalShift + baseline,
                    char: char,
                    family: fontFamily,
                    variant: fontVariant,
                    size: fontSize
                });
            }.bind(this));

            // Remove our container now
            container.remove();

            // We're done here
            this._runsDirty = false;
        }

        if (this._runs && this._runs.length > 0) {
            this._runItIndex = 0;
            this._runItOutline = null;
            return true;
        }

        return false;
    };

    /** @override */
    IFText.prototype.readVertex = function (vertex) {
        if (this._runItOutline) {
            if (this._runItOutline.readVertex(vertex)) {
                return true;
            } else {
                this._runItOutline = null;
                if (++this._runItIndex >= this._runs.length) {
                    return false;
                }
            }
        }

        if (!this._runItOutline) {
            var run = this._runs[this._runItIndex];
            if (!run) {
                return false;
            }
            this._runItOutline = ifFont.getGlyphOutline(run.family, run.variant, run.size, run.x, run.y, run.char);
            if (!this._runItOutline.rewindVertices(0)) {
                throw new Error('Unexpected end of outline');
            }
            return this._runItOutline.readVertex(vertex);
        }
    };

    /** @override */
    IFText.prototype._calculateGeometryBBox = function () {
        // Always rewind to ensure integrity
        this.rewindVertices(0);

        // Not having a size means not having a bbox
        if (!this._size) {
            return null;
        }

        var textBox = IFRect.fromPoints(new IFPoint(0, 0), new IFPoint(1, 1));
        if (this.$trf) {
            textBox = this.$trf.mapRect(textBox);
        }

        var width = !this.$aw ? textBox.getWidth() : this._size.getX();
        var height = !this.$ah ? textBox.getHeight() : this._size.getY();

        return new IFRect(textBox.getX(), textBox.getY(), width, height);
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
        return new IFElement.HitResultInfo(this);
    };

    /** @override */
    IFText.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFText.GeometryProperties);

            if (this._content) {
                args.ct = IFNode.store(this._content);
            }
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFText.GeometryProperties);

            if (args.ct) {
                this._content = IFNode.restore(args.ct);
                this._content._parent = this;
            }

            this._runsDirty = true;
        }

        IFShape.prototype._handleChange.call(this, change, args);

        if (this._handleGeometryChangeForProperties(change, args, IFText.GeometryProperties) && change == IFNode._Change.BeforePropertiesChange) {
            this._runsDirty = true;
        }

        if (change === IFNode._Change.BeforePropertiesChange) {
            var transformIdx = args.properties.indexOf('trf');
            if (transformIdx >= 0 && !this._runsDirty) {
                // TODO : Optimize for cases where no invalidation of vertices is required
                /*
                 // Check whether only translation was changed and if that's
                 // the case we'll simply translate our existing vertices,
                 // otherwise we'll invalidate the vertices
                 var newTransform = args.values[transformIdx];
                 var inverseTransform = this.$trf ? this.$trf.inverted() : new IFTransform(1, 0, 0, 1, 0, 0);
                 var deltaTransform = newTransform.multiplied(inverseTransform);
                 if (deltaTransform.isIdentity(true)) {
                 if (this._vertices) {
                 var translation = deltaTransform.getTranslation();
                 this._vertices.transformVertices(new IFTransform(1, 0, 0, 1, translation.getX(), translation.getY()));
                 }
                 } else {
                 this._runsDirty = true;
                 }
                 */
                this._runsDirty = true;
            }
        }
    };

    /**
     * Returns a clip-box if required, otherwise null
     * @param context
     * @returns {IFRect}
     * @private
     */
    IFText.prototype._getClipBox = function (context) {
        var bbox = this.getGeometryBBox();
        if (this._size &&
            ((!this.$aw && this._size.getX() >= bbox.getWidth()) ||
                (!this.$ah && this._size.getY() >= bbox.getHeight()))) {

            return new IFRect(bbox.getX(), bbox.getY(),
                !this.$aw ? bbox.getWidth() : context.canvas.getWidth(),
                !this.$ah ? bbox.getHeight() : context.canvas.getHeight());
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
                .css('margin', '0px') // !!
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
                    span.setProperty('fw', IFFont.Weight.Bold);
                } else if (nodeName === 'i') {
                    span.setProperty('fs', IFFont.Style.Italic);
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