(function ($) {

    function updateSelectedStyle ($this, style) {
        $this.find('.style-block').each(function (index, element) {
            var $element = $(element);
            $element
                .toggleClass('selected', $element.data('style') === style);
        });
    };

    var methods = {
        init: function (options) {
            options = $.extend({
                // A styleSet to subscribe to for rendering the styles,
                // if not provided, styles and events need to be handled
                // manually
                styleSet: null,

                // The html code or Jquery for the null style, if set to null,
                // no null style will be provided for choosing
                nullStyle: null
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this)
                    .addClass('g-style-panel')
                    .data('gstylepanel', {
                        selected: null
                    });

                if (options.nullStyle) {
                    $('<div></div>')
                        .addClass('style-block style-null')
                        .append(options.nullStyle)
                        .on('click', function () {
                            $this.data('gstylepanel').selected = null;
                            updateSelectedStyle($this, null);
                            self.trigger('change', null);
                        })
                        .data('style', null)
                        .appendTo($this);
                }

                if (options.styleSet) {
                    for (var child = options.styleSet.getFirstChild(); child !== null; child = child.getNext()) {
                        if (child instanceof IFStyle) {
                            methods.insertStyle.call(self, child);
                        }
                    }
                }
            });
        },

        insertStyle: function (style, index) {
            var $this = $(this);
            var self = this;

            var block = $('<div></div>')
                .addClass('style-block')
                .attr('draggable', 'true')
                .append($('<img>')
                    .addClass('style-preview')
                    .attr('src', style.createPreviewImage(36, 36)))
                .on('click', function () {
                    $this.data('gstylepanel').selected = style;
                    updateSelectedStyle($this, style);
                    self.trigger('change', style)
                })
                .data('style', style);

            var name = style instanceof IFSharedStyle ? style.getProperty('name') : '';
            if (name !== '') {
                block.attr('data-name', name);
            }

            //if (index >= 0) {
            //    block.insertBefore(this._styleSelector.children('.style-block').eq(index));
            //} else {
            //    block.appendTo(this._styleSelector);
            //}
            block.appendTo($this);
        },

        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gstylepanel').selected;
            } else {
                $this.data('gcolorpanel').selected = value;
                updateSelectedStyle($this, value);
                return this;
            }
        }
    };

    /**
     * Block to transform divs to style panels
     */
    $.fn.gStylePanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));