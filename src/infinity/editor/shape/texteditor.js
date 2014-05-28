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
     * Get a property value
     * @param {String} property the property to get a value for
     * @param {Boolean} [computed] whether to use computed value (defaults to false)
     * @returns {*}
     */
    IFTextEditor.prototype.getProperty = function (property, computed) {
        if (IFText.GeometryProperties.hasOwnProperty(property)) {
            return this.getElement().getProperty(property);
        } else if (this.isInlineEdit()) {
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

            if (IFText.Block.Properties.hasOwnProperty(property)) {
                if (activeSpan) {
                    return IFText.Block.cssToProperty(property, computed ? window.getComputedStyle(activeSpan) : activeSpan.style);
                } else if (activeParagraph) {
                    return IFText.Block.cssToProperty(property, computed ? window.getComputedStyle(activeParagraph) : activeParagraph.style);
                } else {
                    return this.getElement().getContent().getProperty(property);
                }
            } else if (IFText.Paragraph.Properties.hasOwnProperty(property)) {
                if (activeParagraph) {
                    return IFText.Paragraph.cssToProperty(property, computed ? window.getComputedStyle(activeParagraph) : activeParagraph.style);
                } else {
                    return this.getElement().getContent().getProperty(property);
                }
            }
        } else {
            return this.getElement().getContent().getProperty(property);
        }
    };

    IFTextEditor.prototype.setProperties = function (properties, values) {
        var textProperties = [];
        var textValues = [];
        var blockProperties = [];
        var blockValues = [];
        var paragraphProperties = [];
        var paragraphValues = [];

        // Separate text, block and paragraph properties
        for (var i = 0; i < properties.length; ++i) {
            if (IFText.GeometryProperties.hasOwnProperty(properties[i])) {
                textProperties.push(properties[i]);
                textValues.push(values[i]);
            } else if (IFText.Block.Properties.hasOwnProperty(properties[i])) {
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
                    IFText.Block.propertyToCss(blockProperties[i], blockValues[i], blockCSS);
                }

                var paragraphCSS = {};
                for (var i = 0; i < paragraphProperties.length; ++i) {
                    IFText.Paragraph.propertyToCss(paragraphProperties[i], paragraphValues[i], paragraphCSS);
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
            this.getElement().getContent().setProperties(blockProperties, blockValues);
            this.getElement().getContent().setProperties(paragraphProperties, paragraphValues);
        }

        // Apply text properties if any
        if (textProperties.length > 0) {
            var oldAutoWidth = this.getElement().getProperty('aw');
            var oldVBox = this.getElement().getProperty('vb');

            this.getElement().setProperties(textProperties, textValues);

            // Hack: For changing height/width settings we
            // need to re-calculate the transformation
            var awIdx = textProperties.indexOf('aw');
            var vbIdx = textProperties.indexOf('vb');

            if (awIdx >= 0 || vbIdx >= 0) {
                var newHeight = false;
                var newWidth = false;

                if (awIdx >= 0 && textValues[awIdx] === false && oldAutoWidth === true) {
                    newWidth = true;
                }
                if (vbIdx >= 0 && textValues[vbIdx] !== IFText.VerticalBox.Auto && oldVBox === IFText.VerticalBox.Auto) {
                    newHeight = true;
                }

                if (newWidth || newHeight) {
                    var bbox = this.getElement().getGeometryBBox();
                    var cbox = this.getElement().getContentBBox();

                    if (bbox && cbox) {
                        var transform = new GTransform()
                            .translated(-bbox.getX(), -bbox.getY())
                            .scaled(newWidth ? cbox.getWidth() / bbox.getWidth() : 1, newHeight ? cbox.getHeight() / bbox.getHeight() : 1)
                            .translated(bbox.getX(), bbox.getY());

                        this.getElement().transform(transform);
                    }
                }
            }
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
        if (this.getElement().getProperty('aw') === false && sceneBBox.getWidth() > 0) {
            width = sceneBBox.getWidth() + 'px';
        }
        if (this.getElement().getProperty('vb') !== IFText.VerticalBox.Auto && sceneBBox.getHeight() > 0) {
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

    /** @private */
    IFTextEditor.prototype._triggerSelectionChanged = function () {
        var editor = IFEditor.getEditor(this.getElement().getScene());
        if (editor.hasEventListeners(IFEditor.InlineEditorEvent)) {
            editor.trigger(new IFEditor.InlineEditorEvent(this, IFEditor.InlineEditorEvent.Type.SelectionChanged));
        }
    };

    /** @override */
    IFTextEditor.prototype.toString = function () {
        return "[Object IFTextEditor]";
    };

    _.IFTextEditor = IFTextEditor;
})(this);