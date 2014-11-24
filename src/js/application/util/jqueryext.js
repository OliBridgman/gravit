(function ($) {

    /**
     * Selector that selects all editable elements including all input
     * elements and also content editable elements and the such
     * @param obj
     * @returns {boolean}
     */
    $.expr[':'].editable = function(obj){
        var $this = $(obj);

        if ($this.attr('contenteditable') === 'true' || obj.isContentEditable) {
            return true;
        }

        if ($this.is(':input')) {
            var type = $this.attr('type');
            return !type || type === '' || type === 'text';
        }

        if ($this.is('textArea')) {
            return true;
        }

        return false;
    };

}(jQuery));