(function ($) {
    /** @enum */
    var ViewType = {
        Palette: 'palette',
        Swatches: 'swatches',
        Sliders: 'sliders'
    };

    var MAX_SWATCHES_PER_ROW = 21;

    // 21 per row
    var PALETTE = [
        '000000', '001F3F', 'DDDDDD', '000000', '003300', '006600', '009900', '00CC00', '00FF00', '330000', '333300', '336600', '339900', '33CC00', '33FF00', '660000', '663300', '666600', '669900', '66CC00', '66FF00',
        '333333', '0074D9', 'CCCCCC', '000033', '003333', '006633', '009933', '00CC33', '00FF33', '330033', '333333', '336633', '339933', '33CC33', '33FF33', '660033', '663333', '666633', '669933', '66CC33', '66FF33',
        '666666', '7FDBFF', 'BBBBBB', '000066', '003366', '006666', '009966', '00CC66', '00FF66', '330066', '333366', '336666', '339966', '33CC66', '33FF66', '660066', '663366', '666666', '669966', '66CC66', '66FF66',
        '999999', '39CCCC', 'AAAAAA', '000099', '003399', '006699', '009999', '00CC99', '00FF99', '330099', '333399', '336699', '339999', '33CC99', '33FF99', '660099', '663399', '666699', '669999', '66CC99', '66FF99',
        'CCCCCC', '3D9970', '999999', '0000CC', '0033CC', '0066CC', '0099CC', '00CCCC', '00FFCC', '3300CC', '3333CC', '3366CC', '3399CC', '33CCCC', '33FFCC', '6600CC', '6633CC', '6666CC', '6699CC', '66CCCC', '66FFCC',
        'FFFFFF', '2ECC40', '888888', '0000FF', '0033FF', '0066FF', '0099FF', '00CCFF', '00FFFF', '3300FF', '3333FF', '3366FF', '3399FF', '33CCFF', '33FFFF', '6600FF', '6633FF', '6666FF', '6699FF', '66CCFF', '66FFFF',
        'FF0000', '01FF70', '777777', '990000', '993300', '996600', '999900', '99CC00', '99FF00', 'CC0000', 'CC3300', 'CC6600', 'CC9900', 'CCCC00', 'CCFF00', 'FF0000', 'FF3300', 'FF6600', 'FF9900', 'FFCC00', 'FFFF00',
        '00FF00', 'FFDC00', '666666', '990033', '993333', '996633', '999933', '99CC33', '99FF33', 'CC0033', 'CC3333', 'CC6633', 'CC9933', 'CCCC33', 'CCFF33', 'FF0033', 'FF3333', 'FF6633', 'FF9933', 'FFCC33', 'FFFF33',
        '0000FF', 'FF851B', '555555', '990066', '993366', '996666', '999966', '99CC66', '99FF66', 'CC0066', 'CC3366', 'CC6666', 'CC9966', 'CCCC66', 'CCFF66', 'FF0066', 'FF3366', 'FF6666', 'FF9966', 'FFCC66', 'FFFF66',
        'FFFF00', 'FF4136', '444444', '990099', '993399', '996699', '999999', '99CC99', '99FF99', 'CC0099', 'CC3399', 'CC6699', 'CC9999', 'CCCC99', 'CCFF99', 'FF0099', 'FF3399', 'FF6699', 'FF9999', 'FFCC99', 'FFFF99',
        '00FFFF', '85144B', '333333', '9900CC', '9933CC', '9966CC', '9999CC', '99CCCC', '99FFCC', 'CC00CC', 'CC33CC', 'CC66CC', 'CC99CC', 'CCCCCC', 'CCFFCC', 'FF00CC', 'FF33CC', 'FF66CC', 'FF99CC', 'FFCCCC', 'FFFFCC',
        'FF00FF', 'B10DC9', '222222', '9900FF', '9933FF', '9966FF', '9999FF', '99CCFF', '99FFFF', 'CC00FF', 'CC33FF', 'CC66FF', 'CC99FF', 'CCCCFF', 'CCFFFF', 'FF00FF', 'FF33FF', 'FF66FF', 'FF99FF', 'FFCCFF', 'FFFFFF'];

    function createPalette(container, hover, activate) {
        var table = $('<table></table>')
            .addClass('g-color-swatches')
            .appendTo(container);

        var parent = $('<tr></tr>').appendTo(table);

        var col = 0;
        for (var i = 0; i < PALETTE.length; ++i) {
            var color = '#' + PALETTE[i];

            $('<td></td>')
                .addClass('swatch')
                .css('background', color)
                .attr('data-color', color)
                .on('mouseenter', function () {
                    //hover(IFColor.parseCSSColor($(this).attr('data-color')));
                })
                .on('mouseleave', function () {
                    //hover(null);
                })
                .on('click', function () {
                    activate(IFColor.parseCSSColor($(this).attr('data-color')));
                })
                .appendTo(parent);

            if (++col === MAX_SWATCHES_PER_ROW) {
                col = 0;
                parent = $('<tr></tr>').appendTo(table);
            }
        }
    };

    function assignValue($this, value, overwritePrevious) {
        var data = $this.data('gcolorpanel');

        data.color = value;

        if (overwritePrevious) {
            data.previousColor = value;
        }

        value = typeof value === 'string' ? IFColor.parseColor(value) : value;
        $this.data('gcolorpanel').color = value;
        $this.find('input[type="color"]').val(value ? value.asHTMLHexString() : '');
        $this.find('.previous-color').css(IFColor.blendedCSSBackground(data.previousColor));
        $this.find('.current-color').css(IFColor.blendedCSSBackground(data.color));
        $this.find('.color-input').val(data.color ? data.color.asHTMLHexString() : '');
    }

    var methods = {
        init: function (options) {
            options = $.extend({
                // An attached scene used for swatch handling
                scene: null,
                // Whether to allow clearing the color or not
                clearColor: false,
                // The default view
                defaultView: ViewType.Palette
            }, options);

            var self = this;
            return this.each(function () {
                var data = {
                    options: options
                };

                var $this = $(this)
                    .data('gcolorpanel', data);

                $this
                    .addClass('g-color-panel')
                    .append($('<input>')
                        .attr('type', 'color')
                        .css({
                            'position': 'absolute',
                            'visibility': 'hidden'
                        })
                        .on('change', function () {
                            var color = IFColor.parseCSSColor($(this).val());
                            assignValue($this, color, false);
                            $this.trigger('colorchange', color);
                        }))
                    .append($('<div></div>')
                        .addClass('toolbar')
                        .append($('<div></div>')
                            .addClass('section-start')
                            .append($('<button></button>')
                                .attr('data-action', 'clear')
                                // TODO : I18N
                                .attr('title', 'Clear Color')
                                .append($('<span></span>')
                                    .addClass('fa fa-ban'))
                                .on('click', function () {
                                    assignValue($this, null, false);
                                    $this.trigger('colorchange', null);
                                }))
                            .append($('<button></button>')
                                .attr('data-action', 'system-color')
                                // TODO : I18N
                                .attr('title', 'System')
                                .append($('<span></span>')
                                    .addClass('fa fa-cog'))
                                .on('click', function () {
                                    $this.find('input[type="color"]').trigger('click');
                                })))
                        .append($('<div></div>')
                            .addClass('section-center')
                            .append($('<button></button>')
                                .addClass('g-flat')
                                .attr('data-view', ViewType.Palette)
                                // TODO : I18N
                                .attr('title', 'Palette')
                                .append($('<span></span>')
                                    .addClass('fa fa-th')))
                            .append($('<button></button>')
                                .addClass('g-flat')
                                .attr('data-view', ViewType.Swatches)
                                // TODO : I18N
                                .attr('title', 'Swatches')
                                .append($('<span></span>')
                                    .addClass('fa fa-bars')))
                            .append($('<button></button>')
                                .addClass('g-flat')
                                .attr('data-view', ViewType.Sliders)
                                // TODO : I18N
                                .attr('title', 'Sliders')
                                .append($('<span></span>')
                                    .addClass('fa fa-sliders'))))
                        .append($('<div></div>')
                            .addClass('section-end')
                            .append($('<select></select>')
                                .append($('<option>CMYK</option>'))
                                .append($('<option>RGB</option>'))
                                .append($('<option>HSL</option>'))
                                .append($('<option>Tone</option>')))))
                    .append($('<div></div>')
                        .addClass('color-area'))
                    .append($('<div></div>')
                        .addClass('color')
                        .append($('<div></div>')
                            .append($('<div>&nbsp;</div>')
                                .addClass('previous-color g-input'))
                            .append($('<div>&nbsp;</div>')
                                .addClass('current-color g-input'))
                            .append($('<input>')
                                .addClass('color-input')
                                .on('change', function () {
                                    var color = IFColor.parseCSSColor($(this).val());
                                    if (color) {
                                        assignValue($this, color, false);
                                        $this.trigger('colorchange', color);
                                    }
                                })))
                        .append($('<div></div>')
                            .append($('<select></select>')
                                .addClass('matcher-select'))))
                    .append($('<div></div>')
                        .addClass('matcher')
                        .text('Matcher'))
                    .append($('<div></div>')
                        .addClass('trends')
                        .text('Trends'));

                $this.find('[data-view]').each(function (index, element) {
                    var $element = $(element);
                    $element
                        .on('click', function (evt) {
                            methods.view.call(self, $element.attr('data-view'));
                        });
                });

                // Initiate matchers
                // TODO : Order color matchers by group
                var _initColorMatcher = function (matcher, group) {
                    // Init and add panel
                    var panel = $('<div></div>');
                    matcher.init(panel);

                    // Add option
                    $('<option></option>')
                        .data('matcher', {
                            matcher: matcher,
                            panel: panel
                        })
                        .text(ifLocale.get(matcher.getTitle()))
                        .appendTo(group);

                    // Register on update event
                    matcher.addEventListener(GColorMatcher.MatchUpdateEvent, function () {
                        //if (this._matcher === matcher) {
                        //    this._updateMatches();
                        //}
                    }.bind(this));
                }.bind(this);

                var matcherSelect = $this.find('.matcher-select');
                var matcherGroup = matcherSelect;
                var lastCategory = null;
                for (var i = 0; i < gravit.colorMatchers.length; ++i) {
                    var matcher = gravit.colorMatchers[i];
                    var category = ifLocale.get(matcher.getCategory());

                    // Add to selector
                    if (!lastCategory || category !== lastCategory) {
                        matcherGroup = $('<optgroup></optgroup>')
                            .attr('label', category)
                            .appendTo(matcherSelect);
                        lastCategory = category;
                    }

                    _initColorMatcher(matcher, matcherGroup);
                }

                if (options.scene) {
                    methods.scene.call(self, options.scene);
                }

                methods.view.call(self, options.defaultView);
            });
        },

        view: function (value) {
            var self = this;
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.view;
            } else {
                if (value !== data.view) {
                    data.view = value;

                    $this.find('[data-view]').each(function (index, element) {
                        var $element = $(element);
                        $element.toggleClass('g-active', $element.attr('data-view') === value);
                    });

                    createPalette($this.find('.color-area'), null, function (color) {
                        assignValue($this, color, false);
                        $this.trigger('colorchange', color);
                    });
                }
                return this;
            }
        },

        scene: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolorpanel').scene;
            } else {
                // TODO : Detach & Attach listeners & Change active view if swatches & value=null
                $this.data('gcolorpanel').scene = value;
                $this.find('[data-view="' + ViewType.Swatches + '"]')
                    .css('display', value ? '' : 'none');
                return this;
            }
        },

        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolorpanel').color;
            } else {
                assignValue($this, value, true);
                return this;
            }
        }
    };

    /**
     * Block to transform divs to color panels
     */
    $.fn.gColorPanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));