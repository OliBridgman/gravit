(function (_) {

    /**
     * Action showing the welcome dialog
     * @class GWelcomeAction
     * @extends GUIAction
     * @constructor
     */
    function GWelcomeAction() {
    };
    IFObject.inherit(GWelcomeAction, GUIAction);

    GWelcomeAction.ID = 'help.welcome';
    GWelcomeAction.TITLE = new IFLocale.Key(GWelcomeAction, "title");

    /**
     * @override
     */
    GWelcomeAction.prototype.getId = function () {
        return GWelcomeAction.ID;
    };

    /**
     * @override
     */
    GWelcomeAction.prototype.getTitle = function () {
        return GWelcomeAction.TITLE;
    };

    /**
     * @override
     */
    GWelcomeAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_HELP;
    };

    /**
     * @override
     */
    GWelcomeAction.prototype.getGroup = function () {
        return "tool";
    };

    /**
     * @override
     */
    GWelcomeAction.prototype.execute = function () {
        var welcome = $('<div></div>')
            .append(this._createBlock(0, 0, 1, 1, 'left', 'rgb(210,220,80)', 'rgb(246,246,164)'))
            .append(this._createBlock(1, 0, 3, 1, null, 'rgb(159,180,0)')
                .append($('<h1></h1>')
                    .css('color', 'rgb(255,255,0)')
                    .css('margin-bottom', '10px')
                    .text('Welcome to Gravit'))
                .append($('<button></button>')
                    .css('background', 'yellow')
                    .text('New Document')
                    .on('click', function () {
                        gApp.executeAction(EXNewAction.ID);
                        welcome.gDialog('close');
                    }))
                /** TODO : Open Document
                 .append($('<button></button>')
                 .text('Open Document')
                 .on('click', function () {
                            alert('OPEN DOCUMENT');
                        }))*/)
            .append(this._createBlock(0, 1, 1, 1, null, 'rgb(255,255,0)'))
            .append(this._createBlock(1, 1, 3, 1, null, 'rgb(230,0,99)'))
            .append(this._createBlock(0, 2, 4, 1, 'top', 'rgb(230,0,99)', 'rgb(253,253,169)'))
            .gDialog({
                padding: false,
                width: 160 * 4,
                height: 160 * 3
            })
            .gDialog('open');
    };

    /** @private */
    GWelcomeAction.prototype._createBlock = function (col, row, cols, rows, arrowType, bgColor, arrowColor) {
        var result = $('<div></div>')
            .addClass('block')
            .css('position', 'absolute')
            .css('left', (col * 160).toString() + 'px')
            .css('top', (row * 160).toString() + 'px')
            .css('width', (cols * 160) + 'px')
            .css('height', (rows * 160) + 'px')
            .css('padding', '10px')
            .css('background-color', bgColor);

        if (arrowType !== null) {
            var shadowColor = 'rgba(0, 0, 0, 0.1)';

            var arrowShadow = $('<div></div>')
                .css('position', 'absolute')
                .css('width', '0px')
                .css('height', '0px')
                .appendTo(result);

            var arrow = $('<div></div>')
                .css('position', 'absolute')
                .css('width', '0px')
                .css('height', '0px')
                .appendTo(result);

            if (arrowType === 'left') {
                arrowShadow
                    .css('top', '0px')
                    .css('left', '0px')
                    .css('border-top', '80px solid transparent')
                    .css('border-bottom', '80px solid transparent')
                    .css('border-left', '120px solid ' + shadowColor);
                arrow
                    .css('top', '0px')
                    .css('left', '0px')
                    .css('border-top', '80px solid transparent')
                    .css('border-bottom', '80px solid transparent')
                    .css('border-left', '80px solid ' + arrowColor);
            } else if (arrowType === 'top') {
                arrowShadow
                    .css('top', '0px')
                    .css('left', '0px')
                    .css('border-left', '80px solid transparent')
                    .css('border-right', '80px solid transparent')
                    .css('border-top', '120px solid ' + shadowColor);
                arrow
                    .css('top', '0px')
                    .css('left', '0px')
                    .css('border-left', '80px solid transparent')
                    .css('border-right', '80px solid transparent')
                    .css('border-top', '80px solid ' + arrowColor);
            }
        }

        return result;
    };

    /** @override */
    GWelcomeAction.prototype.toString = function () {
        return "[Object GWelcomeAction]";
    };

    _.GWelcomeAction = GWelcomeAction;
})(this);