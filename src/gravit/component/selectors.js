(function ($) {

    /**
     * Selector that selects all editable elements including all input
     * elements and also content editable elements and the such
     * @param obj
     * @returns {boolean}
     */
    $.expr[':'].editable = function(obj){
        var $this = $(obj);
        return $this.is(':input') || $this.attr('contenteditable') === 'true' || obj.isContentEditable;
    };

}(jQuery));