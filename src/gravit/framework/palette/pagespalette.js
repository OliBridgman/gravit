(function (_) {

    var dragPage = null;

    function canDropPage(target) {
        if (dragPage) {
            var targetPage = $(target).data('page');

            if (targetPage && (targetPage !== dragPage || ifPlatform.modifiers.shiftKey)) {
                return dragPage.getParent() === targetPage.getParent();
            }
        }

        return false;
    };

    /**
     * Pages Palette
     * @class GPagesPalette
     * @extends GPalette
     * @constructor
     */
    function GPagesPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GPagesPalette, GPalette);

    GPagesPalette.ID = "pages";
    GPagesPalette.TITLE = new IFLocale.Key(GPagesPalette, "title");

    /**
     * @type {GDocument}
     * @private
     */
    GPagesPalette.prototype._document = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesPalette.prototype._pagesPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesPalette.prototype._pageAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesPalette.prototype._pageDeleteControl = null;

    /** @override */
    GPagesPalette.prototype.getId = function () {
        return GPagesPalette.ID;
    };

    /** @override */
    GPagesPalette.prototype.getTitle = function () {
        return GPagesPalette.TITLE;
    };

    /** @override */
    GPagesPalette.prototype.getGroup = function () {
        return "structure";
    };

    /** @override */
    GPagesPalette.prototype.isEnabled = function () {
        return this._document !== null;
    };

    /** @override */
    GPagesPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._pagesPanel = $('<div></div>')
            .addClass('g-grid pages')
            .appendTo(htmlElement);

        this._pageAddControl =
            $('<button></button>')
                // TODO : I18N
                .attr('title', 'Add Page')
                .on('click', function () {
                    gApp.executeAction(GAddPageAction.ID);
                }.bind(this))
                .append($('<span></span>')
                    .addClass('fa fa-plus'))
                .appendTo(controls);

        this._pageDeleteControl =
            $('<button></button>')
                // TODO : I18N
                .attr('title', 'Delete Page')
                .on('click', function () {
                    gApp.executeAction(GDeletePageAction.ID);
                }.bind(this))
                .append($('<span></span>')
                    .addClass('fa fa-trash-o'))
                .appendTo(controls);
    };

    /** @override */
    GPagesPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            scene.addEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            scene.addEventListener(IFScene.ReferenceEvent, this._referenceEvent, this);
            this._clear();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            scene.removeEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            scene.removeEventListener(IFScene.ReferenceEvent, this._referenceEvent, this);
            this._clear();
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /** @private */
    GPagesPalette.prototype._clear = function () {
        this._pagesPanel.empty();
        if (this._document) {
            var scene = this._document.getScene();
            for (var child = scene.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFPage) {
                    this._insertPage(child);
                }
            }
        }
    };

    /** @private */
    GPagesPalette.prototype._insertPage = function (page) {
        var insertBefore = null;
        if (page.getNext()) {
            this._pagesPanel.find('.page-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('page') === page.getNext()) {
                    insertBefore = $element;
                    return false;
                }
            });
        }

        var block = $('<div></div>')
            .addClass('page-block')
            .data('page', page)
            .attr('draggable', 'true')
            .append($('<div></div>')
                .addClass('page-visibility grid-icon')
                // TODO : I18N
                .attr('title', 'Toggle Page Visibility')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    // TODO : I18N
                    IFEditor.tryRunTransaction(page, function () {
                        page.setProperty('visible', !page.getProperty('visible'));
                    }, 'Toggle Page Visibility');
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .append($('<div></div>')
                .addClass('page-lock grid-icon')
                // TODO : I18N
                .attr('title', 'Toggle Page Lock')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    // TODO : I18N
                    IFEditor.tryRunTransaction(page, function () {
                        page.setProperty('locked', !page.getProperty('locked'));
                    }, 'Toggle Page Lock');
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .append($('<div></div>')
                .addClass('page-name grid-main')
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
                .addClass('page-master')
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .on('mousedown', function () {
                // TODO
            })
            .on('click', function () {
                page.getScene().setActivePage(page);
            })
            .on('dragstart', function (evt) {
                var $this = $(this);

                var event = evt.originalEvent;
                event.stopPropagation();

                dragPage = $this.data('page');

                // Setup our drag-event now
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', 'dummy_data');

                // Add drag overlays
                $this.closest('.pages').find('.page-block').each(function (index, element) {
                    $(element)
                        .append($('<div></div>')
                            .addClass('grid-drag-overlay')
                            .on('dragenter', function (evt) {
                                if (canDropPage(this.parentNode)) {
                                    $(this).parent().addClass('g-drop');
                                }
                            })
                            .on('dragleave', function (evt) {
                                if (canDropPage(this.parentNode)) {
                                    $(this).parent().removeClass('g-drop');
                                }
                            })
                            .on('dragover', function (evt) {
                                var event = evt.originalEvent;
                                if (canDropPage(this.parentNode)) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    event.dataTransfer.dropEffect = 'move';
                                }
                            })
                            .on('drop', function (evt) {
                                var $this = $(this);
                                var $parent = $(this.parentNode);

                                $parent.removeClass('g-drop');

                                // Remove drag overlays
                                $parent.closest('.pages').find('.grid-drag-overlay').remove();

                                var targetPage = $parent.data('page');
                                if (dragPage && dragPage.getParent() === targetPage.getParent()) {
                                    var parent = dragPage.getParent();
                                    var sourceIndex = parent.getIndexOfChild(dragPage);
                                    var targetIndex = parent.getIndexOfChild(targetPage);

                                    // TODO : I18N
                                    IFEditor.tryRunTransaction(parent, function () {
                                        if (ifPlatform.modifiers.shiftKey) {
                                            // Clone page
                                            var insertPos = dragPage.getScene().getPageInsertPosition();
                                            var pageClone = dragPage.clone();
                                            pageClone.setProperties(['x', 'y', 'name'], [insertPos.getX(), insertPos.getY(), pageClone.getProperty('name') + '-copy']);
                                            parent.insertChild(pageClone, sourceIndex < targetIndex ? targetPage.getNext() : targetPage);
                                        } else {
                                            // Move page
                                            parent.removeChild(dragPage);
                                            parent.insertChild(dragPage, sourceIndex < targetIndex ? targetPage.getNext() : targetPage);
                                        }
                                    }, ifPlatform.modifiers.shiftKey ? 'Duplicate Page' : 'Move Page');
                                }
                            }));
                });
            })
            .on('dragend', function (evt) {
                var $this = $(this);

                var event = evt.originalEvent;
                event.stopPropagation();

                // Remove drag overlays
                $this.closest('.pages').find('.grid-drag-overlay').remove();

                dragPage = null;
            });

        if (insertBefore && insertBefore.length > 0) {
            block.insertBefore(insertBefore);
        } else {
            block.appendTo(this._pagesPanel);
        }

        this._updatePage(page);
    };

    /** @private */
    GPagesPalette.prototype._updatePage = function (page) {
        var pageVisible = page.getProperty('visible');
        var pageLocked = page.getProperty('locked');

        this._pagesPanel.find('.page-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('page') === page) {
                $element.toggleClass('g-active', page.hasFlag(IFNode.Flag.Active));
                $element.toggleClass('g-selected', page.hasFlag(IFNode.Flag.Selected));

                $element.find('.page-visibility')
                    .toggleClass('grid-icon-default', pageVisible)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-eye', pageVisible)
                    .toggleClass('fa-eye-slash', !pageVisible);

                $element.find('.page-lock')
                    .toggleClass('grid-icon-default', !pageLocked)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-lock', pageLocked)
                    .toggleClass('fa-unlock', !pageLocked);

                $element.find('.page-name').text(page.getProperty('name'));

                var linkCount = page.getScene().linkCount(page);
                var master = page.getMasterPage();
                var masterTitle = '';

                if (linkCount) {
                    // TODO : I18N
                    masterTitle = 'Master of ' + linkCount.toString() + ' pages:';
                    page.getScene().visitLinks(page, function (pageSource) {
                        masterTitle += '\n' + pageSource.getLabel();
                    })
                }
                if (master) {
                    if (masterTitle !== '') {
                        masterTitle += '\n\n';
                    }
                    masterTitle += 'Slave of ' + master.getLabel();
                }

                $element.find('.page-master')
                    .css('display', !!master || linkCount > 0 ? '' : 'none')
                    /*!!*/
                    .find('> span')
                    .attr('title', masterTitle)
                    .toggleClass('fa-link', !!master && linkCount === 0)
                    .toggleClass('fa-crosshairs', linkCount > 0);
                return false;
            }
        });
    };

    /** @private */
    GPagesPalette.prototype._removePage = function (page) {
        this._pagesPanel.find('.page-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('page') === page) {
                $element.remove();
                return false;
            }
        });
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GPagesPalette.prototype._afterNodeInsert = function (event) {
        if (event.node instanceof IFPage) {
            this._insertPage(event.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} event
     * @private
     */
    GPagesPalette.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof IFPage) {
            this._removePage(event.node);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GPagesPalette.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFPage) {
            this._updatePage(event.node);
        }
    };

    /**
     * @param {IFNode.AfterFlagChangeEvent} event
     * @private
     */
    GPagesPalette.prototype._afterFlagChange = function (event) {
        if (event.node instanceof IFPage && (event.flag === IFNode.Flag.Active || event.flag === IFNode.Flag.Selected)) {
            this._pagesPanel.find('.page-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('page') === event.node) {
                    $element.toggleClass(event.flag === IFNode.Flag.Active ? 'g-active' : 'g-selected', event.set);
                }
            });
        }
    };

    /**
     * @param {IFScene.ReferenceEvent} event
     * @private
     */
    GPagesPalette.prototype._referenceEvent = function (event) {
        if (event.reference instanceof IFPage) {
            this._updatePage(event.reference);
        }
    };

    /** @override */
    GPagesPalette.prototype.toString = function () {
        return "[Object GPagesPalette]";
    };

    _.GPagesPalette = GPagesPalette;
})(this);