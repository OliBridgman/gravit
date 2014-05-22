(function (_) {
    /**
     * An editor for a text
     * @param {GXText} text the text this editor works on
     * @class GXTextEditor
     * @extends GXShapeEditor
     * @mixes GEventTarget
     * @constructor
     */
    function GXTextEditor(rectangle) {
        GXShapeEditor.call(this, rectangle);
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inheritAndMix(GXTextEditor, GXShapeEditor, [GEventTarget]);
    GXElementEditor.exports(GXTextEditor, GXText);

    // -----------------------------------------------------------------------------------------------------------------
    // GXTextEditor.SelectionChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the current selection has been changed
     * @class GXTextEditor.SelectionChangedEvent
     * @extends GEvent
     * @constructor
     */
    GXTextEditor.SelectionChangedEvent = function () {
    };
    GObject.inherit(GXTextEditor.SelectionChangedEvent, GEvent);

    /** @override */
    GXTextEditor.SelectionChangedEvent.prototype.toString = function () {
        return "[Event GXTextEditor.SelectionChangedEvent]";
    };

    GXTextEditor.SELECTION_CHANGED_EVENT = new GXTextEditor.SelectionChangedEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GXTextEditor Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GXTextEditor.prototype._inlineEditor = null;

    /**
     * @type {HTMLSpanElement}
     * @private
     */
    GXTextEditor.prototype._activeSpanElement = null;

    /**
     * @type {HTMLParagraphElement}
     * @private
     */
    GXTextEditor.prototype._activeParagraphElement = null;

    GXTextEditor.prototype.getProperty = function (property) {
        if (this.isInlineEdit()) {
            if (GXText.Block.Properties.hasOwnProperty(property)) {
                if (this._activeSpanElement) {
                    return GXText.Block.cssToProperty(property, this._activeSpanElement.style);
                } else if (this._activeParagraphElement) {
                    return GXText.Block.cssToProperty(property, this._activeParagraphElement.style);
                }
            } else if (this._activeParagraphElement) {
                return GXText.Paragraph.cssToProperty(property, this._activeParagraphElement.style);
            }

            return null;
        } else {
            return this.getElement().getContent().getProperty(property);
        }
    };

    GXTextEditor.prototype.setProperties = function (properties, values) {
        var blockProperties = [];
        var blockValues = [];
        var paragraphProperties = [];
        var paragraphValues = [];

        // Separate block and paragraph properties
        for (var i = 0; i < properties.length; ++i) {
            if (GXText.Block.Properties.hasOwnProperty(properties[i])) {
                blockProperties.push(properties[i]);
                blockValues.push(values[i]);
            } else {
                paragraphProperties.push(properties[i]);
                paragraphValues.push(values[i]);
            }
        }


        if (this._inlineEditor) {
            setTimeout(function () {
                var blockCSS = {};
                for (var i = 0; i < blockProperties.length; ++i) {
                    GXText.Block.propertyToCss(blockProperties[i], blockValues[i], blockCSS);
                }
                ;

                var paragraphCSS = {};
                for (var i = 0; i < paragraphProperties.length; ++i) {
                    GXText.Paragraph.propertyToCss(paragraphProperties[i], paragraphValues[i], paragraphCSS);
                }
                ;


                this._inlineEditor.focus();
                if (this._savedSelection) {
                    rangy.restoreSelection(this._savedSelection);
                    this._savedSelection = rangy.saveSelection();
                }

                var sel = rangy.getSelection();
                if (sel.rangeCount) {
                    var range = sel.getRangeAt(0);
                    var nodes = range.collapsed ? [range.startContainer] : range.getNodes();
                    for (var i = 0; i < nodes.length; ++i) {
                        var node = nodes[i];
                        if (node.nodeType === 3) {
                            var blockElement = null;
                            for (var parent = node.parentNode; parent !== null; parent = parent.parentNode) {
                                if (parent.nodeType === 1 && parent.nodeName.toLowerCase() === 'p') {
                                    blockElement = parent;
                                    break;
                                }
                            }

                            if (blockElement) {
                                for (var prop in paragraphCSS) {
                                    blockElement.style[prop] = paragraphCSS[prop];
                                }
                            }
                        }
                    }
                }

                //var cssApplier = rangy.createCssClassApplier("dummy", {normalize: true}, ['span', 'p']);
                //cssApplier.toggleSelection();
            }.bind(this), 0);
            return;
        } else {
            // Apply to outer element
            this.getElement().getContent().setProperties(blockProperties, blockValues);
            this.getElement().getContent().setProperties(paragraphProperties, paragraphValues);
        }
    };

    /** @override */
    GXTextEditor.prototype.initialSetup = function (fillColor, strokeColor) {
        // Text will always retrieve a black fill if there's no other fill
        GXShapeEditor.prototype.initialSetup.call(this, fillColor ? fillColor : new GXColor(GXColor.Type.Black), null);
    };

    /** @override */
    GXTextEditor.prototype.canInlineEdit = function () {
        return true;
    };

    /** @override */
    GXTextEditor.prototype.isInlineEdit = function () {
        return this._inlineEditor !== null;
    };

    /** @override */
    GXTextEditor.prototype.beginInlineEdit = function (view, container) {
        // Remove size handles and hide our text element
        this.removeFlag(GXBlockEditor.Flag.ResizeAll);
        this.getElement().setFlag(GXElement.Flag.NoPaint);

        var html = this.getElement().asHtml();

        this._inlineEditor = $($('<div></div>'))
            .css(this.getElement().getContent().propertiesToCss({}))
            .css({
                'position': 'absolute',
                'background': 'transparent',
                'transform-origin': '0% 0%',
                '-webkit-transform-origin': '0% 0%',
                'min-width': '1em',
                'min-height': '1em'
            })
            .attr('contenteditable', 'true')
            .on('mousedown', function (evt) {
                evt.stopPropagation();
            })
            .on('mouseup', function (evt) {
                evt.stopPropagation();
                if (this._savedSelection) {
                    rangy.removeMarkers(this._savedSelection);
                }
                this._savedSelection = rangy.saveSelection();

                this._activeParagraphElement = null;
                var sel = rangy.getSelection();
                if (sel.rangeCount) {
                    var range = sel.getRangeAt(0);
                    var nodes = range.collapsed ? [range.endContainer] : range.getNodes();
                    for (var i = 0; i < nodes.length; ++i) {
                        var node = nodes[i];
                        if (node.nodeType === 3) {
                            var blockElement = null;
                            for (var parent = node.parentNode; parent !== null; parent = parent.parentNode) {
                                if (parent.nodeType === 1 && parent.nodeName.toLowerCase() === 'p') {
                                    blockElement = parent;
                                    break;
                                }
                            }

                            if (blockElement) {
                                this._activeParagraphElement = blockElement;
                            }
                        }
                    }
                }
                
                this.trigger(GXTextEditor.SELECTION_CHANGED_EVENT);
            }.bind(this))
            .on('click', function (evt) {
                evt.stopPropagation();
            })
            .on('dblclick', function (evt) {
                evt.stopPropagation();
            })
            .on('keydown', function (evt) {
                evt.stopPropagation();
            })
            .on('keyup', function (evt) {
                evt.stopPropagation();
                if (this._savedSelection) {
                    rangy.removeMarkers(this._savedSelection);
                }
                this._savedSelection = rangy.saveSelection();
            }.bind(this))
            //.html('<style type="text/css">.dummy{font-size: 30px}</style>' + html)
            .html(html)
            .appendTo(container);

        this._inlineEditor.focus();

        if (html === "") {
            var pTag = document.createElement('p');
            $(pTag).text('Your Text Here');
            this._inlineEditor.append(pTag);

            var range = rangy.createRange();
            range.selectNodeContents(pTag);
            var sel = rangy.getSelection();
            sel.setSingleRange(range);
        }
    };

    /** @override */
    GXTextEditor.prototype.adjustInlineEditForView = function (view) {
        var sceneBBox = this.getElement().getGeometryBBox();
        if (!sceneBBox) {
            sceneBBox = GRect.fromPoints(new GPoint(0, 0), new GPoint(1, 1));
            var transform = this.getElement().getTransform();
            if (transform) {
                sceneBBox = transform.mapRect(sceneBBox);
            }
        }

        var viewBBox = view.getWorldTransform().mapRect(sceneBBox);
        var left = viewBBox.getX();
        var top = viewBBox.getY();
        var minWidth = sceneBBox.getWidth() <= 0 ? '1em' : sceneBBox.getWidth() + 'px';
        var minHeight = sceneBBox.getHeight() <= 0 ? '1em' : sceneBBox.getHeight() + 'px';

        this._inlineEditor
            .css({
                'width': minWidth,
                'min-height': minHeight,
                'top': top,
                'left': left,
                'transform': 'scale(' + view.getZoom() + ')',
                '-webkit-transform': 'scale(' + view.getZoom() + ')'
            })
    };

    /** @override */
    GXTextEditor.prototype.finishInlineEdit = function () {
        if (this._savedSelection) {
            rangy.removeMarkers(this._savedSelection);
            this._savedSelection = null;
        }

        var html = this._inlineEditor.html();

        this.getElement().fromHtml(html);
        this._inlineEditor.remove();
        this._inlineEditor = null;

        // Show size handles and our text element
        this.setFlag(GXBlockEditor.Flag.ResizeAll);
        this.getElement().removeFlag(GXElement.Flag.NoPaint);

        // TODO : I18N
        return 'Modify Text Content';
    };

    /** @override */
    GXTextEditor.prototype._prePaint = function (transform, context) {
        if ((this.hasFlag(GXElementEditor.Flag.Selected) || this.hasFlag(GXElementEditor.Flag.Highlighted)) && !this.isInlineEdit()) {
            // Paint textbox outline instead of glyphs
            var textRect = this._element.getGeometryBBox();
            if (textRect) {
                var transformedRect = transform.mapRect(textRect);

                // Ensure to pixel-align the rect
                var x = Math.floor(transformedRect.getX());
                var y = Math.floor(transformedRect.getY());
                var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
                var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;

                if (this.hasFlag(GXElementEditor.Flag.Highlighted)) {
                    context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 2, context.highlightOutlineColor);
                } else {
                    context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1, context.selectionOutlineColor);
                }
            }
        }
    };

    /** @override */
    GXTextEditor.prototype.toString = function () {
        return "[Object GXTextEditor]";
    };

    _.GXTextEditor = GXTextEditor;
})(this);