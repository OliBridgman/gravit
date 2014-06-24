(function (_) {

    /**
     * The styles sidebar
     * @class GStylesSidebar
     * @extends GSidebar
     * @constructor
     */
    function GStylesSidebar() {
        GSidebar.call(this);
    }
    IFObject.inherit(GStylesSidebar, GSidebar);

    GStylesSidebar.ID = "styles";
    GStylesSidebar.TITLE = new IFLocale.Key(GStylesSidebar, "title");

    /** @override */
    GStylesSidebar.prototype.getId = function () {
        return GStylesSidebar.ID;
    };

    /** @override */
    GStylesSidebar.prototype.getTitle = function () {
        return GStylesSidebar.TITLE;
    };

    /** @override */
    GStylesSidebar.prototype.getIcon = function () {
        return '<span class="g-icon">&#xe794;</span>';
    };

    /** @override */
    GStylesSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        $('<div></div>')
            .css({
                'height': '100%',
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            })
            .gStylePanel({
                //styleSet: gApp.getActiveDocument().getScene().getStyleCollection()
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GStylesSidebar.prototype.toString = function () {
        return "[Object GStylesSidebar]";
    };

    _.GStylesSidebar = GStylesSidebar;
})(this);