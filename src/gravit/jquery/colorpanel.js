(function ($) {

    var VIEWS = {
        'cubes': {
            icon: 'th',
            // TODO : I18N
            title: 'Cubes'
        },
        'rainbow': {
            icon: 'barcode',
            // TODO : I18N
            title: 'Rainbow'
        },
        'swatches': {
            icon: 'square-o',
            // TODO : I18N
            title: 'Swatches'
        }
    };

    var COLOR_SWATCH_COLS = 21;

    var COLORCUBES = ['000000', '000000', '000000', '000000', '003300', '006600', '009900', '00CC00', '00FF00', '330000', '333300', '336600', '339900',
        '33CC00', '33FF00', '660000', '663300', '666600', '669900', '66CC00', '66FF00', '000000', '333333', '000000', '000033', '003333',
        '006633', '009933', '00CC33', '00FF33', '330033', '333333', '336633', '339933', '33CC33', '33FF33', '660033', '663333', '666633',
        '669933', '66CC33', '66FF33', '000000', '666666', '000000', '000066', '003366', '006666', '009966', '00CC66', '00FF66', '330066',
        '333366', '336666', '339966', '33CC66', '33FF66', '660066', '663366', '666666', '669966', '66CC66', '66FF66', '000000', '999999',
        '000000', '000099', '003399', '006699', '009999', '00CC99', '00FF99', '330099', '333399', '336699', '339999', '33CC99', '33FF99',
        '660099', '663399', '666699', '669999', '66CC99', '66FF99', '000000', 'CCCCCC', '000000', '0000CC', '0033CC', '0066CC', '0099CC',
        '00CCCC', '00FFCC', '3300CC', '3333CC', '3366CC', '3399CC', '33CCCC', '33FFCC', '6600CC', '6633CC', '6666CC', '6699CC', '66CCCC',
        '66FFCC', '000000', 'FFFFFF', '000000', '0000FF', '0033FF', '0066FF', '0099FF', '00CCFF', '00FFFF', '3300FF', '3333FF', '3366FF',
        '3399FF', '33CCFF', '33FFFF', '6600FF', '6633FF', '6666FF', '6699FF', '66CCFF', '66FFFF', '000000', 'FF0000', '000000', '990000',
        '993300', '996600', '999900', '99CC00', '99FF00', 'CC0000', 'CC3300', 'CC6600', 'CC9900', 'CCCC00', 'CCFF00', 'FF0000', 'FF3300',
        'FF6600', 'FF9900', 'FFCC00', 'FFFF00', '000000', '00FF00', '000000', '990033', '993333', '996633', '999933', '99CC33', '99FF33',
        'CC0033', 'CC3333', 'CC6633', 'CC9933', 'CCCC33', 'CCFF33', 'FF0033', 'FF3333', 'FF6633', 'FF9933', 'FFCC33', 'FFFF33', '000000',
        '0000FF', '000000', '990066', '993366', '996666', '999966', '99CC66', '99FF66', 'CC0066', 'CC3366', 'CC6666', 'CC9966', 'CCCC66',
        'CCFF66', 'FF0066', 'FF3366', 'FF6666', 'FF9966', 'FFCC66', 'FFFF66', '000000', 'FFFF00', '000000', '990099', '993399', '996699',
        '999999', '99CC99', '99FF99', 'CC0099', 'CC3399', 'CC6699', 'CC9999', 'CCCC99', 'CCFF99', 'FF0099', 'FF3399', 'FF6699', 'FF9999',
        'FFCC99', 'FFFF99', '000000', '00FFFF', '000000', '9900CC', '9933CC', '9966CC', '9999CC', '99CCCC', '99FFCC', 'CC00CC', 'CC33CC',
        'CC66CC', 'CC99CC', 'CCCCCC', 'CCFFCC', 'FF00CC', 'FF33CC', 'FF66CC', 'FF99CC', 'FFCCCC', 'FFFFCC', '000000', 'FF00FF', '000000',
        '9900FF', '9933FF', '9966FF', '9999FF', '99CCFF', '99FFFF', 'CC00FF', 'CC33FF', 'CC66FF', 'CC99FF', 'CCCCFF', 'CCFFFF', 'FF00FF',
        'FF33FF', 'FF66FF', 'FF99FF', 'FFCCFF', 'FFFFFF'];

    function createColorCubes(container, hover, activate) {
        var table = $('<table></table>')
            .addClass('g-color-swatches')
            .appendTo(container);

        var parent = $('<tr></tr>').appendTo(table);

        var col = 0;
        for (var i = 0; i < COLORCUBES.length; ++i) {
            var color = '#' + COLORCUBES[i];

            $('<td></td>')
                .addClass('swatch')
                .css('background', color)
                .attr('data-color', color)
                .on('mouseenter', function () {
                    hover(GXColor.parseCSSColor($(this).attr('data-color')));
                })
                .on('mouseleave', function () {
                    hover(null);
                })
                .on('click', function () {
                    activate(GXColor.parseCSSColor($(this).attr('data-color')));
                })
                .appendTo(parent);

            if (++col === COLOR_SWATCH_COLS) {
                col = 0;
                parent = $('<tr></tr>').appendTo(table);
            }
        }
    };

    function createColorPalette(container, hover, activate) {
        var table = $('<table></table>')
            .addClass('g-color-swatches')
            .appendTo(container);

        var parent = $('<tr></tr>').appendTo(table);

        var rows = 12;
        var col = 0;
        var len = COLOR_SWATCH_COLS * rows;
        for (var i = 0; i < len; ++i) {
            var hsl = {
                H: (300 * i / len - 60),
                S: 100,
                L: 50
            };
            var color = "hsl(" + hsl.H + "," + hsl.S + "%," + hsl.L + "%)";

            $('<td></td>')
                .addClass('swatch')
                .css('background', color)
                .attr('data-color', color)
                .on('mouseenter', function () {
                    hover(GXColor.parseCSSColor($(this).attr('data-color')));
                })
                .on('mouseleave', function () {
                    hover(null);
                })
                .on('click', function () {
                    activate(GXColor.parseCSSColor($(this).attr('data-color')));
                })
                .appendTo(parent);

            if (++col === COLOR_SWATCH_COLS) {
                col = 0;
                parent = $('<tr></tr>').appendTo(table);
            }
        }
    };

    function createColorContainer($this) {
        var container = $this.find('.container');
        container.empty();

        var data = $this.data('gcolorpanel');

        var colorHover = function (color) {
            updatePreviewColor($this, color);
        };
        var colorActivate = function (color) {
            data.color = color;
            $this.trigger('change', color);
        };

        if (data.view === 'cubes') {
            createColorCubes(container, colorHover, colorActivate);
        } else if (data.view === 'rainbow') {
            createColorPalette(container, colorHover, colorActivate);
        } else if (data.view === 'swatches') {
            createColorSwatches(container, colorHover, colorActivate);
        }

        updatePreviewColor($this, null);
    };

    function updatePreviewColor($this, color) {
        color = color || $this.data('gcolorpanel').color;
        if (color) {
            $this.find('.preview').css('background', color.asCSSString());
            $this.find('.css-value').val(color.asCSSString());
        } else {
            $this.find('.preview').css('background', 'transparent');
            $this.find('.css-value').val('');
        }
    }

    var methods = {
        init: function (options) {
            options = $.extend({
                defaultView: 'cubes',
                availableViews: ['cubes', 'rainbow'], //, 'swatches'],
                noneSelect: true,
                preview: true
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);
                var data = {
                    view: options.defaultView
                };

                $this.data('gcolorpanel', data);

                var table = $('<table></table>')
                    .appendTo($this);

                var toolbar = $('<tr></tr>')
                    .appendTo(table);

                if (options.preview) {
                    $('<td></td>')
                        .append(
                            $('<div></div>')
                                .addClass('preview g-color-swatch'))
                        .appendTo(toolbar);
                }

                $('<td></td>')
                    .append($('<input>')
                        .addClass('css-value')
                        .attr('type', 'text')
                        .gAutoBlur()
                        .on('click', function () {
                            $(this).select();
                        })
                        .on('input', function (evt) {
                            var val = $(evt.target).val();
                            if (val && val !== "") {
                                var color = GXColor.parseCSSColor(val);
                                if (color) {
                                    data.color = color;
                                    $this.trigger('change', color);
                                }
                            }
                        }.bind(this)))
                    .appendTo(toolbar);

                var buttons = $('<td></td>')
                    .css('text-align', 'right')
                    .appendTo(toolbar);

                if (options.noneSelect) {
                    $('<button></button>')
                        .css('margin-right', '7px')
                        // TODO : I18N
                        .attr('title', 'Transparent')
                        .append($('<span></span>')
                            .addClass('fa fa-ban'))
                        .on('click', function () {
                            $this.trigger('change', null);
                        })
                        .appendTo(buttons);
                }

                for (var i = 0; i < options.availableViews.length; ++i) {
                    var view = options.availableViews[i];
                    $('<button></button>')
                        .attr('title', VIEWS[view].title)
                        .attr('data-view', view)
                        .append($('<span></span>')
                            .addClass('fa fa-' + VIEWS[view].icon))
                        .on('click', function () {
                            methods.view.call(self, $(this).attr('data-view'));
                        })
                        .appendTo(buttons);
                }

                $('<tr></tr>')
                    .append($('<td></td>')
                        .addClass('container')
                        .attr('colspan', toolbar.find('td').length))
                    .appendTo(table);

                createColorContainer($this, options.defaultView);
            });
        },

        view: function (view) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');
            if (!arguments.length) {
                return data.view;
            } else {
                if (view !== data.view) {
                    data.view = view;
                    createColorContainer($this);
                }
                return this;
            }
        },

        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolorpanel').color;
            } else {
                value = typeof value === 'string' ? GXColor.parseColor(value) : value;
                $this.data('gcolorpanel').color = value;
                updatePreviewColor($this, null);
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