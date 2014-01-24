(function (_) {
    /**
     * The global welcome class
     * @class EXWelcome
     * @constructor
     */
    function EXWelcome(htmlElement) {
        this._htmlElement = htmlElement;
    };

    EXWelcome.BG_COLORS = ['rgb(210,220,80)', 'rgb(159,180,0)', 'rgb(255,255,0)', 'rgb(230,0,99)'];

    /**
     * @type {JQuery}
     * @private
     */
    EXWelcome.prototype._htmlElement = null;

    /**
     * Called from the workspace to initialize
     */
    EXWelcome.prototype.init = function () {
        this._htmlElement.append($('<div></div>')
            .addClass('welcome-screen-container')
            .append($('<div></div>')
                .addClass('welcome-screen')
                .append(this._createBlock(0, 0, 1, 1, 'left', 'rgb(210,220,80)', 'rgb(246,246,164)'))
                .append(this._createBlock(1, 0, 3, 1, null, 'rgb(159,180,0)')
                    .append($('<h2></h2>')
                    .css('color', 'rgb(255,255,0)')
                    .css('font-size', '18pt')
                    .css('margin-bottom', '10px')
                    .text('Welcome to Gravit'))
                    .append($('<button></button>')
                        .text('New Document')
                        .on('click', function () {
                           gApp.executeAction(EXNewAction.ID);
                        }))
                    /** TODO : Open Document
                    .append($('<button></button>')
                        .text('Open Document')
                        .on('click', function () {
                            alert('OPEN DOCUMENT');
                        }))*/)
                .append(this._createBlock(0, 1, 1, 1, null, 'rgb(255,255,0)'))
                .append(this._createBlock(1, 1, 3, 1, null, 'rgb(230,0,99)'))
                .append(this._createBlock(0, 2, 4, 1, 'top', 'rgb(230,0,99)', 'rgb(253,253,169)'))));
    };

    /**
     * Called from the workspace to relayout
     */
    EXWelcome.prototype.relayout = function () {
        var screenContainer = this._htmlElement.find('.welcome-screen-container');
        screenContainer.css('left', ((this._htmlElement.outerWidth() - 160 * 4) / 2).toString() + 'px');
    };

    EXWelcome.prototype._createBlock = function (col, row, cols, rows, arrowType, bgColor, arrowColor) {
        var result = $('<div></div>')
            .addClass('block')
            .css('position', 'absolute')
            .css('left', (col * 160).toString() + 'px')
            .css('top', (row * 160).toString() + 'px')
            .css('width', (cols * 160) + 'px')
            .css('height', (rows * 160) + 'px')
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
    _.EXWelcome = EXWelcome;
})(this);
