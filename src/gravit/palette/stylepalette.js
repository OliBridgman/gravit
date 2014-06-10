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
    GStylePalette.prototype._styleSettings = null;

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

        // Style settings
        this._styleSettings = $('<table></table>')
            .addClass('g-form style-settings')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Blend:'))
                .append($('<td></td>')
                    .append($('<select></select>')
                        .attr('data-property', 'blm')
                        .gBlendMode()
                        .on('change', function (evt) {
                            var val = $(evt.target).val();
                            this._modifyEachSelectedStyle(function (style) {
                                style.setProperty('blm', val);
                            });
                        }.bind(this))))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Opacity:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .attr('data-property', 'opc')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var opacity = IFLength.parseEquationValue($(evt.target).val());
                            if (opacity !== null) {
                                opacity = opacity < 0 ? 0 : opacity > 100 ? 100 : opacity;
                                opacity /= 100.0;
                                this._modifyEachSelectedStyle(function (style) {
                                    style.setProperty('opc', opacity);
                                });
                            } else {
                                this._updateStyleSettings();
                            }
                        }.bind(this)))))
            .appendTo(this._htmlElement);

        // Patterns section
        this._patternsPanel = $('<div></div>')
            .addClass('style-entries-panel')
            .append($('<div></div>')
                .addClass('style-entries-panel-header')
                .append($('<div></div>')
                    .addClass('title')
                    .text('Fills & Borders'))
                .append($('<div></div>')
                    .addClass('controls')
                    .append($('<button></button>')
                        .addClass('fa fa-fw fa-circle-o')
                        // TODO : I18N
                        .attr('title', 'Add Stroke')
                        .on('click', function () {
                            this._modifyEachSelectedStyle(function (style) {
                                style.getActualStyle().appendChild(new IFStrokePaint());
                            });
                        }.bind(this)))
                    .append($('<button></button>')
                        .addClass('fa fa-fw fa-circle')
                        // TODO : I18N
                        .attr('title', 'Add Fill')
                        .on('click', function () {
                            this._modifyEachSelectedStyle(function (style) {
                                style.getActualStyle().appendChild(new IFFillPaint());
                            });
                        }.bind(this)))))
            .append($('<div></div>')
                .addClass('style-entries-panel-content'))
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
                // Iterate and add the first, non-linked style as default one
                // as well as add all linked styles that are common to _all_ elements
                var linkedStyles = [];
                var defaultStyle = {
                    style: null,
                    usage: 0
                };

                for (var i = 0; i < this._styleElements.length; ++i) {
                    var styleSet = this._styleElements[i].getStyleSet();
                    var hasDefaultStyle = false;
                    for (var node = styleSet.getFirstChild(); node !== null; node = node.getNext()) {
                        if (node instanceof IFLinkedStyle) {
                            var hasLinkedStyle = false;
                            for (var j = 0; j < linkedStyles.length; ++j) {
                                if (linkedStyles[j].style.getProperty('ref') === node.getProperty('ref')) {
                                    linkedStyles[j].usage += 1;
                                    hasLinkedStyle = true;
                                    break;
                                }
                            }

                            if (!hasLinkedStyle) {
                                linkedStyles.push({
                                    style: node,
                                    usage: 1
                                });
                            }
                        }
                        else if (node instanceof IFInlineStyle) {
                            if (!hasDefaultStyle) {
                                if (!defaultStyle.style) {
                                    defaultStyle.style = node;
                                }
                                defaultStyle.usage++;
                            }
                            hasDefaultStyle = true;
                        }
                    }
                }

                // Add default style if common to all elements
                if (defaultStyle.style && defaultStyle.usage === this._styleElements.length) {
                    if (!this._styles) {
                        this._styles = [];
                    }
                    this._styles.push(defaultStyle.style);
                }

                // Add all linked styles if they're common to all elements
                for (var i = 0; i < linkedStyles.length; ++i) {
                    if (linkedStyles[i].usage === this._styleElements.length) {
                        if (!this._styles) {
                            this._styles = [];
                        }
                        this._styles.push(linkedStyles[i].style);
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
                                var $this = $(evt.target);
                                evt.stopPropagation();
                                if (style.getProperty('vs') === true) {
                                    this._modifyEachSelectedStyle(function (style) {
                                        style.setProperty('vs', false);
                                    });

                                    $this.removeClass('fa-circle');
                                    $this.addClass('fa-circle-o');
                                } else {
                                    this._modifyEachSelectedStyle(function (style) {
                                        style.setProperty('vs', true);
                                    });

                                    $this.removeClass('fa-circle-o');
                                    $this.addClass('fa-circle');
                                }
                            }.bind(this))))
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

    GStylePalette.prototype._setSelectedStyleProperties = function (properties, values, styleRef) {
        if (styleRef || this._selectedStyleIndex >= 0) {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                this._visitEachSelectedStyle(function (style) {
                    style.setProperties(properties, values);
                }, styleRef);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Modify Style Properties');
            }
        }
    };

    GStylePalette.prototype._modifyEachSelectedStyle = function (modifier, styleRef) {
        if (styleRef || this._selectedStyleIndex >= 0) {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                this._visitEachSelectedStyle(modifier, styleRef);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Modify Style(s)');
            }
        }
    };

    GStylePalette.prototype._visitEachSelectedStyle = function (visitor, styleRef) {
        if (styleRef || this._selectedStyleIndex >= 0) {
            styleRef = styleRef || this._styles[this._selectedStyleIndex];

            if (this._styleElements.length > 1) {
                for (var i = 0; i < this._styleElements.length; ++i) {
                    var styleSet = this._styleElements[i].getStyleSet();
                    for (var node = styleSet.getFirstChild(); node !== null; node = node.getNext()) {
                        if (styleRef instanceof IFLinkedStyle && node instanceof IFLinkedStyle && styleRef.getProperty('ref') === node.getProperty('ref')) {
                            visitor(node);
                            break;
                        }
                        else if (styleRef instanceof IFInlineStyle && node instanceof IFInlineStyle) {
                            visitor(node);
                            break;
                        }
                    }
                }
            } else {
                visitor(styleRef);
            }
        }
    };

    GStylePalette.prototype._updateSelectedStyle = function () {
        this._updateStyleSettings();
        this._updatePatterns();
    };

    GStylePalette.prototype._updateStyleSettings = function () {
        this._styleSettings.css('display', 'none');

        if (this._selectedStyleIndex >= 0) {
            this._styleSettings.css('display', '');
            var style = this._styles[this._selectedStyleIndex];
            this._styleSettings.find('[data-property="blm"]').val(style.getProperty('blm'));
            this._styleSettings.find('[data-property="opc"]').val(ifUtil.formatNumber(style.getProperty('opc') * 100));
        }
    };

    GStylePalette.prototype._updatePatterns = function () {
        var content = this._patternsPanel.find('.style-entries-panel-content');

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
                .appendTo(content);
        }.bind(this);

        this._patternsPanel.css('display', 'none');
        content.empty();

        if (this._selectedStyleIndex >= 0) {
            this._patternsPanel.css('display', '');
            var style = this._styles[this._selectedStyleIndex].getActualStyle();

            for (var entry = style.getFirstChild(); entry !== null; entry = entry.getNext()) {
                if (entry instanceof IFFillPaint || entry instanceof IFStrokePaint) {
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