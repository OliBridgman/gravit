(function (_) {
    /**
     * An editor for a text
     * @param {IFText} text the text this editor works on
     * @class IFTextEditor
     * @extends IFShapeEditor
     * @constructor
     */
    function IFTextEditor(rectangle) {
        IFShapeEditor.call(this, rectangle);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFTextEditor, IFShapeEditor);
    IFElementEditor.exports(IFTextEditor, IFText);

    // -----------------------------------------------------------------------------------------------------------------
    // IFTextEditor Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {HTMLDivElement}
     * @private
     */
    IFTextEditor.prototype._inlineEditor = null;

    /**
     * @type {HTMLSpanElement}
     * @private
     */
    IFTextEditor.prototype._activeSpanElement = null;

    /**
     * @type {HTMLParagraphElement}
     * @private
     */
    IFTextEditor.prototype._activeParagraphElement = null;

    IFTextEditor.prototype.getProperty = function (property) {
        if (this.isInlineEdit()) {
            if (IFText.Block.Properties.hasOwnProperty(property)) {
                if (this._activeSpanElement) {
                    return IFText.Block.cssToProperty(property, this._activeSpanElement.style);
                } else if (this._activeParagraphElement) {
                    return IFText.Block.cssToProperty(property, this._activeParagraphElement.style);
                }
            } else if (this._activeParagraphElement) {
                return IFText.Paragraph.cssToProperty(property, this._activeParagraphElement.style);
            }

            return null;
        } else {
            return this.getElement().getContent().getProperty(property);
        }
    };

    IFTextEditor.prototype.setProperties = function (properties, values) {
        var blockProperties = [];
        var blockValues = [];
        var paragraphProperties = [];
        var paragraphValues = [];

        // Separate block and paragraph properties
        for (var i = 0; i < properties.length; ++i) {
            if (IFText.Block.Properties.hasOwnProperty(properties[i])) {
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
                    IFText.Block.propertyToCss(blockProperties[i], blockValues[i], blockCSS);
                }
                ;

                var paragraphCSS = {};
                for (var i = 0; i < paragraphProperties.length; ++i) {
                    IFText.Paragraph.propertyToCss(paragraphProperties[i], paragraphValues[i], paragraphCSS);
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
    IFTextEditor.prototype.initialSetup = function (fillColor, strokeColor) {
        // Text will always retrieve a black fill if there's no other fill
        IFShapeEditor.prototype.initialSetup.call(this, fillColor ? fillColor : new IFColor(IFColor.Type.Black), null);
    };

    /** @override */
    IFTextEditor.prototype.canInlineEdit = function () {
        return true;
    };

    /** @override */
    IFTextEditor.prototype.isInlineEdit = function () {
        return this._inlineEditor !== null;
    };

    /** @override */
    IFTextEditor.prototype.beginInlineEdit = function (view, container) {
        // Remove size handles and hide our text element
        this.removeFlag(IFBlockEditor.Flag.ResizeAll);
        this.getElement().setFlag(IFElement.Flag.NoPaint);

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

                var editor = IFEditor.getEditor(this.getElement().getScene());
                if (editor.hasEventListeners(IFEditor.InlineEditorEvent)) {
                    editor.trigger(new IFEditor.InlineEditorEvent(this, IFEditor.InlineEditorEvent.Type.SelectionChanged));
                }
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
    IFTextEditor.prototype.adjustInlineEditForView = function (view) {
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

        var width = '';
        var height = '';
        if (this.getElement().getProperty('fw') === true && sceneBBox.getWidth() > 0) {
            width = sceneBBox.getWidth() + 'px';
        }
        if (this.getElement().getProperty('fh') === true && sceneBBox.getHeight() > 0) {
            height = sceneBBox.getHeight() + 'px';
        }

        this._inlineEditor
            .css({
                'width': width,
                'height': height,
                'top': top,
                'left': left,
                'transform': 'scale(' + view.getZoom() + ')',
                '-webkit-transform': 'scale(' + view.getZoom() + ')'
            })
    };

    /** @override */
    IFTextEditor.prototype.finishInlineEdit = function () {
        if (this._savedSelection) {
            rangy.removeMarkers(this._savedSelection);
            this._savedSelection = null;
        }

        var html = this._inlineEditor.html();

        this.getElement().fromHtml(html);
        this._inlineEditor.remove();
        this._inlineEditor = null;

        // Show size handles and our text element
        this.setFlag(IFBlockEditor.Flag.ResizeAll);
        this.getElement().removeFlag(IFElement.Flag.NoPaint);

        // TODO : I18N
        return 'Modify Text Content';
    };

    /** @override */
    IFTextEditor.prototype._prePaint = function (transform, context) {
        if ((this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) && !this.isInlineEdit()) {
            // Paint textbox outline instead of glyphs
            var textRect = this._element.getGeometryBBox();
            if (textRect) {
                var transformedRect = transform.mapRect(textRect);

                // Ensure to pixel-align the rect
                var x = Math.floor(transformedRect.getX());
                var y = Math.floor(transformedRect.getY());
                var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
                var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;

                if (this.hasFlag(IFElementEditor.Flag.Highlighted)) {
                    context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 2, context.highlightOutlineColor);
                } else {
                    context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1, context.selectionOutlineColor);
                }
            }
        }
    };

    /** @override */
    IFTextEditor.prototype.toString = function () {
        return "[Object IFTextEditor]";
    };

    _.IFTextEditor = IFTextEditor;
})(this);