(function (_) {
    /**
     * An editor for a text
     * @param {GText} text the text this editor works on
     * @class GTextEditor
     * @extends GShapeEditor
     * @constructor
     */
    function GTextEditor(rectangle) {
        GShapeEditor.call(this, rectangle);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GTextEditor, GShapeEditor);
    GElementEditor.exports(GTextEditor, GText);

    // -----------------------------------------------------------------------------------------------------------------
    // GTextEditor Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GTextEditor.prototype._inlineEditor = null;

    /**
     * Get a property value
     * @param {String} property the property to get a value for
     * @param {Boolean} [computed] whether to use computed value (defaults to false)
     * @returns {*}
     */
    GTextEditor.prototype.getProperty = function (property, computed) {
        if (this.isInlineEdit()) {
            var activeParagraph = null;
            var activeSpan = null;

            var sel = rangy.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                var nodes = range.collapsed ? [range.startContainer] : range.getNodes();
                for (var i = 0; i < nodes.length; ++i) {
                    var node = nodes[i];
                    if (node.nodeType === 3) {
                        for (var parent = node.parentNode; parent !== null; parent = parent.parentNode) {
                            if (parent.nodeType === 1) {
                                if (parent.nodeName.toLowerCase() === 'p') {
                                    if (!activeParagraph) {
                                        activeParagraph = parent;
                                    }
                                } else if (parent.nodeName.toLowerCase() === 'span') {
                                    if (!activeSpan && !range.collapsed) {
                                        activeSpan = parent;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (GStylable.PropertySetInfo[GStylable.PropertySet.Text].geometryProperties.hasOwnProperty(property)) {
                if (activeSpan) {
                    return GText.Block.cssToProperty(property, computed ? window.getComputedStyle(activeSpan) : activeSpan.style);
                } else if (activeParagraph) {
                    return GText.Block.cssToProperty(property, computed ? window.getComputedStyle(activeParagraph) : activeParagraph.style);
                } else {
                    return this.getElement().getProperty(property);
                }
            } else if (GStylable.PropertySetInfo[GStylable.PropertySet.Paragraph].geometryProperties.hasOwnProperty(property)) {
                if (activeParagraph) {
                    return GText.Paragraph.cssToProperty(property, computed ? window.getComputedStyle(activeParagraph) : activeParagraph.style);
                } else {
                    return this.getElement().getProperty(property);
                }
            }
        } else {
            return this.getElement().getProperty(property);
        }
    };

    GTextEditor.prototype.setProperties = function (properties, values) {
        var textProperties = [];
        var textValues = [];
        var blockProperties = [];
        var blockValues = [];
        var paragraphProperties = [];
        var paragraphValues = [];

        // Separate text, block and paragraph properties
        for (var i = 0; i < properties.length; ++i) {
            if (GText.GeometryProperties.hasOwnProperty(properties[i])) {
                textProperties.push(properties[i]);
                textValues.push(values[i]);
            } else if (GStylable.PropertySetInfo[GStylable.PropertySet.Text].geometryProperties.hasOwnProperty(properties[i])) {
                blockProperties.push(properties[i]);
                blockValues.push(values[i]);
            } else {
                paragraphProperties.push(properties[i]);
                paragraphValues.push(values[i]);
            }
        }

        if (this.isInlineEdit()) {
            setTimeout(function () {
                var blockCSS = {};
                for (var i = 0; i < blockProperties.length; ++i) {
                    GText.Block.propertyToCss(blockProperties[i], blockValues[i], blockCSS);
                }

                var paragraphCSS = {};
                for (var i = 0; i < paragraphProperties.length; ++i) {
                    GText.Paragraph.propertyToCss(paragraphProperties[i], paragraphValues[i], paragraphCSS);
                }

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
                            // Find topmost paragraph
                            for (var parent = node.parentNode; parent !== null; parent = parent.parentNode) {
                                if (parent.nodeType === 1 && parent.nodeName.toLowerCase() === 'p') {
                                    // Assign paragraph properties
                                    for (var prop in paragraphCSS) {
                                        parent.style[prop] = paragraphCSS[prop];
                                    }

                                    // Assign block properties if selection is collapsed
                                    if (sel.isCollapsed) {
                                        for (var prop in blockCSS) {
                                            parent.style[prop] = blockCSS[prop];
                                        }
                                    }

                                    break;
                                }
                            }
                        }
                    }
                }

                // Create / Remove block style if selection is not collapsed
                if (!sel.isCollapsed) {
                    // TODO !!!!
                }

                //var cssApplier = rangy.createCssClassApplier("dummy", {normalize: true}, ['span', 'p']);
                //cssApplier.toggleSelection();

                // Trigger selection changed event to update everything
                this._triggerSelectionChanged();
            }.bind(this), 0);
        } else {
            // Apply to outer element
            this.getElement().setProperties(blockProperties, blockValues);
            this.getElement().setProperties(paragraphProperties, paragraphValues);
        }

        // Apply text properties if any
        if (textProperties.length > 0) {
            this.getElement().setProperties(textProperties, textValues);
        }
    };

    /** @override */
    GTextEditor.prototype.initialSetup = function () {
        var element = this.getElement();
        var defStyle = element.getScene().getStyleCollection().querySingle('style[_sdf="text"]');
        if (defStyle) {
            element.assignStyleFrom(defStyle);
        }
    };

    /** @override */
    GTextEditor.prototype.canInlineEdit = function () {
        return true;
    };

    /** @override */
    GTextEditor.prototype.isInlineEdit = function () {
        return this._inlineEditor !== null;
    };

    /** @override */
    GTextEditor.prototype.beginInlineEdit = function (view, container) {
        // Remove size handles and hide our text element
        this.removeFlag(GBlockEditor.Flag.ResizeAll);
        this.getElement().setFlag(GElement.Flag.NoPaint);

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

                this._triggerSelectionChanged();
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
    GTextEditor.prototype.adjustInlineEditForView = function (view, position) {
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
        var top = Math.floor(viewBBox.getY()) + 1;

        var width = '';
        var height = '';
        if (this.getElement().getProperty('aw') === false && sceneBBox.getWidth() > 0) {
            width = sceneBBox.getWidth() + 'px';
        }
        if (this.getElement().getProperty('ah') === false && sceneBBox.getHeight() > 0) {
            height = sceneBBox.getHeight() + 'px';
        }

        this._inlineEditor
            .css({
                'width': width,
                'height': height,
                'transform': 'scale(' + view.getZoom() + ')',
                '-webkit-transform': 'scale(' + view.getZoom() + ')'
            })
            .offset({top: top, left: left});

        if (position) {
            this.createSelectionFromPosition(position);
        }
    };

    /**
     * Creates a selection and/or sets the caret position by given screen coordinates
     * @param {GPoint} startPos the start position in screen coordinates
     * @param {GPoint} [endPos] the end position in screen coordinates. If not provided
     * will not create a selection but set the caret position only. Defaults to null.
     */
    GTextEditor.prototype.createSelectionFromPosition = function (startPos, endPos) {
        var doc = document;
        var range = null;
        if (typeof doc.caretPositionFromPoint != "undefined") {
            range = doc.createRange();
            var start = doc.caretPositionFromPoint(startPos.getX(), startPos.getY());
            range.setStart(start.offsetNode, start.offset);

            if (endPos) {
                var end = doc.caretPositionFromPoint(endPos.getX(), endPos.getY());
                range.setEnd(end.offsetNode, end.offset);
            }
        } else if (typeof doc.caretRangeFromPoint != "undefined") {
            range = doc.createRange();
            var start = doc.caretRangeFromPoint(startPos.getX(), startPos.getY());
            range.setStart(start.startContainer, start.startOffset);

            if (endPos) {
                var end = doc.caretRangeFromPoint(endX, endY);
                range.setEnd(endPos.getX(), endPos.getY());
            }
        }

        if (range !== null && typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof doc.body.createTextRange != "undefined") {
            range = doc.body.createTextRange();
            range.moveToPoint(startPos.getX(), startPos.getY());

            if (endPos) {
                var endRange = range.duplicate();
                endRange.moveToPoint(endPos.getX(), endPos.getY());
                range.setEndPoint("EndToEnd", endRange);
            }
            range.select();
        }
    };

    /** @override */
    GTextEditor.prototype.finishInlineEdit = function () {
        if (this._savedSelection) {
            rangy.removeMarkers(this._savedSelection);
            this._savedSelection = null;
        }

        var html = this._inlineEditor.html();

        this.getElement().fromHtml(html);
        this._inlineEditor.remove();
        this._inlineEditor = null;

        // Show size handles and our text element
        this.setFlag(GBlockEditor.Flag.ResizeAll);
        this.getElement().removeFlag(GElement.Flag.NoPaint);

        // TODO : I18N
        return 'Modify Text Content';
    };

    /** @override */
    GTextEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === GBlockEditor.RESIZE_HANDLE_PART_ID) {
            if (!this._transform.isIdentity()) {
                // By default we'll simply transfer the transformation to the element
                this._element.textBoxTransform(this._transform);
            }
            this.resetTransform();
        }
        GElementEditor.prototype.applyPartMove.call(this, partId, partData);
    };

    /** @override */
    GTextEditor.prototype._prePaint = function (transform, context) {
        if ((this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) && !this.isInlineEdit()) {
            // Paint textbox outline instead of glyphs
            var textRect = this._element.getGeometryBBox();
            if (textRect) {
                var transformedRect = transform.mapRect(textRect);

                // Ensure to pixel-align the rect
                var x = Math.floor(transformedRect.getX());
                var y = Math.floor(transformedRect.getY());
                var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
                var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;

                context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1, this.hasFlag(GElementEditor.Flag.Highlighted) ? context.highlightOutlineColor : context.selectionOutlineColor);
            }
        }
    };

    /** @private */
    GTextEditor.prototype._triggerSelectionChanged = function () {
        var editor = GEditor.getEditor(this.getElement().getScene());
        if (editor.hasEventListeners(GEditor.InlineEditorEvent)) {
            editor.trigger(new GEditor.InlineEditorEvent(this, GEditor.InlineEditorEvent.Type.SelectionChanged));
        }
    };

    /** @override */
    GTextEditor.prototype.toString = function () {
        return "[Object GTextEditor]";
    };

    _.GTextEditor = GTextEditor;
})(this);