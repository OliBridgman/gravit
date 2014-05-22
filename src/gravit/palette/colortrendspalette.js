(function (_) {

    /**
     * Color Trends Palette
     * @class GColorTrendsPalette
     * @extends GPalette
     * @constructor
     */
    function GColorTrendsPalette() {
        GPalette.call(this);
    };
    IFObject.inherit(GColorTrendsPalette, GPalette);

    GColorTrendsPalette.ID = "color-trends";
    GColorTrendsPalette.TITLE = new IFLocale.Key(GColorTrendsPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GColorTrendsPalette.prototype._htmlElement = null;

    /**
     * @type {IFColor}
     * @private
     */
    GColorTrendsPalette.prototype._currentColor = null;

    /** @override */
    GColorTrendsPalette.prototype.getId = function () {
        return GColorTrendsPalette.ID;
    };

    /** @override */
    GColorTrendsPalette.prototype.getTitle = function () {
        return GColorTrendsPalette.TITLE;
    };

    /** @override */
    GColorTrendsPalette.prototype.getGroup = function () {
        return GPalette.GROUP_COLOR;
    };

    /** @override */
    GColorTrendsPalette.prototype.init = function (htmlElement, menu) {
        GPalette.prototype.init.call(this, htmlElement, menu);

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
                        .addClass('color-preview')))
                .append($('<div></div>')
                    .addClass('color-trend-value')
                    .append($('<input>')
                        .attr('type', 'text')
                        .gAutoBlur()
                        .on('input', function (evt) {
                            var val = $(evt.target).val();
                            var newColor = this._updateTrendValue(index, val);
                            this._updateCurrentColor(newColor);
                        }.bind(this))))
                .appendTo(this._htmlElement);

            var preview = container.find('.color-preview');
            for (var i = 1; i <= 10; ++i) {
                $('<div></div>')
                    .addClass('color-trend-box-' + (i === 10 ? 'current' : i.toString()))
                    .css('width', '10%')
                    .gColorSwatch({
                        drop: false
                    })
                    .on('click', function (evt) {
                        this._updateCurrentColor($(evt.target).gColorSwatch('value'));
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

        // Append swatch / color chooser
        // TODO : Enable only swatches & make visible
        $('<button></button>')
            .css('visibility', 'hidden')
            .gColorButton()
            .appendTo(toolbar);

        // Append preview container
        $('<div></div>')
            .addClass('color-preview')
            .addClass('color-preview')
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
                }))
            .appendTo(toolbar);

        // Make an initial update
        this._updateFromGlobalColor();

        // Subscribe to global color change event
        gApp.addEventListener(GApplication.GlobalColorChangedEvent, function () {
            this._updateFromGlobalColor();
        }.bind(this));
    };

    /**
     * Update from current global color
     * @private
     */
    GColorTrendsPalette.prototype._updateFromGlobalColor = function () {
        var sourceColor = gApp.getGlobalColor();

        // Update global color preview
        this._htmlElement.find('.color-preview [data-color-type="global"]').gColorSwatch('value', sourceColor);

        // Update all trends from global color
        for (var i = 1; i <= 3; ++i) {
            var container = this._htmlElement.find('.color-trend-' + i.toString());
            for (var k = 1; k <= 9; ++k) {
                var newColor = this._colorForTrendAndValue(i, k * 10);

                // Assign to color box
                container.find('.color-trend-box-' + k.toString())
                    .gColorSwatch('value', newColor);

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
     * @return {IFColor}
     * @private
     */
    GColorTrendsPalette.prototype._updateTrendValue = function (trend, value) {
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
            .gColorSwatch('value', newColor);

        container.find('.color-trend-value > input')
            .val(value);

        return newColor;
    };

    /**
     * Calculate a color for a given trend number and value
     * @param {Number} trend
     * @param {Number} value
     * @return {IFColor}
     * @private
     */
    GColorTrendsPalette.prototype._colorForTrendAndValue = function (trend, value) {
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
    GColorTrendsPalette.prototype._updateCurrentColor = function (color) {
        if (!IFColor.equals(color, this._currentColor)) {
            this._currentColor = color;

            // Update preview
            this._htmlElement.find('.color-preview [data-color-type="current"]').gColorSwatch('value', this._currentColor);
        }
    };

    /** @override */
    GColorTrendsPalette.prototype.toString = function () {
        return "[Object GColorTrendsPalette]";
    };

    _.GColorTrendsPalette = GColorTrendsPalette;
})(this);