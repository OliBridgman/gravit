(function (_) {

    var dragPage = null;

    var canDropPage = function () {
        if (dragPage) {
            var targetPage = $(this).data('page');

            if (targetPage && targetPage !== dragPage) {
                return dragPage.getParent() === targetPage.getParent();
            }
        }

        return false;
    };

    /**
     * The pages & layers sidebar
     * @class GPagesLayersSidebar
     * @extends GSidebar
     * @constructor
     */
    function GPagesLayersSidebar() {
        GSidebar.call(this);
    }

    IFObject.inherit(GPagesLayersSidebar, GSidebar);

    GPagesLayersSidebar.ID = "pages-layers";
    GPagesLayersSidebar.TITLE = new IFLocale.Key(GPagesLayersSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pagesPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageDeleteControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageActiveControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layersPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerDeleteControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerActiveControl = null;

    /** @override */
    GPagesLayersSidebar.prototype.getId = function () {
        return GPagesLayersSidebar.ID;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getTitle = function () {
        return GPagesLayersSidebar.TITLE;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-bars"></span>';
    };

    /** @override */
    GPagesLayersSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        // -- Pages --
        this._pagesPanel = $('<div></div>')
            .addClass('pages');

        this._pageAddControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-plus')
                // TODO : I18N
                .attr('title', 'Add Page')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        this._pageDeleteControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-trash-o')
                // TODO : I18N
                .attr('title', 'Delete Selected Page')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        this._pageActiveControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-thumb-tack')
                .css('margin-left', '7px')
                // TODO : I18N
                .attr('title', 'Show All Pages')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Pages',
                content: this._pagesPanel,
                controls: [
                    this._pageAddControl,
                    this._pageDeleteControl,
                    this._pageActiveControl
                ]
            })
            .appendTo(htmlElement);

        // -- Layers --
        this._layersPanel = $('<div></div>')
            .addClass('layers');

        this._layerAddControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-plus')
                // TODO : I18N
                .attr('title', 'Add Layer')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        this._layerDeleteControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-trash-o')
                // TODO : I18N
                .attr('title', 'Delete Selected Layer')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        this._layerActiveControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-thumb-tack fa-rotate-270')
                .css('margin-left', '7px')
                // TODO : I18N
                .attr('title', 'Lock To Active Layer')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Layers',
                content: this._layersPanel,
                controls: [
                    this._layerAddControl,
                    this._layerDeleteControl,
                    this._layerActiveControl
                ]
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GPagesLayersSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            scene.addEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._clear();
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            scene.removeEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._clear();
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._clear = function () {
        // first clear layers, then pages
        this._clearLayers();
        this._clearPages();
    };

    /** @private */
    GPagesLayersSidebar.prototype._clearPages = function () {
        this._pagesPanel.empty();
        if (this._document) {
            var scene = this._document.getScene();
            for (var child = scene.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFPage) {
                    this._insertPage(child);
                    //if (child.hasFlag())
                }
            }
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._insertPage = function (page) {
        var index = page.getParent().getIndexOfChild(page);

        var block = $('<div></div>')
            .addClass('page-block')
            .data('page', page)
            .attr('draggable', 'true')
            .append($('<div></div>')
                .addClass('page-visibility')
                // TODO : I18N
                .attr('title', 'Toggle Page Visibility')
                .on('click', function (evt) {
                    // TODO : I18N
                    IFEditor.tryRunTransaction(page, function () {
                        page.setProperty('visible', !page.getProperty('visible'));
                    }, 'Toggle Page Visibility');
                })
                .append($('<span></span>')
                    .addClass('fa')))
            .append($('<div></div>')
                .addClass('page-locked')
                // TODO : I18N
                .attr('title', 'Toggle Page Lock')
                .on('click', function (evt) {
                    // TODO : I18N
                    IFEditor.tryRunTransaction(page, function () {
                        page.setProperty('locked', !page.getProperty('locked'));
                    }, 'Toggle Page Lock');
                })
                .append($('<span></span>')
                    .addClass('fa')))
            .append($('<div></div>')
                .addClass('page-name')
                .gAutoEdit({
                })
                .on('submitvalue', function (evt, value) {
                    if (value && value.trim() !== '') {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(page, function () {
                            page.setProperty('name', value);
                        }, 'Rename Page');
                    }
                }))
            .append($('<div></div>')
                .addClass('page-master-slave')
                .append($('<span></span>')
                    .addClass('fa')))
            .on('mousedown', function () {
                // TODO
            })
            .on('click', function () {
                //
            })
            .on('dragstart', function (evt) {
                var event = evt.originalEvent;
                event.stopPropagation();

                dragPage = $(this).data('page');

                // Setup our drag-event now
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', 'dummy_data');
            })
            .on('dragend', function (evt) {
                var event = evt.originalEvent;
                event.stopPropagation();
                dragPage = null;
            })
            .on('dragenter', function (evt) {
                if (canDropPage.call(this)) {
                    $(this).addClass('drop');
                }
            })
            .on('dragleave', function (evt) {
                if (canDropPage.call(this)) {
                    $(this).removeClass('drop');
                }
            })
            .on('dragover', function (evt) {
                var event = evt.originalEvent;
                if (canDropPage.call(this)) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.dataTransfer.dropEffect = 'move';
                }
            })
            .on('drop', function (evt) {
                $(this).removeClass('drop');
                var targetPage = $(this).data('page');
                if (dragPage && dragPage.getParent() === targetPage.getParent()) {
                    var parent = dragPage.getParent();
                    var sourceIndex = parent.getIndexOfChild(dragPage);
                    var targetIndex = parent.getIndexOfChild(targetPage);

                    // TODO : I18N
                    IFEditor.tryRunTransaction(parent, function () {
                        parent.removeChild(dragPage);
                        parent.insertChild(dragPage, sourceIndex < targetIndex ? targetPage.getNext() : targetPage);
                    }, 'Move Page');
                }
            });

        var insertBefore = index >= 0 ? this._pagesPanel.children('.page-block').eq(index) : null;
        if (insertBefore && insertBefore.length > 0) {
            block.insertBefore(insertBefore);
        } else {
            block.appendTo(this._pagesPanel);
        }

        this._updatePage(page);
    };

    /** @private */
    GPagesLayersSidebar.prototype._updatePage = function (page) {
        var pageVisible = page.getProperty('visible');
        var pageLocked = page.getProperty('locked');
        var pageMaster = false;
        var pageSlave = false;

        this._pagesPanel.find('.page-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('page') === page) {
                $element.toggleClass('g-active', page.hasFlag(IFNode.Flag.Active));

                $element.find('.page-visibility > span')
                    .toggleClass('fa-eye', pageVisible)
                    .toggleClass('fa-eye-slash', !pageVisible);

                $element.find('.page-locked > span')
                    .toggleClass('fa-lock', pageLocked)
                    .toggleClass('fa-unlock', !pageLocked);

                $element.find('.page-master-slave > span')
                    .toggleClass('fa-share', pageMaster)
                    .toggleClass('fa-link', pageSlave);

                $element.find('.page-name').text(page.getProperty('name'));
                return false;
            }
        });
    };

    /** @private */
    GPagesLayersSidebar.prototype._removePage = function (page) {
        this._pagesPanel.find('.page-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('page') === page) {
                $element.remove();
                return false;
            }
        });
    };

    /** @private */
    GPagesLayersSidebar.prototype._clearLayers = function () {
        // TODO
    };

    /** @private */
    GPagesLayersSidebar.prototype._insertLayer = function (layerOrItem) {
        // TODO
    };

    /** @private */
    GPagesLayersSidebar.prototype._updateLayer = function (layerOrItem) {
        // TODO
    };

    /** @private */
    GPagesLayersSidebar.prototype._removeLayer = function (layerOrItem) {
        // TODO
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._afterNodeInsert = function (event) {
        if (event.node instanceof IFPage) {
            this._insertPage(event.node);
        } else if (event.node instanceof IFLayer || event.node instanceof IFItem) {
            this._insertLayer(event.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof IFPage) {
            this._removePage(event.node);
        } else if (event.node instanceof IFLayer || event.node instanceof IFItem) {
            this._removeLayer(event.node);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFPage) {
            this._updatePage(event.node);
        } else if (event.node instanceof IFLayer || event.node instanceof IFItem) {
            this._updateLayer(event.node);
        }
    };

    /**
     * @param {IFNode.AfterFlagChangeEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._afterFlagChange = function (event) {
        if (event.node instanceof IFPage && event.flag === IFNode.Flag.Active) {
            this._updatePage(event.node);
        } else if (event.node instanceof IFLayer && event.flag === IFNode.Flag.Active) {
            this._updateLayer(event.node);
        } else if (event.node instanceof IFItem && event.flag === IFNode.Flag.Selected) {
            this._updateLayer(event.node);
        }
    };

    /** @override */
    GPagesLayersSidebar.prototype.toString = function () {
        return "[Object GPagesLayersSidebar]";
    };

    _.GPagesLayersSidebar = GPagesLayersSidebar;
})(this);