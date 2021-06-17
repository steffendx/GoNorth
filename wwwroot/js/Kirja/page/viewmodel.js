(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Page) {

            /// Version Dialog Page Size
            var versionDialogPageSize = 25;

            /// Review Dialog Page Size
            var reviewDialogPageSize = 25;

            /// Scroll Offset
            var headerScrollOffset = 45;

            /// Mouse Button left
            var mouseButtonLeft = 1;

            /// Kirja Id Url Prefix
            var kirjaIdUrlPrefx = "/Kirja?id=";

            /**
             * Page View Model
             * @class
             */
            Page.ViewModel = function()
            {
                Kirja.Shared.BaseViewModel.apply(this);

                this.isEditMode = new ko.observable(false);

                this.blockPageReload = false;
                var self = this;
                this.pageWordCount = new ko.observable(0);
                this.pageContent.subscribe(GoNorth.Util.debounce(function(newVal) {
                    self.pageWordCount(GoNorth.Util.getHtmlWordCount(newVal));
                }, 600));

                this.displayVersionId = new ko.observable(null);
                this.displayVersionName = new ko.observable(null);
                this.displayVersionHtml = new ko.observable(null);
                this.displayVersionNumber = new ko.observable(null);

                this.compareVersionId = new ko.observable(null);
                this.compareVersionName = new ko.observable(null);
                this.compareVersionHtml = new ko.observable(null);
                this.compareVersionNumber = new ko.observable(null);

                this.pageContentTransformed = new ko.computed(function() {
                    var pageContent = null;
                    if(this.displayVersionHtml())
                    {
                        pageContent = this.displayVersionHtml();
                    }
                    else
                    {
                        pageContent = this.pageContent();
                    }

                    if(this.isEditMode())
                    {
                        return pageContent;
                    }

                    var comparePageContent = this.compareVersionHtml();
                    pageContent = this.transformPageContent(pageContent);
                    if(comparePageContent)
                    {
                        comparePageContent = this.transformPageContent(comparePageContent);
                        return htmldiff(comparePageContent, pageContent);
                    }

                    return pageContent;
                }, this);
                this.currentPageName = new ko.computed(function() {
                    var displayVersionName = this.displayVersionName();
                    var pageName = this.pageName();

                    if(displayVersionName)
                    {
                        return displayVersionName;
                    }

                    return pageName;
                }, this);

                this.isDefault = new ko.observable(false);

                this.showConfirmDirtyExitEdit = new ko.observable(false);
                this.confirmDirtyExitPromise = null;

                this.showConfirmDeleteDialog = new ko.observable(false);

                this.showVersionDialog = new ko.observable(false);
                this.showVersionDialog.subscribe(function() {
                    self.syncUrlParamters();
                });
                this.versionDialogErrorOccured = new ko.observable(false);
                this.loadingVersions = new ko.observable(false);
                this.currentVersionPage = new ko.observable(0);
                this.hasMoreVersions = new ko.observable(false);
                this.versionDialogMostRecentVersion = new ko.observable(0);
                this.versions = new ko.observableArray();

                this.showReviewDialog = new ko.observable(false);
                this.loadingReviews = new ko.observable(false);
                this.reviewDialogErrorOccured = new ko.observable(false);
                this.currentReviewPage = new ko.observable(0);
                this.hasMoreReviews = new ko.observable(false);
                this.reviews = new ko.observableArray();
                this.reviewsWaitingForMergeCount = new ko.observable(0);

                this.showConfirmRestoreDialog = new ko.observable(false);
                this.confirmRestoreDialogLoading = new ko.observable(false);
                this.confirmRestoreDialogErrorOccured = new ko.observable(false);
                this.confirmRestoreBrokenLinks = new ko.observableArray();

                this.showNewWaitPageDialog = new ko.observable(false);

                this.showSidebar = new ko.observable(false);

                this.mentionedInPages = new ko.observableArray();
                this.loadingMentionedInPages = new ko.observable(false);
                this.loadingMentionedInPagesError = new ko.observable(false);

                this.mentionedQuests = new ko.observableArray();
                this.loadingMentionedQuests = new ko.observable(false);
                this.loadingMentionedQuestsError = new ko.observable(false);

                this.referencedInQuests = new ko.observableArray();
                this.loadingReferencedInQuests = new ko.observable(false);
                this.loadingReferencedInQuestsError = new ko.observable(false);

                this.mentionedNpcs = new ko.observableArray();
                this.loadingMentionedNpcs = new ko.observable(false);
                this.loadingMentionedNpcsError = new ko.observable(false);

                this.referencedInDailyRoutines = new ko.observableArray();
                this.loadingReferencedInDailyRoutines = new ko.observable(false);
                this.loadingReferencedInDailyRoutinesError = new ko.observable(false);

                this.referencedInStateMachines = new ko.observableArray();
                this.loadingReferencedInStateMachines = new ko.observable(false);
                this.loadingReferencedInStateMachinesError = new ko.observable(false);

                this.referencedInDialogs = new ko.observableArray();
                this.loadingReferencedInDialogs = new ko.observable(false);
                this.loadingReferencedInDialogsError = new ko.observable(false);

                this.mentionedItems = new ko.observableArray();
                this.loadingMentionedItems = new ko.observable(false);
                this.loadingMentionedItemsError = new ko.observable(false);

                this.mentionedSkills = new ko.observableArray();
                this.loadingMentionedSkills = new ko.observable(false);
                this.loadingMentionedSkillsError = new ko.observable(false);

                this.referencedInSkills = new ko.observableArray();
                this.loadingReferencedSkills = new ko.observable(false);
                this.loadingReferencedSkillsError = new ko.observable(false);

                this.markedInMaps = new ko.observableArray();
                this.loadingMarkedInMaps = new ko.observable(false);
                this.loadingMarkedInMapsError = new ko.observable(false);

                this.referencedInExportSnippets = new ko.observableArray();
                this.loadingReferencedInExportSnippets = new ko.observable(false);
                this.loadingReferencedInExportSnippetsError = new ko.observable(false);

                this.pageNotFound = new ko.observable(false);

                this.attachmentFiles = new ko.observableArray();
                this.showConfirmDeleteAttachmentDialog = new ko.observable(false);
                this.attachmentToDelete = null;

                var isNewPage = GoNorth.Util.getParameterFromUrl("newPage") == "1";
                if(this.id() || !isNewPage)
                {
                    this.loadPage();
                }
                else if(isNewPage)
                {
                    this.isEditMode(true);
                    setTimeout(function() {
                        jQuery("#gn-kirjaPageName").focus();
                    }, 1);
                }

                var isVersionDialogOpen = GoNorth.Util.getParameterFromUrl("versionDialog") == "1";
                var initialVersionPage = parseInt(GoNorth.Util.getParameterFromUrl("versionPage"));
                var compareVersionId = GoNorth.Util.getParameterFromUrl("compareVersionId");
                var displayVersionId = GoNorth.Util.getParameterFromUrl("displayVersionId");
                if(isVersionDialogOpen && !isNaN(initialVersionPage))
                {
                    this.openVersionDialogWithPage(initialVersionPage);
                }

                if(compareVersionId)
                {
                    this.compareVersion(compareVersionId);
                }

                if(displayVersionId)
                {
                    this.showVersion(displayVersionId);
                }

                if(compareVersionId === "" && displayVersionId === "")
                {
                    this.syncUrlParamters();
                }

                this.attachmentUploadUrl = new ko.computed(function() {
                    return "/api/KirjaApi/UploadPageAttachment?id=" + this.id();
                }, this);
                
                GoNorth.Util.setupValidation("#gn-kirjaHeaderFields");

                GoNorth.Util.onUrlParameterChanged(function() {
                    if(!self.blockPageReload) {
                        self.switchPage(GoNorth.Util.getParameterFromUrl("id"));
                    }
                    self.blockPageReload = false;
                });

                // Access function for scrolling in the table of content
                Page.scrollToHeader = function(id) {
                    jQuery('html, body').animate({
                        scrollTop: Math.max(0, jQuery(".gn-header_" + id).offset().top - headerScrollOffset)
                    }, 250);
                }

                this.dirtyChecker = new GoNorth.SaveUtil.DirtyChecker(function() {
                    return self.buildSaveRequestObject();
                }, GoNorth.Kirja.Page.dirtyMessage, GoNorth.Kirja.Page.disableAutoSaving, function() {
                    self.sendSaveRequest(true);
                });

                GoNorth.SaveUtil.setupSaveHotkey(function() {
                    self.save();
                });
            };

            Page.ViewModel.prototype = jQuery.extend({ }, Kirja.Shared.BaseViewModel.prototype, {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                    this.pageNotFound(false);
                },

                /**
                 * Syncs the url parameters with the valid values
                 */
                syncUrlParamters: function() {
                    var targetUrl = "id=" + this.id();
                    if(this.compareVersionId())
                    {
                        targetUrl += "&compareVersionId=" + this.compareVersionId();
                    }

                    if(this.displayVersionId())
                    {
                        targetUrl += "&displayVersionId=" + this.displayVersionId();
                    }
                    
                    if(this.showVersionDialog())
                    {
                        targetUrl += "&versionDialog=1&versionPage=" + this.currentVersionPage();
                    }

                    this.blockPageReload = true;
                    GoNorth.Util.replaceUrlParameters(targetUrl);
                    this.blockPageReload = false;
                },

                /**
                 * Switches the page to a different page
                 * 
                 * @param {string} id Id of the page to switch to
                 * @param {object} e Event
                 */
                switchPage: function(id) {
                    this.isEditMode(false);
                    this.id(id);
                    this.resetErrorState();
                    this.showSidebar(false);
                    this.showVersionDialog(false);
                    this.displayVersionId(null);
                    this.displayVersionName(null);
                    this.displayVersionHtml(null);
                    this.displayVersionNumber(null);
                    this.compareVersionId(null);
                    this.compareVersionName(null);
                    this.compareVersionHtml(null);
                    this.compareVersionNumber(null);
                    this.syncUrlParamters();
                    this.loadPage();
                },

                /**
                 * Loads a page
                 */
                loadPage: function() {
                    var url = "/api/KirjaApi/Page";
                    if(this.id())
                    {
                        url += "?id=" + this.id();
                    }

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.get(url).done(function(data) {
                        self.isLoading(false);
                        if(!data)
                        {
                            self.errorOccured(true);
                            self.pageNotFound(true);
                            return;
                        }

                        self.pageName(data.name);
                        self.pageContent(self.fixOldLinks(data.content));
                        self.originalPageContent = self.pageContent();
                        self.pageModifiedOn(data.modifiedOn);
                        self.isDefault(data.isDefault);
                        if(!self.id())
                        {
                            self.setId(data.id);
                        }

                        self.loadMentionedInPages();
                        self.loadMentionedQuests(data.mentionedQuests);
                        self.loadMentionedNpcs(data.mentionedNpcs);
                        self.loadMentionedItems(data.mentionedItems);
                        self.loadMentionedSkills(data.mentionedSkills);
                        self.loadReferencedInDailyRoutines();
                        self.loadReferencedInStateMachines();
                        self.loadReferencedInQuests();
                        self.loadReferencedInSkills();
                        self.loadReferencedInDialogs();
                        self.loadMarkedInMaps();
                        self.loadReferencedInExportSnippets();
                        self.loadReviewsWaitingForMerge();

                        self.attachmentFiles(data.attachments ? data.attachments : []);

                        self.dirtyChecker.saveCurrentSnapshot();
                        self.checkLock();
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Pushes the new kirja page state if a kirja page link is clicked
                 * 
                 * @param {string} href Href to the new page
                 * @param {event} event Click event
                 */
                pushKirjaPageState: function(href, event) {
                    if(event.which != mouseButtonLeft) 
                    {
                        return;
                    }

                    if(!href || !href.toLowerCase().indexOf("/kirja") == 0)
                    {
                        return;
                    }

                    href = href.toLowerCase().replace("/kirja?", "")
                    GoNorth.Util.setUrlParameters(href);
                    event.preventDefault();
                    return false;
                },

                /**
                 * Transforms the page content, adding table of contents etc.
                 * 
                 * @param {string} pageContent Page content
                 * @returns {string} Transformed page content
                 */
                transformPageContent: function(pageContent) {
                    var jQueryContent = jQuery("<div>" + pageContent + "</div>");

                    var headers = this.transformHeaders(jQueryContent);
                    var self = this;
                    jQueryContent.find("gn-kirjaTableOfContent").each(function() {
                        jQuery(this).replaceWith(self.buildTableOfContent(headers))
                    });

                    return jQueryContent.html();
                },

                /**
                 * Transform headers
                 * 
                 * @param {object} jQueryContent jQuery Content
                 * @returns {object[]} Headers
                 */
                transformHeaders: function(jQueryContent) {
                    var headers = [];
                    var currentMainHeader = null;

                    var curHeader = 0;
                    jQueryContent.find("h4,h5").each(function() {
                        var headerContent = this.outerHTML;
                        headerContent = "<span class='gn-header_" + curHeader + "'>" + headerContent + "</span>";

                        var headerName = jQuery(this).text();
                        if(jQuery(this).prop("tagName").toLowerCase() == "h4")
                        {
                            currentMainHeader = {
                                name: headerName,
                                id: curHeader,
                                subHeaders: []
                            }
                            headers.push(currentMainHeader);
                        }
                        else
                        {
                            var header = {
                                name: headerName,
                                id: curHeader
                            }

                            if(currentMainHeader)
                            {
                                currentMainHeader.subHeaders.push(header);
                            }
                            else
                            {
                                headers.push(header);
                            }
                        }

                        jQuery(this).replaceWith(headerContent);
                        ++curHeader;
                    });

                    return headers;
                },

                /**
                 * Builds the table of content
                 * 
                 * @param {object[]} headers Headers 
                 * @returns {string} Table of content html
                 */
                buildTableOfContent: function(headers) {
                    var tableOfContentHtml = "<div class='gn-kirjaTableOfContentTransformed'>";
                    tableOfContentHtml += "<div class='gn-kirjaTableOfContentTransformedHeader'>" + GoNorth.Kirja.Page.tableOfContent + "</div>";
                    tableOfContentHtml += this.buildTableOfContentForHeaders(headers);
                    tableOfContentHtml += "</div>";

                    return tableOfContentHtml;
                },

                /**
                 * Returns the table of content for headers
                 * 
                 * @param {objec[]} headers Header to build
                 * @returns {string} Html for the table of content
                 */
                buildTableOfContentForHeaders: function(headers)
                {
                    var tableOfContentHtml = "<ul>";
                    for(var curHeader = 0; curHeader < headers.length; ++curHeader)
                    {
                        tableOfContentHtml += "<li><a class='gn-clickable' onclick='GoNorth.Kirja.Page.scrollToHeader(" + headers[curHeader].id + ")'>" + headers[curHeader].name + "<a>";
                        if(headers[curHeader].subHeaders && headers[curHeader].subHeaders.length > 0)
                        {
                            tableOfContentHtml += this.buildTableOfContentForHeaders(headers[curHeader].subHeaders);
                        }
                    }
                    tableOfContentHtml += "</ul>";

                    return tableOfContentHtml;
                },

                /**
                 * Switches to edit mode
                 */
                enterEditMode: function() {
                    this.showSidebar(false);
                    this.isEditMode(true);
                    this.displayVersionId(null);
                    this.displayVersionName(null);
                    this.displayVersionHtml(null);
                    this.displayVersionNumber(null);
                    this.compareVersionId(null);
                    this.compareVersionName(null);
                    this.compareVersionHtml(null);
                    this.compareVersionNumber(null);
                    this.syncUrlParamters();
                    this.acquireLock();
                },

                /**
                 * Exits the edit mode
                 */
                exitEditMode: function() {
                    var confirmDirtyExitPromise = new jQuery.Deferred();
                    this.confirmDirtyExitPromise = confirmDirtyExitPromise;

                    if(this.dirtyChecker.isDirty())
                    {
                        this.showConfirmDirtyExitEdit(true);
                    }
                    else
                    {
                        this.exitEditModeWithoutDirtyCheck()
                    }

                    return confirmDirtyExitPromise.promise();
                },

                /**
                 * Discards the changes that are not saved yet
                 */
                discardChanges: function() {
                    this.pageContent(this.originalPageContent);
                    this.exitEditModeWithoutDirtyCheck();
                },

                /**
                 * Exits the edit mode without dirty check
                 */
                exitEditModeWithoutDirtyCheck: function() {
                    this.isEditMode(false);
                    this.showConfirmDirtyExitEdit(false);
                    GoNorth.LockService.releaseCurrentLock();

                    if(this.confirmDirtyExitPromise)
                    {
                        this.confirmDirtyExitPromise.resolve();
                        this.confirmDirtyExitPromise = null;
                    }
                },

                /**
                 * Closes the confirm dirty exit edit dialog
                 */
                closeConfirmDirtyExitEdit: function() {
                    if(this.confirmDirtyExitPromise)
                    {
                        this.confirmDirtyExitPromise.reject();
                        this.confirmDirtyExitPromise = null;
                    }
                    this.showConfirmDirtyExitEdit(false);
                },


                /**
                 * Callback if a new image file was uploaded
                 * 
                 * @param {string} image Image Filename that was uploaded
                 * @returns {string} Url of the new image
                 */
                imageUploaded: function(image) {
                    return "/api/KirjaApi/KirjaImage?imageFile=" + encodeURIComponent(image);
                },

                /**
                 * Callback if a new attachment file was uploaded
                 * 
                 * @param {string} image Filename that was uploaded
                 */
                attachmentUploaded: function(file) {
                    this.attachmentFiles.push(file);
                    this.attachmentFiles.sort(function(a1, a2) {
                        return a1.originalFilename.localeCompare(a2.originalFilename);
                    });
                },

                /**
                 * Builds the url for an attachment
                 * 
                 * @param {object} attachment Attachment to build the url for
                 * @returns {string} Attachment Url
                 */
                buildAttachmentUrl: function(attachment) {
                    return "/api/KirjaApi/KirjaAttachment?pageId=" + this.id() + "&attachmentFile=" + encodeURIComponent(attachment.filename);
                },

                /**
                 * Callback if an image upload is started
                 */
                uploadStart: function() {
                    this.isLoading(true);
                    this.resetErrorState();
                },

                /**
                 * Callback if an error occured during upload
                 * 
                 * @param {string} errorMessage Error Message
                 * @param {object} xhr Xhr Object
                 */
                uploadError: function(errorMessage, xhr) {
                    this.errorOccured(true);
                    if(xhr && xhr.responseText)
                    {
                        this.additionalErrorDetails(xhr.responseText);
                    }
                    else
                    {
                        this.additionalErrorDetails(errorMessage);
                    }
                },


                /**
                 * Opens the delete confirm dialog for an attachment
                 * 
                 * @param {object} attachment Attachment to delete
                 */
                openDeleteAttachmentDialog: function(attachment) {
                    this.showConfirmDeleteAttachmentDialog(true);
                    this.attachmentToDelete = attachment;
                },

                /**
                 * Deletes the attachment for which the confirm dialog is open
                 */
                deleteAttachment: function() {
                    var attachment = this.attachmentToDelete;

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.delete("/api/KirjaApi/DeleteAttachment?pageId=" + this.id() + "&attachmentFile=" + encodeURIComponent(attachment.filename)).done(function(savedPage) {
                        self.attachmentFiles.remove(attachment);
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.closeConfirmAttachmentDeleteDialog();
                },

                /**
                 * Closes the delete confirm dialog
                 */
                closeConfirmAttachmentDeleteDialog: function() {
                    this.showConfirmDeleteAttachmentDialog(false);
                    this.attachmentToDelete = null;
                },


                /**
                 * Builds the save request object
                 * @returns {object} Save Request object
                 */
                buildSaveRequestObject: function() {
                    return {
                        name: this.pageName(),
                        content: this.pageContent()
                    };
                },

                /**
                 * Saves the page
                 */
                save: function() {
                    this.sendSaveRequest(false);
                },

                /**
                 * Saves the page
                 * @param {boolean} isAutoSave true if the save is an auto save
                 */
                 sendSaveRequest: function(isAutoSave) {
                    if(!GoNorth.Util.validateForm("#gn-kirjaHeaderFields", !isAutoSave))
                    {
                        return;
                    }

                    // Send Data
                    var url = "/api/KirjaApi/CreatePage";
                    if(this.id())
                    {
                        url = "/api/KirjaApi/UpdatePage?id=" + this.id();
                    }

                    var request = this.buildSaveRequestObject();

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.post(url, request).done(function(savedPage) {
                        if(!self.id())
                        {
                            self.setId(savedPage.id);
                            self.acquireLock();

                            if(window.newKirjaPageSaved) {
                                window.newKirjaPageSaved(savedPage.id, self.pageName());
                                window.newKirjaPageSaved = null;
                            }
                        }
                        self.loadMentionedQuests(savedPage.mentionedQuests);
                        self.loadMentionedNpcs(savedPage.mentionedNpcs);
                        self.loadMentionedItems(savedPage.mentionedItems);
                        self.loadMentionedSkills(savedPage.mentionedSkills);
                        self.loadReferencedInDailyRoutines();
                        self.loadReferencedInStateMachines();
                        self.loadReferencedInQuests();
                        self.loadReferencedInSkills();
                        self.loadReferencedInDialogs();
                        self.loadReferencedInExportSnippets();
                        self.pageModifiedOn(savedPage.modifiedOn);
                        self.callPageRefreshGrid();
                        self.dirtyChecker.saveCurrentSnapshot();
                        self.isLoading(false);
                        self.originalPageContent = self.pageContent();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Opens the version dialog
                 */
                openVersionDialog: function() {
                    this.openVersionDialogWithPage(0);
                },

                /**
                 * Opens the version dialog with an initial page
                 * @param {number} initialPage Initial page
                 */
                openVersionDialogWithPage: function(initialPage) {
                    if(!this.id())
                    {
                        return;
                    }

                    this.showSidebar(false);
                    this.showVersionDialog(true);
                    this.versions.removeAll();
                    this.currentVersionPage(initialPage);
                    this.hasMoreVersions(false);
                    this.loadVersionPage();
                },

                /**
                 * Previous version page
                 */
                prevVersionPage: function() {
                    if(this.currentVersionPage() == 0)
                    {
                        return;
                    }                 

                    this.currentVersionPage(this.currentVersionPage() - 1);
                    this.loadVersionPage();
                },
                
                /**
                 * Next version page
                 */
                nextVersionPage: function() {
                    if(!this.hasMoreVersions())
                    {
                        return;
                    }                 

                    this.currentVersionPage(this.currentVersionPage() + 1);
                    this.loadVersionPage();
                },

                /**
                 * Loads the version page
                 */
                loadVersionPage: function() {
                    this.syncUrlParamters();

                    var startPageIndex = this.currentVersionPage() * versionDialogPageSize;
                    var pageSizeToLoad = versionDialogPageSize;
                    if(this.currentVersionPage() == 0)
                    {
                        pageSizeToLoad = versionDialogPageSize - 1;
                    }
                    else
                    {
                        startPageIndex = startPageIndex - 1;
                    }

                    if(pageSizeToLoad == 0)
                    {
                        this.hasMoreVersions(true);
                        this.versions.removeAll();
                        return;
                    }

                    this.loadingVersions(true);
                    this.versionDialogErrorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KirjaApi/GetPageVersions?pageId=" + this.id() + "&start=" + startPageIndex + "&pageSize=" + pageSizeToLoad).done(function(data) {
                        self.loadingVersions(false);
                        self.hasMoreVersions(data.hasMore);
                        self.versionDialogMostRecentVersion(data.mostRecentVersion);
                        self.versions(data.versions);
                    }).fail(function() {
                        self.loadingVersions(false);
                        self.versions.removeAll();
                        self.versionDialogErrorOccured(true);
                    });
                },

                /**
                 * Closes the version dialog
                 */
                closeVersionDialog: function() {
                    this.showVersionDialog(false);
                },

                /**
                 * Compares the currently loaded version with another version
                 * 
                 * @param {object} version Version object to compare with
                 */
                compareWithVersionObject: function(version) {
                    if(this.isEditMode())
                    {
                        var self = this;
                        this.exitEditMode().done(function() {
                            self.closeVersionDialog();
                            self.compareVersion(version.id);
                        });
                    }
                    else
                    {
                        this.closeVersionDialog();
                        this.compareVersion(version.id);
                    }
                },

                /**
                 * Compares the currently loaded version with another version
                 * 
                 * @param {string} versionId Id of the version to compare with
                 */
                compareVersion: function(versionId) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPageVersion(versionId).done(function(loadedVersion) {
                        self.isLoading(false);
                        var version = loadedVersion.version;
                        if(version && version.id != self.displayVersionId())
                        {
                            self.compareVersionId(version.id);
                            self.compareVersionName(version.name);
                            self.compareVersionHtml(version.content);
                            self.compareVersionNumber(version.versionNumber);

                            self.syncUrlParamters();
                        }
                        else
                        {
                            self.exitCompareMode();
                        }

                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Exits the compare mode
                 */
                exitCompareMode: function() {
                    this.compareVersionId(null);
                    this.compareVersionName(null);
                    this.compareVersionHtml(null);
                    this.compareVersionNumber(null);

                    this.syncUrlParamters();
                },

                /**
                 * Shows a version from an version object
                 * 
                 * @param {object} version Version object
                 */
                showVersionWithObject: function(version) {
                    if(this.isEditMode())
                    {
                        var self = this;
                        this.exitEditMode().done(function() {
                            self.closeVersionDialog();
                            self.exitCompareMode(); 
                            self.showVersion(version.id);
                        });
                    }
                    else
                    {
                        this.closeVersionDialog();
                        this.exitCompareMode(); 
                        this.showVersion(version.id);
                    }
                },

                /**
                 * Shows a version
                 * 
                 * @param {string} versionId Version Id
                 */
                showVersion: function(versionId) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPageVersion(versionId).done(function(loadedVersion) {
                        self.isLoading(false);
                        
                        var version = loadedVersion.version;
                        if(version && version.versionNumber != loadedVersion.mostRecentVersion)
                        {
                            self.displayVersionId(version.id);
                            self.displayVersionName(version.name);
                            self.displayVersionHtml(version.content);
                            self.displayVersionNumber(version.versionNumber);

                            self.syncUrlParamters();
                        }
                        else
                        {
                            self.exitDisplayMode();
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Exits the display mode
                 */
                exitDisplayMode: function() {
                    this.displayVersionId(null);
                    this.displayVersionName(null);
                    this.displayVersionHtml(null);
                    this.displayVersionNumber(null);
                    this.syncUrlParamters();
                },

                /**
                 * Exits the display and compare mode
                 */
                exitDisplayAndCompareMode: function() {
                    this.exitDisplayMode();
                    this.exitCompareMode(); 
                },

                /**
                 * Opens the restore dialog
                 */
                openRestoreDialog: function() {
                    if(!this.displayVersionId())
                    {
                        return;
                    }

                    this.showConfirmRestoreDialog(true);
                    this.confirmRestoreBrokenLinks.removeAll();

                    this.confirmRestoreDialogLoading(true);
                    this.confirmRestoreDialogErrorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KirjaApi/ValidateVersionReferences?versionId=" + this.displayVersionId()).done(function(compareResult) {
                        self.confirmRestoreDialogLoading(false);

                        var compareHtml = jQuery("<div>" + self.displayVersionHtml() + "</div>");
                        self.findMissingReferences(compareHtml, "/Kortisto/Npc", GoNorth.Kirja.Page.Npc, compareResult.missingNpcs);
                        self.findMissingReferences(compareHtml, "/Styr/Item", GoNorth.Kirja.Page.Item, compareResult.missingItems);
                        self.findMissingReferences(compareHtml, "/Evne/Skill", GoNorth.Kirja.Page.Skill, compareResult.missingSkills);
                        self.findMissingReferences(compareHtml, "/Aika/Quest", GoNorth.Kirja.Page.Quest, compareResult.missingQuests);
                        self.findMissingReferences(compareHtml, "/Kirja", GoNorth.Kirja.Page.KirjaPage, compareResult.missingPages);
                    }).fail(function() {
                        self.confirmRestoreDialogLoading(false);
                        self.confirmRestoreDialogErrorOccured(true);
                    });
                },

                /**
                 * Finds missing references in a compare html
                 * @param {object} compareHtml Compare Html object
                 * @param {string} urlPrefix Prefix for links
                 * @param {string} objectLabel Object label 
                 * @param {object[]} compareResult Compare results to check
                 */
                findMissingReferences: function(compareHtml, urlPrefix, objectLabel, compareResult) {
                    var self = this;
                    for(var curResult = 0; curResult < compareResult.length; ++curResult)
                    {
                        var linkSelector = "a[href^='" + urlPrefix + "?id=" + compareResult[curResult] + "']";
                        compareHtml.find(linkSelector).each(function() {
                            self.confirmRestoreBrokenLinks.push({
                                selector: linkSelector,
                                linkText: jQuery(this).text(),
                                objectLabel: objectLabel
                            })
                        });
                    }
                },

                /**
                 * Restores the current displayed version
                 */
                restoreVersion: function() {
                    var newHtml = this.removeMissingReferences(this.displayVersionHtml());

                    this.pageName(this.displayVersionName());
                    this.pageContent(newHtml);
                    this.closeConfirmRestoreDialog();
                    this.exitCompareMode();
                    this.exitDisplayMode();

                    this.save();
                },

                /**
                 * Removes the missing references
                 * @param {string} htmlContent Html Content
                 * @returns {string} Html without missing references
                 */
                removeMissingReferences: function(htmlContent) {
                    var brokenLinks = this.confirmRestoreBrokenLinks();
                    if(brokenLinks.length == 0)
                    {
                        return htmlContent;
                    }

                    var htmlContentFix = jQuery("<div>" + htmlContent + "</div>");
                    for(var curBrokenLink = 0; curBrokenLink < brokenLinks.length; ++curBrokenLink)
                    {
                        htmlContentFix.find(brokenLinks[curBrokenLink].selector).contents().unwrap();
                    }

                    return htmlContentFix.html();
                },

                /**
                 * Closes the confirm restore dialog
                 */
                closeConfirmRestoreDialog: function() {
                    this.showConfirmRestoreDialog(false);
                },

                /**
                 * Loads a page version
                 * @param {string} id Id of the version
                 * @returns {jQuery.Deferred} Deferred
                 */
                loadPageVersion: function(id) {
                    return GoNorth.HttpClient.get("/api/KirjaApi/PageVersion?versionId=" + id);
                },


                /**
                 * Loads the amount of reviews that are waiting for merge
                 */
                loadReviewsWaitingForMerge: function() {
                    var self = this;
                    GoNorth.HttpClient.get("/api/KirjaApi/GetPageReviewCountWaitingForMerge?pageId=" + this.id()).done(function(data) {
                        self.reviewsWaitingForMergeCount(data);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },

                /**
                 * Opens the review dialog
                 */
                openReviewDialog: function() {
                    this.showReviewDialog(true);
                    this.loadReviewsPage();
                },

                /**
                 * Closes the review dialog
                 */
                closeReviewDialog: function() {
                    this.showReviewDialog(false);
                },

                /**
                 * Loads the previous review page
                 */
                prevReviewPage: function() {
                    if(this.currentReviewPage() == 0)
                    {
                        return;
                    }                 

                    this.currentReviewPage(this.currentReviewPage() - 1);
                    this.loadReviewsPage();
                },
                
                /**
                 * Loads the next review page
                 */
                nextReviewPage: function() {
                    if(!this.hasMoreReviews())
                    {
                        return;
                    }                 

                    this.currentReviewPage(this.currentReviewPage() + 1);
                    this.loadReviewsPage();
                },

                /**
                 * Loads the review page
                 */
                loadReviewsPage: function() {
                    var startPageIndex = this.currentReviewPage() * reviewDialogPageSize;

                    this.loadingReviews(true);
                    this.reviewDialogErrorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KirjaApi/GetPageReviews?pageId=" + this.id() + "&start=" + startPageIndex + "&pageSize=" + reviewDialogPageSize).done(function(data) {
                        self.loadingReviews(false);
                        self.hasMoreReviews(data.hasMore);
                        self.reviews(data.reviews);
                    }).fail(function() {
                        self.loadingReviews(false);
                        self.reviews.removeAll();
                        self.reviewDialogErrorOccured(true);
                    });
                },
                
                /**
                 * Builds the url for a review
                 * @param {object} review Review
                 * @returns {string} Review Url 
                 */
                buildReviewUrl: function(review) {
                    return "/Kirja/Review?id=" + review.id;
                },


                /**
                 * Loads the pages in which the current page is mentioned
                 */
                loadMentionedInPages: function() {
                    if(!this.id())
                    {
                        return;
                    }

                    this.loadingMentionedInPages(true);
                    this.loadingMentionedInPagesError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KirjaApi/GetPagesByPage?pageId=" + this.id()).done(function(pages) {
                        var loadedPages = [];
                        for(var curPage = 0; curPage < pages.length; ++curPage)
                        {
                            loadedPages.push({
                                openLink: "/Kirja?id=" + pages[curPage].id,
                                name: pages[curPage].name
                            });
                        }
                        self.mentionedInPages(loadedPages);
                        self.loadingMentionedInPages(false);
                    }).fail(function(xhr) {
                        self.mentionedInPages([]);
                        self.loadingMentionedInPages(false);
                        self.loadingMentionedInPagesError(true);
                    });
                },

                /**
                 * Loads the mentioned quests
                 * @param {string[]} questIds Quest Ids
                 */
                loadMentionedQuests: function(questIds) {
                    if(!GoNorth.Kirja.Page.hasAikaRights || !questIds)
                    {
                        return;
                    }

                    this.loadingMentionedQuests(true);
                    this.loadingMentionedQuestsError(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/AikaApi/ResolveQuestNames", questIds).done(function(questNames) {
                        var loadedQuestNames = [];
                        for(var curQuest = 0; curQuest < questNames.length; ++curQuest)
                        {
                            loadedQuestNames.push({
                                openLink: "/Aika/Quest?id=" + questNames[curQuest].id,
                                name: questNames[curQuest].name
                            });
                        }
                        self.mentionedQuests(loadedQuestNames);
                        self.loadingMentionedQuests(false);
                    }).fail(function(xhr) {
                        self.mentionedQuests([]);
                        self.loadingMentionedQuests(false);
                        self.loadingMentionedQuestsError(true);
                    });
                },

                /**
                 * Loads the quests in which the wiki page is referenced
                 */
                loadReferencedInQuests: function() {
                    if(!GoNorth.Kirja.Page.hasAikaRights || !this.id())
                    {
                        return;
                    }

                    this.loadingReferencedInQuests(true);
                    this.loadingReferencedInQuestsError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/AikaApi/GetQuestsObjectIsReferenced?objectId=" + this.id()).done(function(quests) {
                        var loadedQuests = [];
                        for(var curQuest = 0; curQuest < quests.length; ++curQuest)
                        {
                            loadedQuests.push({
                                openLink: "/Aika/Quest?id=" + quests[curQuest].objectId,
                                name: quests[curQuest].objectName
                            });
                        }
                        self.referencedInQuests(loadedQuests);
                        self.loadingReferencedInQuests(false);
                    }).fail(function(xhr) {
                        self.referencedInQuests([]);
                        self.loadingReferencedInQuests(false);
                        self.loadingReferencedInQuestsError(true);
                    });
                },

                /**
                 * Loads the mentioned npcs
                 * @param {string[]} npcIds Npc Ids
                 */
                loadMentionedNpcs: function(npcIds) {
                    if(!GoNorth.Kirja.Page.hasKortistoRights || !npcIds)
                    {
                        return;
                    }

                    this.loadingMentionedNpcs(true);
                    this.loadingMentionedNpcsError(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/KortistoApi/ResolveFlexFieldObjectNames", npcIds).done(function(npcNames) {
                        var loadedNpcNames = [];
                        for(var curNpc = 0; curNpc < npcNames.length; ++curNpc)
                        {
                            loadedNpcNames.push({
                                openLink: "/Kortisto/Npc?id=" + npcNames[curNpc].id,
                                name: npcNames[curNpc].name
                            });
                        }
                        self.mentionedNpcs(loadedNpcNames);
                        self.loadingMentionedNpcs(false);
                    }).fail(function(xhr) {
                        self.mentionedNpcs([]);
                        self.loadingMentionedNpcs(false);
                        self.loadingMentionedNpcsError(true);
                    });
                },

                /**
                 * Loads the daily routines in which the page is referenced
                 */
                loadReferencedInDailyRoutines: function() {
                    if(!GoNorth.Kirja.Page.hasKortistoRights || !this.id())
                    {
                        return;
                    }

                    this.loadingReferencedInDailyRoutines(true);
                    this.loadingReferencedInDailyRoutinesError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KortistoApi/GetNpcsObjectIsReferencedInDailyRoutine?objectId=" + this.id()).done(function(npcs) {
                        var loadedDailyRoutines = [];
                        for(var curDailyRoutine = 0; curDailyRoutine < npcs.length; ++curDailyRoutine)
                        {
                            loadedDailyRoutines.push({
                                openLink: "/Kortisto/Npc?id=" + npcs[curDailyRoutine].id,
                                name: npcs[curDailyRoutine].name
                            });
                        }
                        self.referencedInDailyRoutines(loadedDailyRoutines);
                        self.loadingReferencedInDailyRoutines(false);
                    }).fail(function(xhr) {
                        self.referencedInDailyRoutines([]);
                        self.loadingReferencedInDailyRoutines(false);
                        self.loadingReferencedInDailyRoutinesError(true);
                    });
                },

                /**
                 * Loads the state machines the page in referenced in
                 */
                loadReferencedInStateMachines: function() {
                    if(!GoNorth.Kirja.Page.hasKortistoRights || !this.id())
                    {
                        return;
                    }

                    this.loadingReferencedInStateMachines(true);
                    this.loadingReferencedInStateMachinesError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/StateMachineApi/GetStateMachineObjectIsReferenced?objectId=" + this.id()).done(function(stateMachines) {
                        var loadedStateMachines = [];
                        for(var curStateMachine = 0; curStateMachine < stateMachines.length; ++curStateMachine)
                        {
                            var url = "/StateMachine?";
                            if(stateMachines[curStateMachine].objectType == "NpcTemplate") {
                                url += "npcTemplateId="
                            } else if(stateMachines[curStateMachine].objectType == "Npc") {
                                url += "npcId=";
                            } else {
                                throw "Unknown state machine object";
                            }
                            url += stateMachines[curStateMachine].objectId;

                            loadedStateMachines.push({
                                openLink: url,
                                name: stateMachines[curStateMachine].objectName
                            });
                        }
                        self.referencedInStateMachines(loadedStateMachines);
                        self.loadingReferencedInStateMachines(false);
                    }).fail(function(xhr) {
                        self.referencedInStateMachines([]);
                        self.loadingReferencedInStateMachines(false);
                        self.loadingReferencedInStateMachinesError(true);
                    });
                },

                /**
                 * Loads the dialogs in which the wiki page is referenced
                 */
                loadReferencedInDialogs: function() {
                    if(!GoNorth.Kirja.Page.hasTaleRights || !GoNorth.Kirja.Page.hasKortistoRights || !this.id())
                    {
                        return;
                    }

                    this.loadingReferencedInDialogs(true);
                    this.loadingReferencedInDialogsError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/TaleApi/GetDialogsObjectIsReferenced?objectId=" + this.id()).done(function(dialogs) {
                        var loadedDialogs = [];
                        for(var curDialog = 0; curDialog < dialogs.length; ++curDialog)
                        {
                            loadedDialogs.push({
                                openLink: "/Tale?npcId=" + dialogs[curDialog].objectId,
                                name: dialogs[curDialog].objectName
                            });
                        }

                        self.referencedInDialogs(loadedDialogs);
                        self.loadingReferencedInDialogs(false);
                    }).fail(function(xhr) {
                        self.referencedInDialogs([]);
                        self.loadingReferencedInDialogs(false);
                        self.loadingReferencedInDialogsError(true);
                    });
                },

                /**
                 * Loads the mentioned items
                 * @param {string[]} itemIds Item Ids
                 */
                loadMentionedItems: function(itemIds) {
                    if(!GoNorth.Kirja.Page.hasKortistoRights || !itemIds)
                    {
                        return;
                    }

                    this.loadingMentionedItems(true);
                    this.loadingMentionedItemsError(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", itemIds).done(function(itemNames) {
                        var loadedItemNames = [];
                        for(var curItem = 0; curItem < itemNames.length; ++curItem)
                        {
                            loadedItemNames.push({
                                openLink: "/Styr/Item?id=" + itemNames[curItem].id,
                                name: itemNames[curItem].name
                            });
                        }
                        self.mentionedItems(loadedItemNames);
                        self.loadingMentionedItems(false);
                    }).fail(function(xhr) {
                        self.mentionedItems([]);
                        self.loadingMentionedItems(false);
                        self.loadingMentionedItemsError(true);
                    });
                },
               
                /**
                 * Loads the mentioned skills
                 * @param {string[]} skillIds Skill Ids
                 */
                loadMentionedSkills: function(skillIds) {
                    if(!GoNorth.Kirja.Page.hasEvneRights || !skillIds)
                    {
                        return;
                    }

                    this.loadingMentionedSkills(true);
                    this.loadingMentionedSkillsError(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/EvneApi/ResolveFlexFieldObjectNames", skillIds).done(function(skillNames) {
                        var loadedSkillNames = [];
                        for(var curSkill = 0; curSkill < skillNames.length; ++curSkill)
                        {
                            loadedSkillNames.push({
                                openLink: "/Evne/Skill?id=" + skillNames[curSkill].id,
                                name: skillNames[curSkill].name
                            });
                        }
                        self.mentionedSkills(loadedSkillNames);
                        self.loadingMentionedSkills(false);
                    }).fail(function(xhr) {
                        self.mentionedSkills([]);
                        self.loadingMentionedSkills(false);
                        self.loadingMentionedSkillsError(true);
                    });
                },

                /**
                 * Loads the skills in which the wiki page is referenced
                 */
                loadReferencedInSkills: function() {
                    if(!GoNorth.Kirja.Page.hasEvneRights || !this.id())
                    {
                        return;
                    }

                    this.loadingReferencedSkills(true);
                    this.loadingReferencedSkillsError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/EvneApi/GetSkillsObjectIsReferencedIn?objectId=" + this.id()).done(function(skills) {
                        var loadedSkills = [];
                        for(var curSkill = 0; curSkill < skills.length; ++curSkill)
                        {
                            loadedSkills.push({
                                openLink: "/Evne/Skill?id=" + skills[curSkill].id,
                                name: skills[curSkill].name
                            });
                        }
                        self.referencedInSkills(loadedSkills);
                        self.loadingReferencedSkills(false);
                    }).fail(function(xhr) {
                        self.referencedInSkills([]);
                        self.loadingReferencedSkills(false);
                        self.loadingReferencedSkillsError(true);
                    });
                },

                /**
                 * Loads the maps in which the pages was marked
                 */
                loadMarkedInMaps: function() {
                    if(!GoNorth.Kirja.Page.hasKartaRights)
                    {
                        return;
                    }

                    this.markedInMaps([]);
                    this.loadingMarkedInMaps(true);
                    this.loadingMarkedInMapsError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KartaApi/GetMapsByKirjaPageId?pageId=" + this.id()).done(function(maps) {
                        var loadedMaps = [];
                        for(var curMap = 0; curMap < maps.length; ++curMap)
                        {
                            var url = "/Karta?id=" + maps[curMap].mapId;
                            if(maps[curMap].markerIds.length == 1)
                            {
                                url += "&zoomOnMarkerId=" + maps[curMap].markerIds[0] + "&zoomOnMarkerType=" + maps[curMap].mapMarkerType
                            }

                            loadedMaps.push({
                                openLink: url,
                                name: maps[curMap].name,
                                markerCount: maps[curMap].markerIds.length,
                                tooltip: GoNorth.Kirja.Page.kirjaMapMarkerCountTooltip.replace("{0}", maps[curMap].markerIds.length)
                            });
                        }
                        self.markedInMaps(loadedMaps);
                        self.loadingMarkedInMaps(false);
                    }).fail(function(xhr) {
                        self.loadingMarkedInMaps(false);
                        self.loadingMarkedInMapsError(true);
                    });
                },

                /**
                 * Loads the export snippets in which the page is referenced
                 */
                loadReferencedInExportSnippets: function() {
                    if(!GoNorth.Kirja.Page.hasExportObjectsRights || !this.id())
                    {
                        return;
                    }

                    this.loadingReferencedInExportSnippets(true);
                    this.loadingReferencedInExportSnippetsError(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/ExportApi/GetSnippetsObjectIsReferencedIn?id=" + this.id()).done(function(exportSnippets) {
                        var loadedExportSnippets = [];
                        for(var curExportSnippet = 0; curExportSnippet < exportSnippets.length; ++curExportSnippet)
                        {
                            var url = ""; 
                            var objectType = "";
                            var snippet = exportSnippets[curExportSnippet];
                            if(snippet.objectType == "npc")
                            {
                                url = "/Kortisto/Npc?id=" + snippet.objectId;
                                objectType = GoNorth.Kirja.Page.Npc;
                            }
                            else if(snippet.objectType == "item")
                            {
                                url = "/Styr/Item?id=" + snippet.objectId;
                                objectType = GoNorth.Kirja.Page.Item;
                            }
                            else if(snippet.objectType == "skill")
                            {
                                url = "/Evne/Skill?id=" + snippet.objectId;
                                objectType = GoNorth.Kirja.Page.Skill;
                            }
                            else
                            {
                                continue;
                            }

                            loadedExportSnippets.push({
                                openLink: url,
                                name: snippet.objectName + " (" + objectType + ")"
                            });
                        }
                        self.referencedInExportSnippets(loadedExportSnippets);
                        self.loadingReferencedInExportSnippets(false);
                    }).fail(function(xhr) {
                        self.referencedInExportSnippets([]);
                        self.loadingReferencedInExportSnippets(false);
                        self.loadingReferencedInExportSnippetsError(true);
                    });
                },

                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the page
                 */
                setId: function(id) {
                    var hasId = !!this.id();
                    this.id(id);
                    this.blockPageReload = true;
                    var parameterValue = "id=" + id;
                    if(hasId)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue); 
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
                },


                /**
                 * Opens the confirm delete dialog
                 */
                openConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(true);
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                },

                /**
                 * Deletes the current page
                 */
                deletePage: function() {
                    this.closeConfirmDeleteDialog();
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.delete("/api/KirjaApi/DeletePage?id=" + this.id()).done(function(data) {
                        self.isLoading(false);
                        if(self.callPageRefreshGrid())
                        {
                            window.close();
                        }
                        else
                        {
                            window.location = "/Kirja";
                        }
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        // If page is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalErrorDetails(xhr.responseText);
                        }
                    });
                },

                /**
                 * Opens a page to create a new kirja page
                 */
                openCreatePage: function() {
                    this.linkDialog.closeDialog();
                    this.showNewWaitPageDialog(true);

                    var self = this;
                    var newPage = window.open("/Kirja?newPage=1");
                    newPage.onbeforeunload = function() {
                        self.showNewWaitPageDialog(false);
                    };
                    newPage.newKirjaPageSaved = function(id, name) {
                        self.addLinkFromLinkDialog({ name: name, openLink: kirjaIdUrlPrefx + id, id }, true);
                        self.showNewWaitPageDialog(false);
                        self.save();
                    };
                },

                /**
                 * Toogles the sidebar
                 */
                toogleSidebar: function() {
                    this.showSidebar(!this.showSidebar());
                },


                /**
                 * Checks the lock without locking it
                 */
                checkLock: function() {
                    var self = this;
                    GoNorth.LockService.checkLock("KirjaPage", this.id()).done(function(isLocked, lockedUsername) { 
                        self.handleLockResult(isLocked, lockedUsername);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.exitEditModeWithoutDirtyCheck();
                    });
                },

                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("KirjaPage", this.id()).done(function(isLocked, lockedUsername) { 
                        self.handleLockResult(isLocked, lockedUsername);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.exitEditModeWithoutDirtyCheck();
                    });
                },

                /**
                 * Handles the lock result
                 * 
                 * @param {bool} isLocked true if the resource is locked, else false
                 * @param {string} lockedUsername Name of the user who owns the lock at the moment
                 */
                handleLockResult: function(isLocked, lockedUsername) {
                    if(isLocked)
                    {
                        this.isReadonly(true);
                        this.lockedByUser(lockedUsername);
                        this.exitEditModeWithoutDirtyCheck();
                    }
                    else
                    {
                        this.isReadonly(false);
                        this.lockedByUser("");
                    }
                },


                /**
                 * Calls the npc refresh for the grid of the parent window
                 * 
                 * @returns {bool} true if a refresh was triggered, else false 
                 */
                callPageRefreshGrid: function() {
                    if(window.refreshKirjaPageGrid)
                    {
                        window.refreshKirjaPageGrid();
                        return true;
                    }

                    return false;
                },


                /**
                 * Starts a review
                 */
                startReview: function() {
                    var self = this;
                    GoNorth.PromptService.openInputPrompt(Page.enterReviewName, "", true).done(function(reviewName) {
                        var request = {
                            name: reviewName,
                            pageId: self.id(),
                            versionId: self.displayVersionId() ? self.displayVersionId() : ""
                        };
    
                        self.isLoading(true);
                        self.resetErrorState();
                        GoNorth.HttpClient.post("/api/KirjaApi/StartReview", request).done(function(reviewId) {
                            window.location.href = "/Kirja/Review?id=" + reviewId;
                        }).fail(function(xhr) {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    });
                }
            });

        }(Kirja.Page = Kirja.Page || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));