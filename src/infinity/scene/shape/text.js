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
        this._tl = new IFPoint(0, 0);
        this._tr = new IFPoint(1, 0);
        this._br = new IFPoint(1, 1);
        this._bl = new IFPoint(0, 1);
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
        va: IFText.VerticalAlign.Top,
        /** Text transformation (not the same as transformation of the text box, which is $trf) */
        ttrf: null
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
    IFText.Chunk.prototype._handleChange = function (change, args) {
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
     * @mixes IFStylable
     * @private
     */
    IFText.Block = function () {
        this._setStyleDefaultProperties();
    };

    IFObject.inheritAndMix(IFText.Block, IFNode, [IFNode.Properties, IFNode.Store, IFStylable]);

    /** @override */
    IFText.Block.prototype.getStylePropertySets = function () {
        return [IFStylable.PropertySet.Text];
    };

    IFText.Block.propertyToCss = function (property, value, css) {
        if (property === '_tff') {
            css['font-family'] = value !== null ? value : '';
        } else if (property === '_tfi') {
            css['font-size'] = value !== null ? value + 'px' : '';
        } else if (property === '_tfw') {
            css['font-weight'] = value !== null ? value.toString() : '';
        } else if (property === '_tfs') {
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
        } else if (property === '_tcs') {
            css['letter-spacing'] = value !== null ? value + 'px' : '';
        } else if (property === '_tws') {
            css['word-spacing'] = value !== null ? value + 'px' : '';
        } else {
            throw new Error('Unimplemented property (propertyToCss): ' + property);
        }
    };

    IFText.Block.cssToProperty = function (property, css) {
        if (property === '_tff') {
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
        } else if (property === '_tfi') {
            var value = parseFloat(css['font-size']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === '_tfw') {
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
        } else if (property === '_tfs') {
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
        } else if (property === '_tcs') {
            var value = parseFloat(css['letter-spacing']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === '_tws') {
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
        this._handleStyleChange(change, args);

        var text = this.getText();
        if (text) {
            if (change == IFNode._Change.BeforeChildInsert || change == IFNode._Change.BeforeChildRemove) {
                text.beginUpdate();
            } else if (change == IFNode._Change.AfterChildInsert || change == IFNode._Change.AfterChildRemove) {
                text._runsDirty = true;
                text.endUpdate();
            }
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFText.Block.prototype._stylePrepareGeometryChange = function () {
        var text = this.getText();
        if (text) {
            text._runsDirty = true;
        }
    };

    /**
     * @param {{}} css
     * @returns {{}}
     */
    IFText.Block.prototype.propertiesToCss = function (css) {
        return this._propertiesToCss(css, IFStylable.PropertySetInfo[IFStylable.PropertySet.Text].geometryProperties, IFText.Block.propertyToCss);
    };

    /**
     * @param {{}} css
     */
    IFText.Block.prototype.cssToProperties = function (css) {
        this._cssToProperties(css, IFStylable.PropertySetInfo[IFStylable.PropertySet.Text].geometryProperties, IFText.Block.cssToProperty);
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
    }

    IFNode.inheritAndMix("txPara", IFText.Paragraph, IFText.Block, [IFNode.Container]);

    /** @override */
    IFText.Paragraph.prototype.getStylePropertySets = function () {
        return [IFStylable.PropertySet.Text, IFStylable.PropertySet.Paragraph];
    };

    IFText.Paragraph.propertyToCss = function (property, value, css) {
        if (property === '_pcc') {
            value = value !== null ? value : '';
            css['column-count'] = value;
            css['-webkit-column-count'] = value;
            css['-moz-column-count'] = value;
        } else if (property === '_pcg') {
            value = value !== null ? value : '';
            css['column-gap'] = value;
            css['-webkit-column-gap'] = value;
            css['-moz-column-gap'] = value;
        } else if (property === '_pwm') {
            if (value === null) {
                css['white-space'] = '';
                css['word-break'] = '';
            } else {
                switch (value) {
                    case IFStylable.ParagraphWrapMode.None:
                        css['white-space'] = 'nowrap';
                        break;
                    case IFStylable.ParagraphWrapMode.Words:
                        css['white-space'] = 'pre-wrap';
                        break;
                    case IFStylable.ParagraphWrapMode.All:
                        css['white-space'] = 'pre-wrap';
                        css['word-break'] = 'break-all';
                        break;
                }
            }
        } else if (property === '_pal') {
            if (value === null) {
                css['text-align'] = '';
            } else {
                switch (value) {
                    case IFStylable.ParagraphAlignment.Left:
                        css['text-align'] = 'left';
                        break;
                    case IFStylable.ParagraphAlignment.Center:
                        css['text-align'] = 'center';
                        break;
                    case IFStylable.ParagraphAlignment.Right:
                        css['text-align'] = 'right';
                        break;
                    case IFStylable.ParagraphAlignment.Justify:
                        css['text-align'] = 'justify';
                        break;
                }
            }
        } else if (property === '_pin') {
            css['text-indent'] = value !== null ? value + 'px' : '';
        } else if (property === '_plh') {
            css['line-height'] = value !== null ? value : '';
        } else {
            throw new Error('Unimplemented property (propertyToCss): ' + property);
        }
    };

    IFText.Paragraph.cssToProperty = function (property, css) {
        if (property === '_pcc') {
            var str = css['column-count'] || css['-webkit-column-count'] || css['-moz-column-count'];
            var value = parseInt(str);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === '_pcg') {
            var str = css['column-gap'] || css['-webkit-column-gap'] || css['-moz-column-gap'];
            var value = parseFloat(str);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === '_pwm') {
            var wspace = css['white-space'];
            var wbreak = css['word-break'];

            if (wspace === 'pre-wrap') {
                if (wbreak === 'break-all') {
                    return IFStylable.ParagraphWrapMode.All;
                } else {
                    return IFStylable.ParagraphWrapMode.Words;
                }
            } else if (wspace === 'nowrap') {
                return IFStylable.ParagraphWrapMode.None;
            }
        } else if (property === '_pal') {
            var value = css['text-align'];
            if (value === 'left') {
                return IFStylable.ParagraphAlignment.Left;
            } else if (value === 'center') {
                return IFStylable.ParagraphAlignment.Center;
            } else if (value === 'right') {
                return IFStylable.ParagraphAlignment.Right;
            } else if (value === 'justify') {
                return IFStylable.ParagraphAlignment.Justify;
            }
        } else if (property === '_pin') {
            var value = parseFloat(css['text-indent']);
            if (!isNaN(value)) {
                return value;
            }
        } else if (property === '_plh') {
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
        this._propertiesToCss(css, IFStylable.PropertySetInfo[IFStylable.PropertySet.Paragraph].geometryProperties, IFText.Paragraph.propertyToCss);
        return IFText.Block.prototype.propertiesToCss.call(this, css);
    };

    /**
     * @param {{}} css
     */
    IFText.Paragraph.prototype.cssToProperties = function (css) {
        this._cssToProperties(css, IFStylable.PropertySetInfo[IFStylable.PropertySet.Paragraph].geometryProperties, IFText.Paragraph.cssToProperty);
        IFText.Block.prototype.cssToProperties.call(this, css);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFText.Content Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFText.Content
     * @extends IFNode
     * @mixes IFNode.Properties
     * @mixes IFNode.Store
     * @mixes IFNode.Container
     * @private
     */
    IFText.Content = function () {
        IFNode.call(this);
    };

    IFNode.inheritAndMix("txContent", IFText.Content, IFNode, [IFNode.Properties, IFNode.Store, IFNode.Container]);

    /** @override */
    IFText.Content.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFText;
    };

    IFText.Content.prototype.propertiesToCss = function (css) {
        // Setup default color taking care of style if any
        css['color'] = 'black';

        var text = this._parent;
        if (text) {
            // Take color of fill pattern and assign it to editor if any
            var fillPattern = text.getProperty('_fpt');
            if (fillPattern && fillPattern instanceof IFColor) {
                css['color'] = fillPattern.asCSSString();
            }

            // Call property convert with our text as property source
            IFText.Block.prototype._propertiesToCss.call(text, css, IFStylable.PropertySetInfo[IFStylable.PropertySet.Text].geometryProperties, IFText.Block.propertyToCss);
            IFText.Block.prototype._propertiesToCss.call(text, css, IFStylable.PropertySetInfo[IFStylable.PropertySet.Paragraph].geometryProperties, IFText.Paragraph.propertyToCss);
        }

        return css;
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
     * The top left point of the text box (after some transformations applied the text box may be not rectangular)
     * @type {IFPoint}
     * @private
     */
    IFText.prototype._tl = null;

    /**
     * The top right point of the text box (after some transformations applied the text box may be not rectangular)
     * @type {IFPoint}
     * @private
     */
    IFText.prototype._tr = null;

    /**
     * The bottom left point of the text box (after some transformations applied the text box may be not rectangular)
     * @type {IFPoint}
     * @private
     */
    IFText.prototype._bl = null;

    /**
     * The bottom right point of the text box (after some transformations applied the text box may be not rectangular)
     * @type {IFPoint}
     * @private
     */
    IFText.prototype._br = null;

    /**
     * Used to store the shift of chars between calls of rewindVertices() and following readVertex()
     * @type {Number}
     * @private
     */
    IFText.prototype._verticalShift = 0;

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
            this._content._setScene(this._scene);
        }

        return this._content;
    };

    /**
     * Returns the bounding box of the content
     * @return {IFRect} null if there's no bbox or a valid bbox
     */
    IFText.prototype.getContentBBox = function () {
        return this._sizeBox ? this._sizeBox : null;
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
    IFText.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperties(['trf', 'ttrf'],
                [this.$trf ? this.$trf.multiplied(transform) : transform,
                    this.$ttrf ? this.$ttrf.multiplied(transform) : transform]);
        }
        IFElement.Transform.prototype._transformChildren.call(this, transform);
    };

    /** @override */
    IFText.prototype.getStylePropertySets = function () {
        return IFShape.prototype.getStylePropertySets.call(this).concat(
            IFStylable.PropertySet.Text, IFStylable.PropertySet.Paragraph);
    };

    /** @override */
    IFText.prototype.rewindVertices = function (index) {
        if (this._runsDirty || this._runs == null) {
            this._runs = [];

            // Calculate our actual text box and line length
            var tl = this._tl;
            var tr = this._tr;
            var bl = this._bl;
            var br = this._br;
            if (this.$trf) {
                tl = this.$trf.mapPoint(tl);
                tr = this.$trf.mapPoint(tr);
                bl = this.$trf.mapPoint(bl);
                br = this.$trf.mapPoint(br);
            }
            this._textBox = new IFRect.fromPoints(tl, tr, br, bl);// this.$ah ? this._textBox : new IFRect.fromPoints(tl, tr, br, bl);
            var textBoxOrig = this._textBox;
            if (this.$ttrf) {
                var ittrf = this.$ttrf.inverted();
                tl = ittrf.mapPoint(tl);
                tr = ittrf.mapPoint(tr);
                bl = ittrf.mapPoint(bl);
                br = ittrf.mapPoint(br);
                var maxlx = null;
                var minrx = null;
                var maxty = null;
                var minby = null;
                if (tl.getX() < br.getX() && tl.getX() < tr.getX() &&
                    bl.getX() < br.getX() && bl.getX() < tr.getX()) {

                    maxlx = tl.getX() >= bl.getX() ? tl.getX() : bl.getX();
                    minrx = br.getX() <= tr.getX() ? br.getX() : tr.getX();
                } else if (tl.getX() > br.getX() && tl.getX() > tr.getX() &&
                    bl.getX() > br.getX() && bl.getX() > tr.getX()) {

                    minrx = tl.getX() <= bl.getX() ? tl.getX() : bl.getX();
                    maxlx = br.getX() >= tr.getX() ? br.getX() : tr.getX();
                }
                if (tl.getY() < bl.getY() && tl.getY() < br.getY() &&
                    tr.getY() < bl.getY() && tr.getY() < br.getY()) {

                    maxty = tl.getY() >= tr.getY() ? tl.getY() : tr.getY();
                    minby = bl.getY() <= br.getY() ? bl.getY() : br.getY();
                } else if (tl.getY() > bl.getY() && tl.getY() > br.getY() &&
                    tr.getY() > bl.getY() && tr.getY() > br.getY()) {

                    minby = tl.getY() <= tr.getY() ? tl.getY() : tr.getY();
                    maxty = bl.getY() >= br.getY() ? bl.getY() : br.getY();
                }

                if (maxlx !== null && minrx !== null && maxty !== null && minby !== null) {
                    textBoxOrig = new IFRect.fromPoints(new IFPoint(maxlx, maxty), new IFPoint(minrx, minby));
                } else {
                    textBoxOrig = null;
                }
            }

            if (textBoxOrig) {
                // Create our temporary container for holding our html contents
                var container = $('<div></div>')
                    .addClass('contenteditable')
                    .css(this.getContent().propertiesToCss({}))
                    .css({
                        'position': 'absolute',
                        'top': '0px',
                        'left': '0px',
                        'visibility': 'hidden',
                        'width': textBoxOrig.getWidth() > 1 && !this.$aw ? textBoxOrig.getWidth() + 'px' : '',
                        'height': textBoxOrig.getHeight() > 1 && this.$ah ? textBoxOrig.getHeight() + 'px' : ''
                    })
                    .html(this.asHtml(true))
                    .appendTo($('body'));

                var sizeBox = null;
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
                    };

                    var fontFamily = IFText.Block.cssToProperty('_tff', css);
                    var fontSize = IFText.Block.cssToProperty('_tfi', css);
                    var fontStyle = IFText.Block.cssToProperty('_tfs', css);
                    var fontWeight = IFText.Block.cssToProperty('_tfw', css);
                    var fontVariant = ifFont.getVariant(fontFamily, fontStyle, fontWeight);
                    var baseline = ifFont.getGlyphBaseline(fontFamily, fontVariant, fontSize);

                    this._runs.push({
                        x: textBoxOrig.getX() + rect.left,
                        y: textBoxOrig.getY() + rect.top + baseline,
                        char: char,
                        family: fontFamily,
                        variant: fontVariant,
                        size: fontSize
                    });

                    var charSz = ifFont.getGlyphCharSzRect(fontFamily, fontVariant, fontSize, char);
                    var charRect = new IFRect(rect.left + charSz.getX(), rect.top, charSz.getWidth(), rect.height);

                    sizeBox = sizeBox ? sizeBox.united(charRect) : charRect;
                }.bind(this));

                var verticalShift = 0;
                if (sizeBox) {
                    this._sizeBox = new IFRect(sizeBox.getX() + textBoxOrig.getX(), sizeBox.getY() + textBoxOrig.getY(),
                        sizeBox.getWidth(), sizeBox.getHeight());

                    if (this.$ttrf) {
                        this._sizeBox = this.$ttrf.mapRect(this._sizeBox);
                    }
                    // Calculate vertical shift depending on vertical alignment
                    if (this._sizeBox && this._sizeBox.getHeight() < this._textBox.getHeight()) {
                        switch (this.$va) {
                            case IFText.VerticalAlign.Top:
                                verticalShift = this._textBox.getY() - this._sizeBox.getY();
                                break;

                            case IFText.VerticalAlign.Middle:
                                verticalShift = this._textBox.getY() - this._sizeBox.getY() +
                                    (this._textBox.getHeight() - this._sizeBox.getHeight()) / 2;
                                break;

                            case IFText.VerticalAlign.Bottom:
                                verticalShift = this._textBox.getY() - this._sizeBox.getY() +
                                    this._textBox.getHeight() - this._sizeBox.getHeight();
                                break;
                        }
                    } else if (this._sizeBox) {
                        verticalShift = this._textBox.getY() - this._sizeBox.getY();
                    }
                    this._sizeBox = this._sizeBox.translated(0, verticalShift);
                } else {
                    this._sizeBox = null;
                }

                this._verticalShift = verticalShift;

                // Remove our container now
                container.remove();

                // We're done here
                this._runsDirty = false;

                if (this._sizeBox && (this.$ah || this.$aw)) {
                    var lx = this.$aw ? this._sizeBox.getX() : this._textBox.getX();
                    var w = this.$aw ? this._sizeBox.getWidth() : this._textBox.getWidth();
                    var ty = this.$ah ? this._sizeBox.getY() : this._textBox.getY();
                    var h = this.$ah ? this._sizeBox.getHeight() : this._textBox.getHeight();
                    this._textBox = new IFRect(lx, ty, w, h);
                }
            }
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
            var transform = this.$ttrf && !this.$ttrf.isIdentity() ? this.$ttrf : null;
            if (this._verticalShift) {
                var vtrans = new IFTransform(1, 0, 0, 1, 0, this._verticalShift);
                transform = transform ? transform.multiplied(vtrans) : vtrans;
            }
            if (transform) {
                this._runItOutline = new IFVertexTransformer(this._runItOutline, transform);
            }
            if (!this._runItOutline.rewindVertices(0)) {
                throw new Error('Unexpected end of outline');
            }
            return this._runItOutline.readVertex(vertex);
        }
    };

    /**
     * Intended to be called for text box resize transformations
     * @param {IFTransform} transform
     */
    IFText.prototype.textBoxTransform = function (transform) {
        if (transform && !transform.isIdentity()) {
            var trf = transform;
            if (this.$ah || this.$aw) {
                var oldVisualTextBox = this._textBox;
                var newVisualTextBox = transform.mapRect(oldVisualTextBox);
                var tl = this._tl;
                var tr = this._tr;
                var bl = this._bl;
                var br = this._br;
                if (this.$trf) {
                    tl = this.$trf.mapPoint(tl);
                    tr = this.$trf.mapPoint(tr);
                    bl = this.$trf.mapPoint(bl);
                    br = this.$trf.mapPoint(br);
                }
                var textBox = new IFRect.fromPoints(tl, tr, br, bl);
                trf = new IFTransform()
                    .translated(-textBox.getX(), -textBox.getY())
                    .scaled(this.$aw ? newVisualTextBox.getWidth() / textBox.getWidth() : 1,
                        this.$ah ? newVisualTextBox.getHeight() / textBox.getHeight() : 1)
                    .translated(newVisualTextBox.getX(), newVisualTextBox.getY());

            }

            this.setProperties(['ah', 'aw', 'trf'],
                [false, false, this.$trf ? this.$trf.multiplied(trf) : trf]);
        }
    };

    /**
     * Remember the current text box as a starting box for all the text transformations,
     * and set the 'trf' property to null
     */
    IFText.prototype.useTextBoxAsBase = function () {
        var textBox = null;
        if (this._textBox && !this._runsDirty) {
            textBox = this._textBox;
        } else {
            // this._tl, this._tr, this._bl, and this._br may be not the corners of the correct rectangle,
            // so it is important always to map them individually, and only after that to construct a new rectangle
            var tl = this._tl;
            var tr = this._tr;
            var bl = this._bl;
            var br = this._br;
            if (this.$trf) {
                tl = this.$trf.mapPoint(tl);
                tr = this.$trf.mapPoint(tr);
                bl = this.$trf.mapPoint(bl);
                br = this.$trf.mapPoint(br);
            }
            textBox = new IFRect.fromPoints(tl, tr, br, bl);
        }
        this._tl = textBox.getSide(IFRect.Side.TOP_LEFT);
        this._tr = textBox.getSide(IFRect.Side.TOP_RIGHT);
        this._br = textBox.getSide(IFRect.Side.BOTTOM_RIGHT);
        this._bl = textBox.getSide(IFRect.Side.BOTTOM_LEFT);
        this.setProperty('trf', null);
    };

    /** @override */
    IFText.prototype._calculateGeometryBBox = function () {
        // Always rewind to ensure integrity
        this.rewindVertices(0);
        var bbox = this._textBox;
        if (this._sizeBox) {
            bbox = bbox.united(this._sizeBox);
        }
        return bbox;
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
    IFText.prototype._stylePrepareGeometryChange = function () {
        IFShape.prototype._stylePrepareGeometryChange.call(this);
        this._runsDirty = true;
    };

    /** @override */
    IFText.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFText.GeometryProperties, function (property, value) {
                if (property === 'ttrf' && value) {
                    return IFTransform.serialize(value);
                }
                return value;
            });

            if (this._content) {
                args.ct = IFNode.store(this._content);
            }
            args.tlx = this._tl.getX();
            args.tly = this._tl.getY();
            args.trx = this._tr.getX();
            args.try = this._tr.getY();
            args.blx = this._bl.getX();
            args.bly = this._bl.getY();
            args.brx = this._br.getX();
            args.bry = this._br.getY();
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFText.GeometryProperties, function (property, value) {
                if (property === 'ttrf' && value) {
                    return IFTransform.deserialize(value);
                }
                return value;
            });

            if (args.ct) {
                this._content = IFNode.restore(args.ct);
                this._content._parent = this;
                this._content._scene = this._scene;
            }

            this._tl = new IFPoint(args.tlx, args.tly);
            this._tr = new IFPoint(args.trx, args.try);
            this._br = new IFPoint(args.brx, args.bry);
            this._bl = new IFPoint(args.blx, args.bly);
            this._runsDirty = true;
        } else if (change === IFNode._Change.Attached) {
            if (this._content) {
                this._content._setScene(this._scene);
            }
        } else if (change === IFNode._Change.Detach) {
            if (this._content) {
                this._content._setScene(null);
            }
        }

        IFShape.prototype._handleChange.call(this, change, args);

        if (this._handleGeometryChangeForProperties(change, args, IFText.GeometryProperties) && change == IFNode._Change.BeforePropertiesChange) {
            var ahIdx = args.properties.indexOf('ah');
            if (ahIdx >= 0 && args.values[ahIdx] === true && !this.$ah && this._textBox && !this._runsDirty) {
                // As 'ah' changes to true, we need to substitute our original text box such a way,
                // that after the transformation it will be identical to our current visual text box.
                this._tl = this._textBox.getSide(IFRect.Side.TOP_LEFT);
                this._tr = this._textBox.getSide(IFRect.Side.TOP_RIGHT);
                this._br = this._textBox.getSide(IFRect.Side.BOTTOM_RIGHT);
                this._bl = this._textBox.getSide(IFRect.Side.BOTTOM_LEFT);
                if (this.$trf) {
                    var itrf = this.$trf.inverted();
                    this._tl = itrf.mapPoint(this._tl);
                    this._tr = itrf.mapPoint(this._tr);
                    this._bl = itrf.mapPoint(this._bl);
                    this._br = itrf.mapPoint(this._br);
                }
            }
            this._runsDirty = true;
        }

        if (change === IFNode._Change.BeforePropertiesChange) {
            var transformIdx = args.properties.indexOf('trf');
            if (transformIdx >= 0) {
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
                    span.setProperty('_tfw', IFFont.Weight.Bold);
                } else if (nodeName === 'i') {
                    span.setProperty('_tfs', IFFont.Style.Italic);
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
    IFText.prototype._requireMiterLimitApproximation = function () {
        return true;
    };

    /** @override */
    IFText.prototype.toString = function () {
        return "[IFText]";
    };

    _.IFText = IFText;
})(this);