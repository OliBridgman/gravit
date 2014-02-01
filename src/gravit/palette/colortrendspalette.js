(function (_) {

    /**
     * Color Trends Palette
     * @class EXColorTrendsPalette
     * @extends EXPalette
     * @constructor
     */
    function EXColorTrendsPalette() {
        EXPalette.call(this);
    };
    GObject.inherit(EXColorTrendsPalette, EXPalette);

    EXColorTrendsPalette.ID = "color-trends";
    EXColorTrendsPalette.TITLE = new GLocale.Key(EXColorTrendsPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    EXColorTrendsPalette.prototype._htmlElement = null;

    /**
     * @type {GXColor}
     * @private
     */
    EXColorTrendsPalette.prototype._currentColor = null;

    /** @override */
    EXColorTrendsPalette.prototype.getId = function () {
        return EXColorTrendsPalette.ID;
    };

    /** @override */
    EXColorTrendsPalette.prototype.getTitle = function () {
        return EXColorTrendsPalette.TITLE;
    };

    /** @override */
    EXColorTrendsPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_COLOR;
    };

    /** @override */
    EXColorTrendsPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;

        var _addTrend = function (index) {
            var icon = null;
            switch (index) {
                // Tint
                case 1:
                    icon = 'tint';
                    break;
                // Shade
                case 2:
                    icon = 'square';
                    break;
                // Tone
                case 3:
                    icon = 'adjust';
                    break;
            }

            var container = $('<div></div>')
                .addClass('color-trend color-trend-' + index.toString())
                .append($('<span></span>')
                    .addClass('color-trend-icon fa fa-' + icon))
                .append($('<div></div>')
                    .addClass('color-palette')
                    .append($('<div></div>')
                        .addClass('ex-color-preview')))
                .append($('<div></div>')
                    .addClass('color-trend-value')
                    .append($('<input>')
                        .attr('type', 'text')
                        .exAutoBlur()
                        .on('input', function (evt) {
                            var val = $(evt.target).val();
                            var newColor = this._updateTrendValue(index, val);
                            this._updateCurrentColor(newColor);
                        }.bind(this))))
                .appendTo(this._htmlElement);

            var preview = container.find('.ex-color-preview');
            for (var i = 1; i <= 10; ++i) {
                $('<div></div>')
                    .addClass('color-trend-box-' + (i === 10 ? 'current' : i.toString()))
                    .css('width', '10%')
                    .exColorBox({
                        drop: false
                    })
                    .on('click', function (evt) {
                        this._updateCurrentColor($(evt.target).exColorBox('color'));
                    }.bind(this))
                    .appendTo(preview);
            }
        }.bind(this);

        // Append our trend palettes
        for (var i = 1; i <= 3; ++i) {
            _addTrend(i);
        }

        // Append toolbar
        var toolbar = $('<div></div>')
            .addClass('color-toolbar')
            .appendTo(this._htmlElement);

        // Append swatch chooser
        // TODO : Implement this properly
        var swatchChooserButton = new GUIMenuButton();
        swatchChooserButton._item._htmlElement.addClass('g-flat');
        toolbar.append(swatchChooserButton._htmlElement);

        // Append preview container
        $('<div></div>')
            .addClass('color-preview')
            .append($('<div></div>')
                .addClass('ex-color-preview')
                .append($('<div></div>')
                    .attr('data-color-type', 'global')
                    .exColorBox()
                    .on('g-color-change', function (evt, color) {
                        gApp.setGlobalColor(color);
                    }))
                .append($('<div></div>')
                    .attr('data-color-type', 'current')
                    .exColorBox()
                    .on('g-color-change', function (evt, color) {
                        gApp.setGlobalColor(color);
                    })))
            .appendTo(toolbar);

        // Make an initial update
        this._updateFromGlobalColor();

        // Subscribe to global color change event
        gApp.addEventListener(EXApplication.GlobalColorChangedEvent, function () {
            this._updateFromGlobalColor();
        }.bind(this));
    };

    /**
     * Update from current global color
     * @private
     */
    EXColorTrendsPalette.prototype._updateFromGlobalColor = function () {
        var sourceColor = gApp.getGlobalColor();

        // Update global color preview
        this._htmlElement.find('.ex-color-preview [data-color-type="global"]').exColorBox('color', sourceColor);

        // Update all trends from global color
        for (var i = 1; i <= 3; ++i) {
            var container = this._htmlElement.find('.color-trend-' + i.toString());
            for (var k = 1; k <= 9; ++k) {
                var newColor = this._colorForTrendAndValue(i, k * 10);

                // Assign to color box
                container.find('.color-trend-box-' + k.toString())
                    .exColorBox('color', newColor);

                // If this is 50% then assign to current trend box
                // and update it's text input
                if (k === 5) {
                    this._updateTrendValue(i, 50);
                }
            }
        }
    };

    /**
     * Update a trend's current value and returns the new color
     * @param {Number} trend
     * @param {Number|String} value
     * @return {GXColor}
     * @private
     */
    EXColorTrendsPalette.prototype._updateTrendValue = function (trend, value) {
        if (typeof value === 'string') {
            value = parseInt(value);
            if (isNaN(value)) {
                value = 50;
            }
        }
        if (value < 0) {
            value = 0;
        } else if (value > 100) {
            value = 100;
        }

        var container = this._htmlElement.find('.color-trend-' + trend.toString());

        var newColor = this._colorForTrendAndValue(trend, value);

        container.find('.color-trend-box-current')
            .exColorBox('color', newColor);

        container.find('.color-trend-value > input')
            .val(value);

        return newColor;
    };

    /**
     * Calculate a color for a given trend number and value
     * @param {Number} trend
     * @param {Number} value
     * @return {GXColor}
     * @private
     */
    EXColorTrendsPalette.prototype._colorForTrendAndValue = function (trend, value) {
        var sourceColor = gApp.getGlobalColor();

        // Calculate a new color
        switch (trend) {
            // Tint
            case 1:
                return sourceColor.withTint(value);

            // Shade
            case 2:
                return sourceColor.withShade(value);

            // Tone
            case 3:
                return sourceColor.withTone(value);

            default:
                throw new Error('Unknown trend: ' + trend);
        }
    };

    /**
     * Update the current color
     * @private
     */
    EXColorTrendsPalette.prototype._updateCurrentColor = function (color) {
        if (!GXColor.equals(color, this._currentColor)) {
            this._currentColor = color;

            // Update preview
            this._htmlElement.find('.ex-color-preview [data-color-type="current"]').exColorBox('color', this._currentColor);
        }
    };

    /** @override */
    EXColorTrendsPalette.prototype.toString = function () {
        return "[Object EXColorTrendsPalette]";
    };

    _.EXColorTrendsPalette = EXColorTrendsPalette;
})(this);