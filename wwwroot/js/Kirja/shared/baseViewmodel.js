(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Shared) {

            /**
             * Shared View Model
             * @class
             */
            Shared.BaseViewModel = function()
            {
                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);

                this.pageName = new ko.observable("");
                this.originalPageContent = null;
                this.pageContent = new ko.observable("");

                this.pageModifiedOn = new ko.observable("");

                this.linkDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.linkDialogInsertHtmlCallback = null;

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");
                
                this.lockedByUser = new ko.observable("");
            };

            Shared.BaseViewModel.prototype = {
                /**
                 * Returns true if the link rich text buttons must be generated
                 * @returns {boolean} true if the link rich text buttons must be generated, else false
                 */
                allowLinkRichTextButtons: function() {
                    return true;
                },

                /**
                 * Generates additional rich text buttons
                 * @param {object} allKirjaButtons rich text buttons to extend
                 * @param {object} additionalParams Any additional parameters for generating the buttons
                 */
                generateAdditionalRichTextButtons: function(allKirjaButtons, additionalParams) {
                },

                /**
                 * Generates the rich text buttons
                 * 
                 * @param {object} additionalParams Any additional parameters for generating the buttons
                 * @returns {object} Rich text buttons
                 */
                generateRichTextButtons: function(additionalParams) {
                    var allKirjaButtons = {};
                    if(!this.allowLinkRichTextButtons())
                    {
                        this.generateAdditionalRichTextButtons(allKirjaButtons, additionalParams);
                        return allKirjaButtons;
                    }

                    var self = this;

                    var allKirjaButtons = {};
                    allKirjaButtons.insertTableOfContent = {
                        title: Shared.toolbarButtonInsertTableOfContentTitle,
                        icon: "glyphicon-list-alt",
                        callback: function(htmlInsert) {
                            htmlInsert("<br/><span contenteditable='false'><gn-kirjaTableOfContent></gn-kirjaTableOfContent></span><br/>")
                        }
                    };

                    allKirjaButtons.insertWikiLink = {
                        title: Shared.toolbarButtonInsertKirjaLinkTitle,
                        icon: "glyphicon-book",
                        callback: function(htmlInsert) {
                            self.linkDialogInsertHtmlCallback = htmlInsert;
                            if(self.openCreatePage) {
                                self.linkDialog.openKirjaPageSearch(Shared.toolbarButtonInsertKirjaLinkTitle, function() { self.openCreatePage() }, self.id).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, true);
                                });
                            } else {
                                self.linkDialog.openKirjaPageSearch(Shared.toolbarButtonInsertKirjaLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, true);
                                });
                            }
                        }
                    };

                    if(Shared.hasAikaRights)
                    {
                        allKirjaButtons.insertQuestLink = {
                            title: Shared.toolbarButtonInsertAikaQuestLinkTitle,
                            icon: "glyphicon-king",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openQuestSearch(Shared.toolbarButtonInsertAikaQuestLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(Shared.hasKortistoRights)
                    {
                        allKirjaButtons.insertNpcLink = {
                            title: Shared.toolbarButtonInsertKortistoNpcLinkTitle,
                            icon: "glyphicon-user",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openNpcSearch(Shared.toolbarButtonInsertKortistoNpcLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(Shared.hasStyrRights)
                    {
                        allKirjaButtons.insertItemLink = {
                            title: Shared.toolbarButtonInsertStyrItemLinkTitle,
                            icon: "glyphicon-apple",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openItemSearch(Shared.toolbarButtonInsertStyrItemLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(Shared.hasEvneRights)
                    {
                        allKirjaButtons.insertSkillLink = {
                            title: Shared.toolbarButtonInsertEvneSkillLinkTitle,
                            icon: "glyphicon-flash",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openSkillSearch(Shared.toolbarButtonInsertEvneSkillLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    this.generateAdditionalRichTextButtons(allKirjaButtons, additionalParams);

                    return allKirjaButtons;
                },

                /**
                 * Adds a link from the link dialog
                 * 
                 * @param {object} linkObj Link object
                 * @param {bool} samePage true if the link should open on the same page, else false
                 */
                 addLinkFromLinkDialog: function(linkObj, samePage) {
                    if(samePage)
                    {
                        this.linkDialogInsertHtmlCallback("<a href='" + linkObj.openLink  + "'>" + linkObj.name + "</a>");
                    }
                    else
                    {
                        this.linkDialogInsertHtmlCallback("<a href='" + linkObj.openLink + "' target='_blank'>" + linkObj.name + "</a>");
                    }
                },

                /**
                 * Fixes old links
                 * 
                 * @param {string} pageContent Page content
                 * @returns {string} Paged content with fixed links
                 */
                fixOldLinks: function(pageContent) {
                    if(!pageContent)
                    {
                        return "";
                    }

                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Kirja");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Kortisto/Npc");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Styr/Item");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Evne/Skill");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Aika/Quest");
                
                    return pageContent;
                },

                /**
                 * Fixes old links by the controller url
                 * 
                 * @param {string} pageContent Page content
                 * @param {string} controllerUrl Controller Url to search for
                 * @returns {string} Page content with fixed links
                 */
                fixOldLinksByControllerUrl: function(pageContent, controllerUrl) {
                    var replaceRegex = new RegExp(" href=\"" + controllerUrl + "#id=([0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12})\"", "gi");
                    pageContent = pageContent.replace(replaceRegex, function(match) {
                        return match.replace("#", "?");
                    });
                    return pageContent;
                }
            };

        }(Kirja.Shared = Kirja.Shared || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));