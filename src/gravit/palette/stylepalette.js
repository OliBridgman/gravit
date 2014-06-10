(function (_) {

    /**
     * Style Palette
     * @class GStylePalette
     * @extends GPalette
     * @constructor
     */
    function GStylePalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GStylePalette, GPalette);

    GStylePalette.ID = "style";
    GStylePalette.TITLE = new IFLocale.Key(GStylePalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._htmlElement = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GStylePalette.prototype._document = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._styleSelector = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._patternsPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._filtersPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._effectsPanel = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GStylePalette.prototype._styleElements = null;

    /**
     * @type {Array<IFStyle>}
     * @private
     */
    GStylePalette.prototype._styles = null;

    /**
     * @type {Number}
     * @private
     */
    GStylePalette.prototype._selectedStyleIndex = -1;

    /** @override */
    GStylePalette.prototype.getId = function () {
        return GStylePalette.ID;
    };

    /** @override */
    GStylePalette.prototype.getTitle = function () {
        return GStylePalette.TITLE;
    };

    /** @override */
    GStylePalette.prototype.getGroup = function () {
        return "style";
    };

    /**
     * @override
     */
    GStylePalette.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'F9'];
    };

    /** @override */
    GStylePalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GStylePalette.prototype.init = function (htmlElement, menu) {
        GPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;

        // Add style selector
        this._styleSelector = $('<div></div>')
            .addClass('style-selector')
            .appendTo(this._htmlElement);

        // Patterns section
        this._patternsPanel = $('<div></div>')
            .addClass('patterns-panel')
            .append($('<h1></h1>')
                .addClass('g-divider')
                // TODO : I18N
                .text('Fills & Borders'))
            .appendTo(this._htmlElement);

        // Filter section
        this._filtersPanel = $('<div></div>')
            .addClass('filters-panel')
            .append($('<h1></h1>')
                .addClass('g-divider')
                // TODO : I18N
                .text('Filters'))
            .appendTo(this._htmlElement);

        // Effects section
        this._effectsPanel = $('<div></div>')
            .addClass('effects-panel')
            .append($('<h1></h1>')
                .addClass('g-divider')
                // TODO : I18N
                .text('Effects'))
            .appendTo(this._htmlElement);
    };

    /** @override */
    GStylePalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var editor = this._document.getEditor();

            // Subscribe to the editor's events
            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._document = null;
            this._styleElements = null;
            this._styles = null;
            this._selectedStyleIndex = -1;
            this._updateStyleSelector();
            this._updateSelectedStyle();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GStylePalette.prototype._updateFromSelection = function () {
        this._styleElements = null;
        this._styles = null;
        this._selectedStyleIndex = null; //!null here to enforce refresh later
        var selection = this._document.getEditor().getSelection();

        // Figure our available style elements
        if (selection && selection.length > 0) {
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                if (element.hasMixin(IFElement.Style)) {
                    if (!this._styleElements) {
                        this._styleElements = [];
                    }

                    this._styleElements.push(element);
                }
            }
        }
        if (this._styleElements) {
            // Iterate available styles. If there's a multi-element selection, we'll
            // only add the first, non-linked style of each element
            if (this._styleElements.length === 1) {
                // Easy-peacy, add all styles from element
                var styleSet = this._styleElements[0].getStyleSet();
                for (var node = styleSet.getFirstChild(); node !== null; node = node.getNext()) {
                    if (node instanceof IFStyle) {
                        if (!this._styles) {
                            this._styles = [];
                        }
                        this._styles.push(node);
                    }
                }
            } else {
                // TODO : Add support for common referenced styles
                for (var i = 0; i < this._styleElements.length; ++i) {
                    var styleSet = this._styleElements[i].getStyleSet();
                    for (var node = styleSet.getFirstChild(); node !== null; node = node.getNext()) {
                        if (node instanceof IFStyle) {
                            // TODO : Check if style is not linked
                            if (!this._styles) {
                                this._styles = [];
                            }
                            this._styles.push(node);

                            // break here as we add only default style
                            break;
                        }
                    }
                }
            }
        }

        // Now let ourself update
        this._updateStyleSelector();

        // Set default selected style
        this._setSelectedStyle(this._styles ? 0 : -1);
    };

    GStylePalette.prototype._updateStyleSelector = function () {
        this._styleSelector
            .css('display', this._styles ? '' : 'none')
            .empty();

        if (this._styles) {
            var _addStyleBlock = function (style, index) {
                $('<div></div>')
                    .addClass('style-block')
                    .append($('<img>')
                        .addClass('style-preview')
                        .attr('src', style.createPreviewImage(36, 36)))
                    .append($('<div></div>')
                        .addClass('style-visible')
                        .append($('<span></span>')
                            .addClass('fa fa-fw ' + (style.getProperty('vs') ? 'fa-circle' : 'fa-circle-o'))
                            .on('click', function (evt) {
                                var $this = $(this);
                                evt.stopPropagation();
                                if (style.getProperty('vs') === true) {
                                    style.setProperty('vs', false);
                                    $this.removeClass('fa-circle');
                                    $this.addClass('fa-circle-o');
                                } else {
                                    style.setProperty('vs', true);
                                    $this.removeClass('fa-circle-o');
                                    $this.addClass('fa-circle');
                                }
                            })))
                    /*TODO
                     .append($('<div></div>')
                     .addClass('style-link')
                     .append($('<span></span>')
                     .addClass('fa fa-link fa-fw')))*/
                    .on('click', function () {
                        this._setSelectedStyle(index);
                    }.bind(this))
                    .appendTo(this._styleSelector);
            }.bind(this);

            for (var i = 0; i < this._styles.length; ++i) {
                _addStyleBlock(this._styles[i], i);
            }
        }
    };

    GStylePalette.prototype._setSelectedStyle = function (selectedIndex) {
        if (selectedIndex !== this._selectedStyleIndex) {
            this._selectedStyleIndex = selectedIndex;
            this._styleSelector.find('.style-block').each(function (index, block) {
                $(block)
                    .toggleClass('selected', index === selectedIndex);
            });
            this._updateSelectedStyle();
        }
    };

    GStylePalette.prototype._updateSelectedStyle = function () {
        this._updatePatterns();
    };

    GStylePalette.prototype._updatePatterns = function () {
        var _createFillRow = function (fill) {
            $('<div></div>')
                .addClass('pattern-row')
                .append($('<button></button>')
                    .gColorButton({
                        clearColor: false
                    })
                    .gColorButton('value', fill.getProperty('pat'))
                    .on('change', function (evt, color) {
                        fill.setProperty('pat', color);

                        //self._assignProperty(property, color);
                    }))
                .append($('<select></select>'))
                .append($('<input>'))
                .appendTo(this._patternsPanel);
        }.bind(this);

        this._patternsPanel.empty();
        this._patternsPanel.css('display', 'none');

        if (this._selectedStyleIndex >= 0) {
            this._patternsPanel.css('display', '');
            var style = this._styles[this._selectedStyleIndex].getActualStyle();

            for (var entry = style.getFirstChild(); entry !== null; entry = entry.getNext()) {
                if (entry instanceof IFFillPaint) {
                    _createFillRow(entry);
                }
            }
        }
    };

    /** @override */
    GStylePalette.prototype.toString = function () {
        return "[Object GStylePalette]";
    };

    _.GStylePalette = GStylePalette;
})(this);