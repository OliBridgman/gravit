(function ($) {

    function updateSelectedStyle ($this, style) {
        $this.find('.style-block').each(function (index, element) {
            var $element = $(element);
            $element
                .toggleClass('selected', $element.data('style') === style);
        });
    };

    function afterInsertEvent (evt) {
        var $this = $(this);
        var container = $this.data('gstylepanel').container;
        if (evt.node instanceof IFStyle && evt.node.getParent() === container) {
            methods.insertStyle.call(this, evt.node);
        }
    };

    function beforeRemoveEvent (evt) {
        // TODO
    };

    var methods = {
        init: function (options) {
            options = $.extend({
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
                block.attr('title', name);
            }

            //if (index >= 0) {
            //    block.insertBefore(this._styleSelector.children('.style-block').eq(index));
            //} else {
            //    block.appendTo(this._styleSelector);
            //}
            block.appendTo($this);
        },

        clear: function () {
            var remove = [];

            $(this).find('.style-block').each(function (index, block) {
                var $block = $(block);
                if (!$block.hasClass('style-null')) {
                    remove.push($block);
                }
            });

            for (var i = 0; i < remove.length; ++i) {
                remove[i].remove();
            }
        },

        attach: function (container) {
            var $this = $(this);
            var data = $this.data('gstylepanel');

            methods.detach.call(this);

            data.container = container;

            if (container) {
                for (var child = container.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFStyle) {
                        methods.insertStyle.call(this, child);
                    }
                }

                // Subscribe to container
                var scene = container.getScene();
                if (scene) {
                    data.afterInsertHandler = afterInsertEvent.bind(this);
                    data.beforeRemoveHandler = beforeRemoveEvent.bind(this);
                    scene.addEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.addEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                }
            }
            return this;
        },

        detach: function () {
            var $this = $(this);
            var data = $this.data('gstylepanel');
            var container = data.container;

            if (container) {
                // Unsubscribe from container
                var scene = container.getScene();
                if (scene) {
                    scene.removeEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.removeEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                }
            }

            data.container = null;
            data.afterInsertHandler = null;
            data.beforeRemoveHandler = null;

            methods.clear.call(this);

            return this;
        },

        // Assigns or returns the selected style
        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gstylepanel').selected;
            } else {
                $this.data('gstylepanel').selected = value;
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