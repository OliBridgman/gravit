(function (_) {
    /**
     * A widget that may contain and (optionally) layout other widgets
     * @class GUIPanel
     * @extends GUIWidget
     * @constructor
     * @version 1.0
     */
    function GUIPanel(container) {
        GUIWidget.apply(this, arguments);
    }

    GObject.inherit(GUIPanel, GUIWidget);

    /**
     * Alignment enum within a panel
     * @enum
     * @version 1.0
     */
    GUIPanel.Align = {
        /**
         * Align a widget to the top
         * @type {Number}
         * @version 1.0
         */
        TOP: 1,

        /**
         * Align a widget to the left
         * @type {Number}
         * @version 1.0
         */
        LEFT: 2,

        /**
         * Align a widget to the right
         * @type {Number}
         * @version 1.0
         */
        RIGHT: 3,

        /**
         * Align a widget to the bottom
         * @type {Number}
         * @version 1.0
         */
        BOTTOM: 4,

        /**
         * Align a widget to the rest of the area
         * @type {Number}
         * @version 1.0
         */
        CLIENT: 5
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIPanel._WidgetWrapper Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A wrapper around a widget within this container
     * @class GUIPanel._WidgetWrapper
     * @constructor
     * @private
     */
    GUIPanel._WidgetWrapper = function () {
    };

    /**
     * @type {GUIWidget}
     */
    GUIPanel._WidgetWrapper.prototype.widget = null;

    /**
     * If this is null, no alignment takes place
     * @type {Number}
     */
    GUIPanel._WidgetWrapper.prototype.align = null;

    /**
     * Left, Top, Right, Bottom
     * @type {Array}
     */
    GUIPanel._WidgetWrapper.prototype.margin = null;

    /**
     * @type {Boolean}
     */
    GUIPanel._WidgetWrapper.prototype.anchor = false;

    /**
     * @type {Boolean}
     */
    GUIPanel._WidgetWrapper.prototype.noresize = true;

    // -----------------------------------------------------------------------------------------------------------------
    // GUIPanel Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The children wrappers of this container
     * @type {Array<GUIPanel._WidgetWrapper>}
     * @private
     */
    GUIPanel.prototype._children = null;

    /**
     * Id of next frame for re-layouting
     * @type {Number}
     * @private
     */
    GUIPanel.prototype._layoutRequestFrameId = null;

    /**
     * Add a new widget, this is equal to calling insertWidget(widget, align, anchor, noresize, margin)
     * @see insertWidget
     * @version 1.0
     */
    GUIPanel.prototype.addWidget = function (widget, align, anchor, noresize, margin) {
        this.insertWidget(widget, align, anchor, noresize, margin);
    };

    /**
     * Insert a new widget
     * @param {GUIWidget} widget the widget to add to this container
     * @param {Number} [align] the alignment of the widget, null (default) does not align
     * @param {Boolean} [anchor] if true, the widget will be anchored instead of aligned, defaults to false
     * @param {Boolean} [noresize] if true, the widget will be not be resized but positioned only, defaults to false
     * @param {Array<Number>} [margin] left-, top-, right- and bottom-margin, defaults to 0
     * @param {GUIWidget|Number} reference if set to a widget, inserts before the widget reference.
     * If a number, inserts at the given index. If not provided, appends to the end.
     * @version 1.0
     */
    GUIPanel.prototype.insertWidget = function (widget, align, anchor, noresize, margin, reference) {

        var insertIndex = this._children ? this._children.length : 0;
        if (this._children) {
            if (typeof reference == 'number') {
                insertIndex = reference;
            }
            else if (reference) {
                insertIndex = this._children.length;
                for (var i = 0; i < this._children.length; ++i) {
                    if (reference && this._children[i].widget == reference) {
                        insertIndex = i;
                        break;
                    }
                }
            }
        }

        var wrapper = new GUIPanel._WidgetWrapper();
        wrapper.widget = widget;
        wrapper.align = align;
        wrapper.margin = [margin && margin.length >= 1 ? margin[0] : 0,
            margin && margin.length >= 2 ? margin[1] : 0,
            margin && margin.length >= 3 ? margin[2] : 0,
            margin && margin.length >= 4 ? margin[3] : 0];

        wrapper.anchor = anchor ? true : false;
        wrapper.noresize = noresize ? true : false;

        this._insertWrapper(insertIndex, wrapper);

        if (wrapper.align != null) {
            this.invalidateLayout();
        }
    };

    /**
     * Remove a widget from this container
     * @param {GUIWidget} widget the widget to be removed from this container
     * @version 1.0
     */
    GUIPanel.prototype.removeWidget = function (widget) {
        if (this._children) {
            for (var i = 0; i < this._children; ++i) {
                var wrapper = this._children[i];
                if (wrapper.widget == widget) {
                    this._children.splice(i, 1);
                    wrapper.widget._setParent(null);
                    if (wrapper.align) {
                        this.invalidateLayout();
                    }
                    break;
                }
            }
        }
    };

    /**
     * Return a widget at a given index
     * @param {Number} index
     * @return {GUIWidget} widget at the index or null for none
     * @version 1.0
     */
    GUIPanel.prototype.getWidget = function (index) {
        if (this._children && index >= 0 && index < this._children.length) {
            return this._children[index];
        }
        return null;
    };

    /** @override */
    GUIPanel.prototype.resize = function (width, height) {
        if (width != this._width || height != this._height) {
            GUIWidget.prototype.resize.call(this, width, height);

            this.invalidateLayout();
        }
    };

    /**
     * Invalidate the panel layout by scheduling a new layout-request
     * @param {Boolean} schedule if true, relayout will be delayed,
     * defaults to false
     * @version 1.0
     */
    GUIPanel.prototype.invalidateLayout = function (schedule) {
        if (!schedule) {
            this._layout();
        } else {
            // Request a layout for the next frame
            if (this._layoutRequestFrameId == null) {
                this._layoutRequestFrameId = gPlatform.scheduleFrame(this._layout.bind(this));
            }
        }
    }

    /**
     * Called whenever this container should layout itself
     * @private
     */
    GUIPanel.prototype._layout = function () {
        if (this._children) {

            var left = 0;
            var top = 0;
            var right = this.getWidth();
            var bottom = this.getHeight();

            var total = this._children.length;
            var handled = 0;

            // First align top- and bottom and count children to handle (total)
            for (var i = 0; i < this._children.length; ++i) {
                var wrapper = this._children[i];
                if (!wrapper.widget.isDisplayed()) {
                    total--;
                    continue;
                }
                if (GUIPanel.Align.TOP == wrapper.align) {
                    if (wrapper.anchor) {
                        wrapper.widget.move(left + wrapper.margin[0], top + wrapper.margin[1]);
                        if (!wrapper.noresize) {
                            wrapper.widget.resize(this.getWidth() - wrapper.margin[2], wrapper.widget.getHeight());
                        }
                    } else {
                        top += wrapper.margin[1];
                        wrapper.widget.move(left, top);
                        if (!wrapper.noresize) {
                            wrapper.widget.resize(right, wrapper.widget.getHeight());
                        }
                        top += wrapper.widget.getHeight() + wrapper.margin[3];
                    }
                    handled++;
                } else if (GUIPanel.Align.BOTTOM == wrapper.align) {
                    if (wrapper.anchor) {
                        wrapper.widget.move(left + wrapper.margin[0], bottom - wrapper.widget.getHeight() - wrapper.margin[3]);
                        if (!wrapper.noresize) {
                            wrapper.widget.resize(this.getWidth() - wrapper.margin[2], wrapper.widget.getHeight());
                        }
                    } else {
                        bottom -= wrapper.widget.getHeight() + wrapper.margin[3];
                        wrapper.widget.move(left, bottom);
                        if (!wrapper.noresize) {
                            wrapper.widget.resize(right, wrapper.widget.getHeight());
                        }
                        bottom -= wrapper.margin[1];
                    }
                    handled++;
                } else if (wrapper.align == null) {
                    // No need to handle non-aligned children
                    total--;
                }
            }

            var height = bottom - top;

            // Now align left- and right
            if (handled < total) {
                for (var i = 0; i < this._children.length; ++i) {
                    var wrapper = this._children[i];
                    if (!wrapper.widget.isDisplayed()) {
                        continue;
                    }
                    if (GUIPanel.Align.LEFT == wrapper.align) {
                        if (wrapper.anchor) {
                            wrapper.widget.move(left + wrapper.margin[0], top + wrapper.margin[1]);
                            if (!wrapper.noresize) {
                                wrapper.widget.resize(wrapper.widget.getWidth(), this.getHeight() - wrapper.margin[3]);
                            }
                        } else {
                            left += wrapper.margin[0];
                            wrapper.widget.move(left, top);
                            if (!wrapper.noresize) {
                                wrapper.widget.resize(wrapper.widget.getWidth(), height);
                            }
                            left += wrapper.widget.getWidth() + wrapper.margin[2];
                        }
                        handled++;
                    } else if (GUIPanel.Align.RIGHT == wrapper.align) {
                        if (wrapper.anchor) {
                            wrapper.widget.move(right - wrapper.widget.getWidth() - wrapper.margin[2], top + wrapper.margin[1]);
                            if (!wrapper.noresize) {
                                wrapper.widget.resize(wrapper.widget.getWidth(), this.getHeight() - wrapper.margin[3]);
                            }
                        } else {
                            right -= wrapper.widget.getWidth() + wrapper.margin[2];
                            wrapper.widget.move(right, top);
                            if (!wrapper.noresize) {
                                wrapper.widget.resize(wrapper.widget.getWidth(), height);
                            }
                            right -= wrapper.margin[0];
                        }
                        handled++;
                    }
                }
            }

            var width = right - left;

            if (handled < total) {
                // Finally align on client
                for (var i = 0; i < this._children.length; ++i) {
                    var wrapper = this._children[i];
                    if (!wrapper.widget.isDisplayed()) {
                        continue;
                    }
                    if (GUIPanel.Align.CLIENT == wrapper.align) {
                        if (wrapper.anchor) {
                            wrapper.widget.move(wrapper.margin[0], wrapper.margin[1]);
                            if (!wrapper.noresize) {
                                wrapper.widget.resize(this.getWidth() - wrapper.margin[2], this.getHeight() - wrapper.margin[3]);
                            }
                        } else {
                            wrapper.widget.move(left + wrapper.margin[0], top + wrapper.margin[1]);
                            if (!wrapper.noresize) {
                                wrapper.widget.resize(width - wrapper.margin[2] - wrapper.margin[0], height - wrapper.margin[3] - wrapper.margin[1]);
                            }
                        }
                    }
                }
            }
        }

        this._layoutRequestFrameId = null;
    };

    /**
     * Called whenever a wrapper should be inserted
     * @param {Number} index the index to insert at
     * @param {GUIPanel._WidgetWrapper} wrapper the wrapper to insert
     * @private
     */
    GUIPanel.prototype._insertWrapper = function (index, wrapper) {
        if (!this._children) {
            this._children = [];
        }
        if (index >= this._children.length) {
            this._children.push(wrapper);
        } else {
            this._children.splice(index, 0, wrapper);
        }

        wrapper.widget._setParent(this);

        if (index + 1 < this._children.length) {
            this._htmlElement.insertBefore(wrapper.widget._htmlElement, this._children[index + 1].widget._htmlElement);
        } else {
            this._htmlElement.appendChild(wrapper.widget._htmlElement);
        }
    }

    /** @override */
    GUIPanel.prototype.toString = function () {
        return "[Object GUIPanel]";
    };

    _.GUIPanel = GUIPanel;
})(this);