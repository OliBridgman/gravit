(function (_) {

    /**
     * Color Matcher Palette
     * @class EXColorMatcherPalette
     * @extends EXPalette
     * @constructor
     */
    function EXColorMatcherPalette() {
        EXPalette.call(this);

        this._matcherInfo = [];
    };
    GObject.inherit(EXColorMatcherPalette, EXPalette);

    EXColorMatcherPalette.ID = "color-matcher";
    EXColorMatcherPalette.TITLE = new GLocale.Key(EXColorMatcherPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    EXColorMatcherPalette.prototype._htmlElement = null;

    /**
     * @type {GUIMenuButton}
     * @private
     */
    EXColorMatcherPalette.prototype._colorMatcherButton = null;

    /**
     * @type {Array<{{panel: JQuery, matcher: EXColorMatcher}}>}
     * @private
     */
    EXColorMatcherPalette.prototype._matcherInfo = null;

    /**
     * @type {EXColorMatcher}
     * @private
     */
    EXColorMatcherPalette.prototype._matcher = null;

    /**
     * @type {GXColor}
     * @private
     */
    EXColorMatcherPalette.prototype._currentColor = null;

    /**
     * @returns {EXColorMatcher}
     */
    EXColorMatcherPalette.prototype.getMatcher = function () {
        return this._matcher;
    };

    /**
     * @param {EXColorMatcher} matcher
     */
    EXColorMatcherPalette.prototype.setMatcher = function (matcher) {
        if (matcher !== this._matcher) {
            if (this._matcher !== null) {
                var matcherInfo = this._getMatcherInfo(this._matcher);
                matcherInfo.panel.detach();
            }

            this._matcher = matcher;

            if (this._matcher !== null) {
                var matcherInfo = this._getMatcherInfo(this._matcher);
                matcherInfo.panel.appendTo(this._htmlElement.find('.color-matcher-panel'));
                this._colorMatcherButton.setCaption(this._matcher.getTitle());
            }

            this._updateMatches();
        }
    };

    /** @override */
    EXColorMatcherPalette.prototype.getId = function () {
        return EXColorMatcherPalette.ID;
    };

    /** @override */
    EXColorMatcherPalette.prototype.getTitle = function () {
        return EXColorMatcherPalette.TITLE;
    };

    /** @override */
    EXColorMatcherPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_COLOR;
    };

    /** @override */
    EXColorMatcherPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;

        // Append the matcher panel
        $('<div></div>')
            .addClass('color-matcher-panel')
            .appendTo(this._htmlElement);

        // Append the palette panel
        $('<div></div>')
            .addClass('color-palette-panel ex-color-preview')
            .appendTo(this._htmlElement);

        // Append toolbar
        var toolbar = $('<div></div>')
            .addClass('color-toolbar')
            .appendTo(this._htmlElement);

        // Append matcher chooser selector
        this._colorMatcherButton = new GUIMenuButton();
        this._colorMatcherButton._item._htmlElement.addClass('g-flat');
        toolbar.append(this._colorMatcherButton._htmlElement);

        // Initiate matchers
        // TODO : Order color matchers by group
        var _initColorMatcher = function (matcher) {
            // Add menu item
            var item = new GUIMenuItem();
            item.setCaption(matcher.getTitle());
            item.addEventListener(GUIMenuItem.UpdateEvent, function () {
                item.setChecked(matcher === this._matcher);
            }.bind(this));
            item.addEventListener(GUIMenuItem.ActivateEvent, function () {
                this.setMatcher(matcher);
            }.bind(this));
            this._colorMatcherButton.getMenu().addItem(item);

            // Init and add panel
            var panel = $('<div></div>');
            matcher.init(panel);

            // Register on update event
            matcher.addEventListener(EXColorMatcher.MatchUpdateEvent, function () {
                if (this._matcher === matcher) {
                    this._updateMatches();
                }
            }.bind(this));

            this._matcherInfo.push({
                panel: panel,
                matcher: matcher
            });
        }.bind(this);

        var lastCategory = null;
        for (var i = 0; i < gravit.colorMatchers.length; ++i) {
            var matcher = gravit.colorMatchers[i];
            var category = gLocale.get(matcher.getCategory());

            // Add to selector
            if (!lastCategory || category !== lastCategory) {
                var item = new GUIMenuItem();
                item.setCaption(category);
                item.setEnabled(false);
                this._colorMatcherButton.getMenu().addItem(item);
                lastCategory = category;
            }

            _initColorMatcher(matcher);
        }

        // Append preview container
        $('<div></div>')
            .addClass('color-preview')
            .append($('<div></div>')
                .addClass('ex-color-preview')
                .append($('<div></div>')
                    .attr('data-color-type', 'global')
                    .gColorSwatch()
                    .on('change', function (evt, color) {
                        gApp.setGlobalColor(color);
                    }))
                .append($('<div></div>')
                    .attr('data-color-type', 'current')
                    .gColorSwatch()
                    .on('change', function (evt, color) {
                        gApp.setGlobalColor(color);
                    })))
            .appendTo(toolbar);

        // Set first matcher available
        this.setMatcher(gravit.colorMatchers[0]);

        // Make an initial update
        this._updateFromGlobalColor();

        // Subscribe to global color change event
        gApp.addEventListener(EXApplication.GlobalColorChangedEvent, function () {
            this._updateFromGlobalColor();
        }.bind(this));
    };

    /**
     * @private
     */
    EXColorMatcherPalette.prototype._updateMatches = function () {
        var palettePanel = this._htmlElement.find('.color-palette-panel');
        palettePanel.empty();

        var _addMatchColor = function (color, width) {

            // TODO : Convert color back into global color's format taking CMS into account!!!

            $('<div></div>')
                .css('width', width.toString() + '%')
                .gColorSwatch({
                    drop: false
                })
                .gColorSwatch('value', color)
                .on('click', function () {
                    this._updateCurrentColor(color);
                }.bind(this))
                .appendTo(palettePanel);
        }.bind(this);

        var matches = this._matcher.match(this._matcher.isReferenceColorBased() ? gApp.getGlobalColor() : null);
        if (matches && matches.length > 0) {
            var len = Math.min(matches.length, 8);
            var width = 100 / len;
            for (var i = 0; i < len; ++i) {
                // Convert match color to same type as global color
                var match = matches[i].toType(gApp.getGlobalColor().getType());

                _addMatchColor(match, width);

                if (i === 0) {
                    this._updateCurrentColor(match);
                }
            }
        }
    };

    /**
     * Update from current global color
     * @private
     */
    EXColorMatcherPalette.prototype._updateFromGlobalColor = function () {
        // Update global color preview
        this._htmlElement.find('.ex-color-preview [data-color-type="global"]').gColorSwatch('value', gApp.getGlobalColor());

        // Update matches if current matcher requires reference color
        if (this._matcher.isReferenceColorBased()) {
            this._updateMatches();
        }
    };

    /**
     * Update the current color
     * @private
     */
    EXColorMatcherPalette.prototype._updateCurrentColor = function (color) {
        if (!GXColor.equals(color, this._currentColor)) {
            this._currentColor = color;

            // Update preview
            this._htmlElement.find('.ex-color-preview [data-color-type="current"]').gColorSwatch('value', this._currentColor);
        }
    };

    /**
     * @param {EXColorMatcher} matcher
     * @returns {*}
     * @private
     */
    EXColorMatcherPalette.prototype._getMatcherInfo = function (matcher) {
        for (var i = 0; i < this._matcherInfo.length; ++i) {
            if (this._matcherInfo[i].matcher === matcher) {
                return this._matcherInfo[i];
            }
        }
        return null;
    };

    /** @override */
    EXColorMatcherPalette.prototype.toString = function () {
        return "[Object EXColorMatcherPalette]";
    };

    _.EXColorMatcherPalette = EXColorMatcherPalette;
})(this);