(function ($) {

    var cornerTypes = [
        GXPathBase.CornerType.Rounded,
        GXPathBase.CornerType.InverseRounded,
        GXPathBase.CornerType.Bevel,
        GXPathBase.CornerType.Inset,
        GXPathBase.CornerType.Fancy
    ];

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            return this.each(function () {
                var $this = $(this);
                if ($this.is("select")) {
                    // If the last item is an optgroup, use that as a target
                    var target = $this;
                    var lastElement = $this.find(':last');
                    if (lastElement.is('optgroup')) {
                        target = lastElement;
                    }

                    // Append corner types
                    for (var i = 0; i < cornerTypes.length; ++i) {
                        target.append($('<option></option>')
                            .attr('value', cornerTypes[i])
                            .text(gLocale.get(GXPathBase.CornerTypeName[cornerTypes[i]])));
                    }
                }
            });
        }
    };

    /**
     * Adds a translated list of options to a selection that
     * represents the GXBasePath.CornerType choices
     * TODO : Replace select with visual selector with icons
     */
    $.fn.gCornerType = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));