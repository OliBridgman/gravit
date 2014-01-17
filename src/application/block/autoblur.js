(function ($) {

    var methods = {
        init: function (options) {
            var self = this;
            return this.each(function () {
                var $this = $(this);
                if ($this.is(":input")) {
                    $this.on('keyup', function (evt) {
                        if (evt.keyCode == 13) {
                            $this.blur();
                            $this.trigger('change');
                        }
                    });
                }
            });
        }
    };

    /**
     * Block to make input elements blur when hitting enter as well
     * as triggering a change event for input elements even if the
     * value was not changed at all.
     */
    $.fn.exAutoBlur = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));