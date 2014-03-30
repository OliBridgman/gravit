(function ($) {

    var cornerTypes = [
        {
            type: GXPathBase.CornerType.Rounded,
            // TODO : I18N
            name: 'Rounded'
        },
        {
            type: GXPathBase.CornerType.InverseRounded,
            // TODO : I18N
            name: 'Inverse Rounded'
        },
        {
            type: GXPathBase.CornerType.Bevel,
            // TODO : I18N
            name: 'Beveled'
        },
        {
            type: GXPathBase.CornerType.Inset,
            // TODO : I18N
            name: 'Inset'
        },
        {
            type: GXPathBase.CornerType.Fancy,
            // TODO : I18N
            name: 'Fancy'
        }
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
                            .attr('value', cornerTypes[i].type)
                            .text(cornerTypes[i].name));
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