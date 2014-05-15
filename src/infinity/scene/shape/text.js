(function (_) {

    var _fontArray = null;
    var _font = null;

    var request = new XMLHttpRequest();
    request.open('get', '../bower_components/opentype.js/fonts/Arial.ttf', true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        if (request.status !== 200) {
            //return callback('Font could not be loaded: ' + request.statusText);
        }
        _fontArray = request.response;
        font = opentype.parse(_fontArray);
        if (!font.supported) {
            return callback('Font is not supported (is this a Postscript font?)');
        }
    };
    request.send();


    var __SIZE = 48;


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
        this._setDefaultProperties(GXText.Block.GeometryProperties);
    };

    /**
     * The geometry properties of a block with their default values
     */
    GXText.Block.GeometryProperties = {
        /** The font family */
        ff: null,
        /** The font size */
        fs: null,
        /** Whether font is bold or not */
        fb: null,
        /** Whether font is italic or not */
        fi: null,
        /** The font color */
        fc: null,
        /** The character spacing */
        cs: null,
        /** The word spacing */
        ws: null
    };

    GObject.inheritAndMix(GXText.Block, GXNode, [GXNode.Properties, GXNode.Store]);

    /** @override */
    GXText.Block.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText.Block;
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
        GXBlock.call(this);
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
        GXBlock.call(this);
        this._setDefaultProperties(GXText.Paragraph.GeometryProperties);
    }

    GXNode.inheritAndMix("txPara", GXText.Paragraph, GXText.Block, [GXNode.Container]);

    /**
     * The geometry properties of a paragraph with their default values
     */
    GXText.Paragraph.GeometryProperties = {
        /** Whether to hyphenate or not */
        hy: null,
        /** The paragraph's alignment (0=left,1=center,2=right,3=justify) */
        al: null,
        /** The first line intendation */
        in: null,
        /** The line spacing */
        ls: null,
        /** Top margin */
        mt: null,
        /** Right margin */
        mr: null,
        /** Bottom margin */
        mb: null,
        /** Left margin */
        ml: null
    };

    /** @override */
    GXText.Paragraph.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText.Content;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXText.Content Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXText.Content
     * @extends GXText.Block
     * @mixes GXNode.Container
     * @private
     */
    GXText.Content = function () {
        GXBlock.call(this);
        this._flags |= GXNode.Flag.Shadow;
    }

    GXNode.inheritAndMix("txContent", GXText.Content, GXText.Block, [GXNode.Container]);

    /** @override */
    GXText.Content.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXText;
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


    var cv = document.createElement('canvas');
    var context = cv.getContext('2d');




    GXText.prototype._buildRuns = function (lineLength, stack, runs, block) {
        var _getProperty = function (property, defaultValue) {
            var val = block.getProperty(property, false, null);
            if (val === null) {
                for (var i = stack.length - 1; i >= 0; --i) {
                    val = stack[i].getProperty(property, false, null);
                    if (val !== null) {
                        break;
                    }
                }
            }
            return val !== null ? val : defaultValue;
        };

        if (block instanceof GXText.Paragraph) {
            runs.push({
                type: 'paragraph',
                hyphenate: _getProperty('hy', false),
                alignment: _getProperty('al', 0),
                indentation: _getProperty('in', 0),
                lineSpacing: _getProperty('ls', 0),
                marginTop: _getProperty('mt', 0),
                marginRight: _getProperty('mr', 0),
                marginBottom: _getProperty('mb', 0),
                marginLeft: _getProperty('ml', 0)
            })
        }
        else if (block instanceof GXText.Span) {
            var value = block.getProperty('v');
            if (value !== null && value !== "") {
                var words = value.split(/\s/);

                for (var i = 0; i < words.length; ++i) {
                    var word = words[i];

                    var run = {
                        type: 'word',
                        value: word,
                        charSpacing: _getProperty('cs', 0),
                        wordSpacing: _getProperty('ws', 0),
                        fontFamily: _getProperty('ff', 'Arial'),
                        fontSize: _getProperty('fs', 12),
                        fontColor: _getProperty('fc', new GXColor(GXColor.Type.Black)),
                        fontBold: _getProperty('fb', false),
                        fontItalic: _getProperty('fi', false)
                    };

                    context.font = run.fontSize + "px " + run.fontFamily;
                    run.metrics = context.measureText(word);

                    runs.push(run);
                }
            }
        }

        if (block.hasMixin(GXNode.Container)) {
            stack.push(block);

            for (var child = block.getFirstChild(); child !== null; child = child.getNext()) {
                this._buildRuns(lineLength, stack, runs, child);
            }

            stack.pop();
        }
    };

    GXText.prototype._buildHtml = function (stack, block) {
        var _getProperty = function (property, defaultValue) {
            var val = block.getProperty(property, false, null);
            if (val === null) {
                for (var i = stack.length - 1; i >= 0; --i) {
                    val = stack[i].getProperty(property, false, null);
                    if (val !== null) {
                        break;
                    }
                }
            }
            return val !== null ? val : defaultValue;
        };

        var result = "";

        if (block instanceof GXText.Paragraph) {
            result += '<p style="';

            result += 'margin:' +
                _getProperty('mt', 0) + 'px ' +
                _getProperty('mr', 0) + 'px ' +
                _getProperty('mb', 0) + 'px ' +
                _getProperty('ml', 0) + 'px;' +
                'line-height: 1;';

            result += '">';
        }
        else if (block instanceof GXText.Span) {
            var value = block.getProperty('v');
            if (value !== null && value !== "") {
                result += '<span style="';

                var fontSize = _getProperty('fs', 12);

                result += 'letter-spacing:' +
                    _getProperty('cs', 0) + 'px;' +
                    'font-family:' +
                    _getProperty('ff', 'Arial') + ';' +
                    'font-size:' +
                    fontSize + 'px;' +
                'display:inline-block';

                result += '" data-fs="' + fontSize + '">';

                for (var i = 0; i < value.length; ++i) {
                    result += '<span style="position:relative" data-segment="true">' + value[i] + '</span>'
                }
            }
        }

        if (block.hasMixin(GXNode.Container)) {
            stack.push(block);

            for (var child = block.getFirstChild(); child !== null; child = child.getNext()) {
                result += this._buildHtml(stack, child);
            }

            stack.pop();
        }

        if (block instanceof GXText.Paragraph) {
            result += '</p>';
        }
        else if (block instanceof GXText.Span) {
            result += '</span>';
        }

        return result;
    };

    var _counter = 0;

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

            var html = this._buildHtml([], this.getContent());

            //console.log(html);

            var tmp = $('<div></div>')
                .css({
                    'position': 'absolute',
                    'z-index': '999999',
                    'top': '0px',
                    'left': '0px'
                    //'visibility': 'hidden'/*,
                    //'width': textBox.getWidth() > 1 ? textBox.getWidth() + 'px' : 'auto'*/
                })
                .html(html)
                .appendTo($('body'));

            var lineBL = 0;
            var yMin = null;
            var yMax = null;
            var maxFontSize = 72;
            var maxHeight = null;
            var minTop = null;

            tmp.find('[data-segment="true"]').each(function (index, span) {
                var y1 = span.offsetTop;
                var y2 = span.offsetTop + span.offsetHeight;

                if (yMin == null || y1 < yMin) yMin = y1;
                if (yMax == null || y2 > yMax) yMax = y2;

                if (minTop == null || yMin < minTop) minTop = yMin;
                if (maxHeight == null || span.offsetHeight > maxHeight) maxHeight = span.offsetHeight;
            });

            lineBL = Math.abs(yMax - yMin);

            var maxAscender = (font.ascender) * (1 / font.unitsPerEm * maxFontSize);
            var totalAscender = (font.ascender - font.descender) * (1 / font.unitsPerEm * maxFontSize);
            var x = font.charToGlyph('x');
            var midBL = (x.yMax ) * (1 / font.unitsPerEm * maxFontSize);



            // For text leading values, we measure a multiline
            // text container as built by the browser.
            var leadDiv = document.createElement("div");
            leadDiv.style.position = "absolute";
            leadDiv.style.opacity = 0;
            leadDiv.style.font = maxFontSize + "px 'Arial'";
            var numLines = 10;
            leadDiv.innerHTML = 'WqA';
            for (var i = 1; i < numLines; i++) {
                leadDiv.innerHTML += "<br/>" + 'WqA';
            }
            document.body.appendChild(leadDiv);

            // First we guess at the leading value, using the standard TeX ratio.
            var __leading = 0.2 * maxFontSize;

            // Shortcut function for getting computed CSS values
            var getCSSValue = function (element, property) {
                return document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
            };

            // We then try to get the real value based on how
            // the browser renders the text.

            var leadDivHeight = getCSSValue(leadDiv,"height");
            leadDivHeight = leadDivHeight.replace("px","");
            if (leadDivHeight >= maxFontSize * numLines) {
                __leading = (leadDivHeight / numLines) | 0;
            }
            document.body.removeChild(leadDiv);
            __leading = __leading - maxFontSize;




            var __baseline = maxFontSize;


            //console.log('BUILD_TEXT_PATH (' + (_counter++) + ': ' + html);

            tmp.find('[data-segment="true"]').each(function (index, span) {

                var x = span.offsetLeft + textBox.getX();
                var y = /*span.offsetTop + */textBox.getY();
                var glyph = font.charToGlyph(span.textContent[0]);



                var fontSize = parseInt(span.parentNode.getAttribute('data-fs'));

                var scale = 1 / glyph.font.unitsPerEm * fontSize;
                //var dy = glyph.yMax * scale;

                var asc = glyph.font.ascender / glyph.font.unitsPerEm;
                var leading = (glyph.font.ascender - glyph.font.descender) * scale;


                var maxHeight = glyph.yMax - glyph.yMin;
                var baseline = /* glyphMargin + glyphH */fontSize * glyph.yMax / maxHeight;



if (isNaN(baseline)) {
    return;
}


                //console.log('SPAN: ' + span.textContent + '; X=' + span.offsetLeft + '; Y=' + span.offsetTop + ';W=' + span.offsetWidth + '; BL=' + baseline);

                //console.log('LEAD: ' + (glyph.font.ascender * scale));





                var bottom = span.getBoundingClientRect().bottom;

                //console.log('BOTTOM: ' + bottom);


                var asc = maxFontSize * 0.2;// (glyph.font.ascender - glyph.yMax) * (1 / glyph.font.unitsPerEm * maxFontSize);

                var dy = maxAscender - (__leading / 2);//0;//bottom;//__baseline - asc;//36 - asc;// (fontSize - (glyph.font.ascender * scale));

                var path = glyph.getPath(x, y + dy, fontSize);
                //var path = font.getPath(run, x, y, run.fontSize);
                // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).


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


            }.bind(this));

            tmp.remove();
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
        var html = this._buildHtml([], this.getContent());

        var tmp = $('<div></div>')
            .css({
                'position': 'absolute',
                'z-index': '999999'
                //'visibility': 'hidden'/*,
                //'width': textBox.getWidth() > 1 ? textBox.getWidth() + 'px' : 'auto'*/
            })
            .html(html)
            .appendTo($('body'));

        var lineBL = 0;

        var pt = new GPoint(0, 0);
        if (this.$trf) {
            pt = this.$trf.mapPoint(pt);
        }

        var result = new GRect(pt.getX(), pt.getY(), tmp.outerWidth(), tmp.outerHeight());

        tmp.remove();

        return result;

        /*
        if (this.$trf) {
            var box = this.$trf.mapRect(GRect.fromPoints(new GPoint(0, 0), new GPoint(1, 1)));

            if (!this.$fw || !this.$fh) {
                var vertexBounds = gVertexInfo.calculateBounds(this, true);

                var deltaX = vertexBounds ? vertexBounds.getX() - box.getX() : 0;
                var deltaY = vertexBounds ? vertexBounds.getY() - box.getY() : 0;

                box = new GRect(
                    box.getX(),
                    box.getY(),
                    !this.$fw && vertexBounds ? vertexBounds.getWidth() + deltaX : box.getWidth(),
                    !this.$fh && vertexBounds ? vertexBounds.getHeight() + deltaY : box.getHeight()
                );
            }

            return box;
        } else {
            return GXShape.prototype._calculateGeometryBBox.call(this);
        }
        */
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
            if (args.properties.indexOf('trf') >= 0) {
                this._verticesDirty = true;
            }
        }
    };

    // TODO : Remove this and handle properly / automatically
    GXText.prototype.invalidateText = function () {
        this.beginUpdate();
        this._verticesDirty = true;
        this.endUpdate();
    };

    /** @override */
    GXText.prototype.toString = function () {
        return "[GXText]";
    };

    _.GXText = GXText;
})(this);