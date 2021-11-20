(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Review) {

            /**
             * Review View Model
             * @class
             */
            Review.ViewModel = function()
            {
                Kirja.Shared.BaseViewModel.apply(this);

                this.reviewedPageId = new ko.observable("");
                this.additionalComment = new ko.observable("");

                this.pageExternalShareToken = new ko.observable("");
                this.isGeneratingExternalShareLink = new ko.observable(false);
                this.externalLinkShowSuccessfullyCopiedTooltip = new ko.observable(false);
                this.showExternalLink = new ko.observable(false);
                this.pageStatus = new ko.observable("");
                this.reviewStatusIsReadonly = new ko.pureComputed(function() {
                    return this.pageStatus() == "Completed" || this.pageStatus() == "Merged";
                }, this);
                this.visibleComments = new ko.observableArray();

                this.isRunningMerge = new ko.observable(false);
                this.mergePageName = new ko.observable("");
                this.mergeHtml = new ko.observable("");
                this.unmergedChangesExist = new ko.observable(false);
                this.visibleMergeTags = new ko.observableArray();
                this.mergePageLockedBy = new ko.observable("");
                this.mergePageLockedResetTimeout = null;

                this.loadReview();
                this.acquireLock();

                var self = this;
                var scrollContentThrottled = GoNorth.Util.throttle(function() {
                    self.updateCommentPositions();
                    self.updateMergeTagPosition();
                }, 15);
                jQuery(".gn-kirjaPageRichTextEditor").on("scroll", function() {
                    scrollContentThrottled();
                });
                jQuery(window).on("resize", function() {
                    scrollContentThrottled();
                });

                this.dirtyChecker = new GoNorth.SaveUtil.DirtyChecker(function() {
                    return self.buildSaveRequestObject();
                }, GoNorth.Kirja.Review.dirtyMessage, GoNorth.Kirja.Review.disableAutoSaving, function() {
                    self.save();
                });

                GoNorth.SaveUtil.setupSaveHotkey(function() {
                    self.save();
                });
            };

            Review.ViewModel.prototype = jQuery.extend({ }, Kirja.Shared.BaseViewModel.prototype, {
                /**
                 * Returns true if the link rich text buttons must be generated
                 * @returns {boolean} true if the link rich text buttons must be generated, else false
                 */
                allowLinkRichTextButtons: function() {
                    return GoNorth.Kirja.Shared.isUserSignedIn;
                },

                /**
                 * Generates additional rich text buttons
                 * @param {object} allKirjaButtons rich text buttons to extend
                 * @param {object} additionalParams Any additional parameters for generating the buttons
                 */
                generateAdditionalRichTextButtons: function(allKirjaButtons, additionalParams) {
                    self = this;
                    
                    if(!additionalParams) 
                    {
                        allKirjaButtons.comments = {
                            title: Review.toolbarButtonInsertComment,
                            icon: "glyphicon-comment",
                            callback: function(_htmlInsert, wrapElement) {
                                GoNorth.PromptService.openInputPrompt(Review.enterCommentText, "", true, true).done(function(commentText) {
                                    var maxCommentId = self.getMaxCommentId();
                                    var commentElement = jQuery("<gn-kirjacomment></gn-kirjacomment>");
                                    commentElement.prop("title", commentText);
                                    commentElement.attr("commentid", maxCommentId + 1);
                                    var commentText = commentElement[0].outerHTML;
                                    wrapElement(function() {
                                        return jQuery(commentText).attr("commenttagid", GoNorth.Util.uuidv4())[0];
                                    });
                                });
                            }
                        };
                    } 
                    else 
                    {
                        var self = this;
                        allKirjaButtons.commentsAcceptReject = {
                            toolbarButtonGroup: {
                                acceptAll: {
                                    title: Review.toolbarButtonAcceptAllChanges,
                                    icon: "glyphicon-ok",
                                    callback: function() {
                                        self.acceptRejectAllMergeGroups("ins", "del");
                                    }
                                },
                                rejectAll: {
                                    title: Review.toolbarButtonRejectAllChanges,
                                    icon: "glyphicon-remove",
                                    callback: function() {
                                        self.acceptRejectAllMergeGroups("del", "ins");
                                    }
                                }
                            }
                        };
                    }
                },

                /**
                 * Returns the max comment id
                 * @returns {number} Max comment id
                 */
                getMaxCommentId: function() {
                    var commentId = 0;
                    jQuery("<div>" + this.pageContent() + "</div>").find("gn-kirjacomment").each(function() {
                        var curCommentId = parseInt(jQuery(this).attr("commentid"));
                        if(!isNaN(curCommentId) && curCommentId > commentId) {
                            commentId = curCommentId;
                        }
                    });
                    return commentId;
                },

                /**
                 * Gets called on click of the page content
                 * @param {object} _d Data
                 * @param {object} event Javascript Click event
                 */
                onPageContentClick: function(_d, event) {
                    this.checkCommentFocus(event.target);
                    return true;
                },

                /**
                 * Returns the callout position for an element
                 * @param {object} element jQuery Object
                 * @returns {object} Callout position for element
                 */
                 getCalloutPositionFromElement: function(element) {
                    var parentElement = jQuery(".gn-kirjaCommentContainer:visible");
                    if(parentElement.length == 0) 
                    {
                        parentElement = jQuery(".gn-kirjaMergeTagContainer:visible");
                    }
                    
                    var parentPosition = parentElement.offset();
                    var elementPosition = element.offset();
                    return {
                        left: elementPosition.left - parentPosition.left,
                        top: elementPosition.top - parentPosition.top
                    };
                },
                
                /**
                 * Checks if a comment is focused
                 * @param {object} focusElement Focused element
                 */
                checkCommentFocus: function(focusElement) {
                    var comment = jQuery(focusElement).closest("gn-kirjacomment");
                    if(comment.length == 0)
                    {
                        this.visibleComments.removeAll();
                        return;
                    }

                    var comments = this.visibleComments();
                    for(let curComment = 0; curComment < comments.length; ++curComment)
                    {
                        if(comments[curComment].elem == comment[0])
                        {
                            return;
                        }
                    }

                    this.visibleComments.removeAll();
                    var position = this.getCalloutPositionFromElement(comment);
                    var commentElement = {
                        elem: comment[0],
                        left: new ko.observable(position.left),
                        top: new ko.observable(position.top),
                        width: new ko.observable(comment.width()), 
                        height: new ko.observable(comment.height()), 
                        text: new ko.observable(comment.prop("title")),
                        visible: new ko.observable(false)
                    };
                    commentElement.expandDownwards = new ko.computed(function() {
                        var top = this.top();   // Ensure Update is triggered
                        var visible = this.visible();
                        if(!visible) {
                            return false;
                        }

                        var commentCallout = jQuery(".gn-kirjaCommentCallout");
                        if(commentCallout.length == 0) {
                            return false;
                        }

                        var editor = jQuery(".gn-kirjaPageRichTextEditor:visible");
                        if(editor.length == 0) 
                        {
                            return false;
                        }

                        var commentContainer = this.elem.getBoundingClientRect();
                        var commentBoundingBox = commentCallout[0].getBoundingClientRect();
                        var containerBoundingBox = editor[0].getBoundingClientRect();
                        return commentBoundingBox.y < containerBoundingBox.y || commentContainer.y - commentBoundingBox.height < containerBoundingBox.y;
                    }, commentElement);

                    this.visibleComments.push(commentElement);
                    setTimeout(function() {
                        commentElement.visible(true);
                    }, 10);
                },

                /**
                 * Gets called if the comment position must be updated
                 */
                updateCommentPositions: function() {
                    var comments = this.visibleComments();
                    for(let curComment = 0; curComment < comments.length; ++curComment)
                    {
                        var commentElement = jQuery(comments[curComment].elem);
                        var position = this.getCalloutPositionFromElement(commentElement);
                        comments[curComment].left(position.left);
                        comments[curComment].top(position.top);
                        comments[curComment].width(commentElement.width());
                        comments[curComment].height(commentElement.height());
                    }
                },

                /**
                 * Edits a comment
                 * @param {object} comment Comment to edit
                 */
                editComment: function(comment) {
                    var self = this;
                    GoNorth.PromptService.openInputPrompt(Review.enterCommentText, comment.text(), true, true).done(function(commentText) {
                        var commentId = jQuery(comment.elem).attr("commentid");
                        var commentTagId = jQuery(comment.elem).attr("commenttagid");
                        var changePageContent = jQuery("<div>" + self.pageContent() + "</div>");
                        changePageContent.find("gn-kirjacomment[commentId=\"" + commentId + "\"]").each(function() {
                            jQuery(this).prop("title", commentText);
                        });
                        var cleanedContent = changePageContent;
                        while(cleanedContent.is("div") && cleanedContent.children().length == 1)
                        {
                            cleanedContent = cleanedContent.children().first();
                        }
                        var newHtml = cleanedContent.html();

                        comment.text(commentText);

                        self.selectAllReviewText();

                        document.execCommand("insertHTML", 0, newHtml);

                        self.clearEditorSelection();

                        comment.elem = jQuery("gn-kirjacomment[commenttagid=\"" + commentTagId + "\"]")[0];
                    });
                },

                /**
                 * Deletes a comment
                 * @param {object} comment Comment to delete
                 */
                deleteComment: function(comment) {
                    var self = this;
                    GoNorth.PromptService.openYesNoPrompt(Review.areYouSure, Review.areYouSureYouWantToDeleteTheComment).done(function() {
                        var commentId = jQuery(comment.elem).attr("commentid");
                        var changePageContent = jQuery("<div>" + self.pageContent() + "</div>");
                        changePageContent.find("gn-kirjacomment[commentId=\"" + commentId + "\"]").each(function() {
                            jQuery(this).replaceWith(jQuery(this).html());
                        });
                        var cleanedContent = changePageContent;
                        while(cleanedContent.is("div") && cleanedContent.children().length == 1)
                        {
                            cleanedContent = cleanedContent.children().first();
                        }
                        var newHtml = cleanedContent.html();

                        self.selectAllReviewText();

                        document.execCommand("insertHTML", 0, newHtml);

                        self.clearEditorSelection();

                        self.visibleComments.remove(comment);
                    });
                },

                /**
                 * Selects the whole review text
                 */
                 selectAllReviewText: function() {
                    this.clearEditorSelection();

                    var range = document.createRange();
                    if(jQuery(".gn-reviewContent:visible").children().length == 1)
                    {
                        range.selectNode(jQuery(".gn-reviewContent:visible").children()[0]);
                    }
                    else
                    {
                        range.selectNodeContents(jQuery(".gn-reviewContent:visible")[0]);
                    }
                    window.getSelection().addRange(range);
                },

                /**
                 * Clears the editor selection
                 */
                clearEditorSelection: function() {
                    try {
                        selection.removeAllRanges();
                    } catch (ex) {
                        if(document.body.createTextRange)
                        {
                            document.body.createTextRange().select();
                            document.selection.empty();
                        }
                        else
                        {
                            var range = document.createRange();
                            window.getSelection().addRange(range);
                            window.getSelection().empty()
                        }
                    }
                },


                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                },

                /**
                 * Loads the review
                 */
                loadReview: function() {
                    var url = "/api/KirjaApi/Review?id=" + encodeURIComponent(this.id());
                    if(!GoNorth.Kirja.Shared.isUserSignedIn)
                    {
                        url = "/api/KirjaApi/ExternalReview?id=" + encodeURIComponent(this.id()) + "&token=" + encodeURIComponent(this.getExternalAccessToken());
                    }

                    this.isLoading(true);
                    this.showExternalLink(false);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.get(url).done(function(data) {
                        self.isLoading(false);
                        if(!data)
                        {
                            self.errorOccured(true);
                            return;
                        }
                        
                        self.showExternalLink(true);
                        self.pageName(data.name);
                        self.pageContent(self.fixOldLinks(data.content));
                        self.pageExternalShareToken(data.externalAccessToken);
                        self.pageStatus(data.status);
                        self.additionalComment(data.additionalComment);
                        self.reviewedPageId(data.reviewedPageId);
                        self.originalPageContent = self.pageContent();
                        if(!self.id())
                        {
                            self.setId(data.id);
                        }
                        self.dirtyChecker.saveCurrentSnapshot();
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Returns the cleaned html of the page. This removes uncessary divs
                 * @param {string} html HTML
                 * @returns {string} Cleaned Html
                 */
                getCleanedHtml: function(html) {
                    var cleanedHtml = jQuery("<div>" + html + "</div>");
                    while(cleanedHtml.children().length == 1 && cleanedHtml.children().first().is("div") && (!cleanedHtml.children()[0].attributes || cleanedHtml.children()[0].attributes.length == 0))
                    {
                        cleanedHtml.children().children().unwrap();
                    }
                    return cleanedHtml.html();
                },

                /**
                 * Builds the save request object
                 * @returns {object} Save Request object
                 */
                 buildSaveRequestObject: function() {
                    return {
                        content: this.getCleanedHtml(this.pageContent()),
                        additionalComment: this.additionalComment()
                    };
                },

                /**
                 * Saves the page
                 */
                save: function() {
                    // Send Data
                    var url = "/api/KirjaApi/UpdateReview?id=" + encodeURIComponent(this.id());
                    if(!GoNorth.Kirja.Shared.isUserSignedIn)
                    {
                        url = "/api/KirjaApi/UpdateExternalReview?id=" + encodeURIComponent(this.id()) + "&token=" + encodeURIComponent(this.getExternalAccessToken());
                    }

                    var request = this.buildSaveRequestObject();

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.post(url, request).done(function(savedPage) {
                        self.pageModifiedOn(savedPage.modifiedOn);
                        self.isLoading(false);
                        self.originalPageContent = self.pageContent();
                        self.dirtyChecker.saveCurrentSnapshot();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Copys an external sahre link
                 */
                copyExternalShareLink: function() {
                    if(this.pageExternalShareToken())
                    {
                        this.copyExternalLinkToClipboard();
                        return;
                    }

                    this.isGeneratingExternalShareLink(true);

                    var url = "/api/KirjaApi/GenerateExternalAccessToken?id=" + this.id();

                    var self = this;
                    GoNorth.HttpClient.post(url, {}).done(function(externalToken) {
                        self.isGeneratingExternalShareLink(false);
                        self.pageExternalShareToken(externalToken);
                        self.copyExternalLinkToClipboard();
                    }).fail(function(xhr) {
                        self.isGeneratingExternalShareLink(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Copys a link to clipboard
                 */
                copyExternalLinkToClipboard: function() {
                    var link = window.location.origin + "/Kirja/ExternalReview?id=" + encodeURIComponent(this.id()) + "&token=" + encodeURIComponent(this.pageExternalShareToken());

                    jQuery("#gn-externalLinkContainer").remove();
                    jQuery("body").append("<div id='gn-externalLinkContainer' style='opacity: 0'><input id='gn-externalLink'/></div>");
                    jQuery("#gn-externalLink").val(link);

                    var exportResultField = jQuery("#gn-externalLink")[0];
                    exportResultField.select();
                    document.execCommand("copy");

                    jQuery("#gn-externalLinkContainer").remove();

                    this.externalLinkShowSuccessfullyCopiedTooltip(true);
                    var self = this;
                    setTimeout(function() {
                        self.externalLinkShowSuccessfullyCopiedTooltip(false);
                    }, 1000);
                },

                /**
                 * Revokes the external share link
                 */
                revokeExternalShareToken: function() {
                    this.isGeneratingExternalShareLink(true);

                    var url = "/api/KirjaApi/RevokeExternalAccessToken?id=" + encodeURIComponent(this.id());

                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.delete(url, {}).done(function() {
                        self.isGeneratingExternalShareLink(false);
                        self.pageExternalShareToken("");
                    }).fail(function(xhr) {
                        self.isGeneratingExternalShareLink(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Redirects back to the reviewed page
                 */
                backToReviewedPage: function() {
                    window.location.href = "/Kirja?id=" + this.reviewedPageId();
                },


                /**
                 * Marks the a review as completed
                 */
                markAsCompleted: function() {
                    this.setStatus("Completed");
                },

                /**
                 * Reopens a completed review
                 */
                 reopen: function() {
                    this.setStatus("Open");
                },
                
                /**
                 * Sets the status of a review
                 * @param {string} status Status to set
                 */
                setStatus: function(status) {
                    this.visibleComments.removeAll();

                    var url = "/api/KirjaApi/SetReviewStatus?id=" + encodeURIComponent(this.id()) + "&status=" + encodeURIComponent(status);
                    if(!GoNorth.Kirja.Shared.isUserSignedIn)
                    {
                        url = "/api/KirjaApi/SetExternalReviewStatus?id=" + encodeURIComponent(this.id()) + "&status=" + encodeURIComponent(status) + "&token=" + encodeURIComponent(this.getExternalAccessToken());
                    }

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    return GoNorth.HttpClient.post(url, {}).done(function() {
                        self.isLoading(false);
                        self.pageStatus(status);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Strips the comments from an HTML content
                 */
                stripComments: function(dataContent) {
                    var strippedComment = jQuery("<div>" + dataContent + "</div>"); 
                    strippedComment.find("gn-kirjacomment").prop("title", "");

                    var html = strippedComment.html();
                    html = html.replace(/<gn-kirjacomment.*?>/gi, "");
                    html = html.replace(/<\/gn-kirjacomment>/gi, "");

                    return html;
                },

                /**
                 * Groups merge tags
                 * @param {string} html Merge result html
                 * @returns {string} Grouped merge result
                 */
                groupMergeTags: function(html) {
                    var self = this;
                    var groupedResult = jQuery("<div>" + html + "</div>");
                    var curGroupId = 0;
                    groupedResult.find("del").each(function() {
                        if(jQuery(this).attr("mergeGroupId")) 
                        {
                            return;
                        }

                        ++curGroupId;
                        jQuery(this).attr("mergeGroupId", curGroupId);

                        var nextIns = self.findNextMergeTag(jQuery(this), "ins,del");
                        if(nextIns == null || nextIns.length == 0)
                        {
                            return;
                        }

                        while(nextIns != null && nextIns.length > 0)
                        {
                            nextIns.attr("mergeGroupId", curGroupId);
                            nextIns = self.findNextMergeTag(nextIns, "ins,del");
                        }
                    });

                    groupedResult.find("ins:not([mergeGroupId])").each(function() {
                        if(jQuery(this).attr("mergeGroupId")) 
                        {
                            return;
                        }

                        ++curGroupId;
                        jQuery(this).attr("mergeGroupId", curGroupId);

                        var nextIns = self.findNextMergeTag(jQuery(this), "ins");
                        if(nextIns == null || nextIns.length == 0)
                        {
                            return;
                        }

                        while(nextIns != null && nextIns.length > 0)
                        {
                            nextIns.attr("mergeGroupId", curGroupId);
                            nextIns = self.findNextMergeTag(nextIns, "ins");
                        }
                    });

                    return groupedResult.html();
                },

                /**
                 * Finds the next merge tag
                 * @param {object} startElem Start element
                 * @param {string} tagName Tag Name
                 * @returns {object} Next Merge tag
                 */
                findNextMergeTag: function(startElem, tagName) {
                    var nextMergeTag = startElem.next();
                    if(nextMergeTag.length > 0 && nextMergeTag.is(tagName))
                    {
                        return nextMergeTag;
                    }

                    var nextMergeChild = nextMergeTag.children().first();
                    if(nextMergeChild.length > 0 && nextMergeChild.is(tagName))
                    {
                        return nextMergeChild;
                    }

                    var nextElement = startElem.parent().next();
                    if(nextElement.length > 0 && nextElement.is(tagName))
                    {
                        return nextElement;
                    }

                    if(nextElement.length == 0)
                    {
                        return null;
                    }

                    var nextChild = nextElement.children().first();
                    if(nextChild.length > 0 && nextChild.is(tagName))
                    {
                        return nextChild;
                    }

                    while(nextChild.length > 0)
                    {
                        if(nextChild.is(tagName))
                        {
                            return nextChild;
                        }
                        nextChild = nextChild.children().first();
                    }

                    return null;
                },

                /**
                 * Cleans the comment merge
                 * @param {string} diffResult Diff result of the merge
                 */
                 cleanCommentMerge: function(diffResult) {
                    var cleanedDiffResult = jQuery("<div>" + diffResult + "</div>");
                    cleanedDiffResult.find("del[mergegroupid]").each(function() {
                        var oldContent = GoNorth.Util.unescapeHtmlSpecialCharacters(jQuery(this).html());
                        
                        var inserts = cleanedDiffResult.find("ins[mergegroupid=\"" + jQuery(this).attr("mergegroupid") + "\"]");
                        var newContent = "";
                        inserts.each(function() {
                            newContent += jQuery(this).html();
                        });
                        newContent = GoNorth.Util.unescapeHtmlSpecialCharacters(newContent);

                        if(oldContent == newContent) {
                            jQuery(this).replaceWith(oldContent);
                            inserts.remove();
                        }
                    });

                    return cleanedDiffResult.html();
                },

                /**
                 * Removes empty tags
                 * @param {string} html HTML to clean
                 */
                removeEmptyTags: function(html) {
                    var cleanedHtml = jQuery("<div>" + html + "</div>");

                    cleanedHtml.find("span:empty").remove();
                    cleanedHtml.find("div:empty").remove();
                    cleanedHtml.find("p:empty").remove();
                    cleanedHtml.find("a:empty").remove();

                    return cleanedHtml.html();
                },

                /**
                 * Starts a merge
                 */
                startMerge: function() {
                    var url = "/api/KirjaApi/Page";
                    if(this.id())
                    {
                        url += "?id=" + this.reviewedPageId();
                    }

                    if(this.mergePageLockedResetTimeout) {
                        clearTimeout(this.mergePageLockedResetTimeout);
                        this.mergePageLockedResetTimeout = null;
                    }
                    this.mergePageLockedBy("");

                    this.isRunningMerge(true);
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.LockService.releaseCurrentLock();
                    GoNorth.LockService.acquireLock("KirjaPage", this.reviewedPageId()).done(function(isLocked, lockedUsername) { 
                        if(isLocked) 
                        {
                            self.cancelMergeOnLockedPage();
                            return;
                        }

                        GoNorth.HttpClient.get(url).done(function(data) {
                            self.mergePageName(data.name);
                            var diffResult = htmldiff(data.content, self.stripComments(self.pageContent()));
                            diffResult = self.groupMergeTags(diffResult);
                            diffResult = self.cleanCommentMerge(diffResult);
                            diffResult = self.removeEmptyTags(diffResult);
                            self.mergeHtml(diffResult);
                            self.isLoading(false);
                        }).fail(function(xhr) {
                            self.errorOccured(true);
                            self.isLoading(false);
                        });
                    }).fail(function() {
                        self.errorOccured(true);
                        self.acquireLock();
                    });
                },

                /**
                 * Cancels a merge on a locked page
                 */
                cancelMergeOnLockedPage: function() {
                    var self = this;
                    this.isRunningMerge(false);
                    this.mergePageLockedBy(lockedUsername);
                    this.mergePageLockedResetTimeout = setTimeout(function() {
                        self.mergePageLockedBy("");
                    }, 5000);
                    this.isLoading(false);

                    GoNorth.LockService.releaseCurrentLock();
                    this.acquireLock();
                },
                    
                /**
                 * Cancels the merge process
                 */
                cancelMerge: function() {
                    GoNorth.LockService.releaseCurrentLock();
                    this.acquireLock();
                    this.isRunningMerge(false);
                },

                /**
                 * Checks if a merge tag is focused
                 * @param {object} focusElement Focused element
                 */
                checkMergeFocus: function(focusElement) {
                    var mergeTag = jQuery(focusElement).closest("del,ins");
                    if(mergeTag.length == 0)
                    {
                        this.visibleMergeTags.removeAll();
                        return;
                    }

                    var mergeTags = this.visibleMergeTags();
                    for(let curMergeTag = 0; curMergeTag < mergeTags.length; ++curMergeTag)
                    {
                        if(mergeTags[curMergeTag].elem == mergeTag[0])
                        {
                            return;
                        }
                    }

                    this.visibleMergeTags.removeAll();
                    var position = this.getCalloutPositionFromElement(mergeTag);
                    var mergeElement = {
                        elem: mergeTag[0],
                        left: new ko.observable(position.left),
                        top: new ko.observable(position.top),
                        width: new ko.observable(mergeTag.width()), 
                        height: new ko.observable(mergeTag.height()), 
                        visible: new ko.observable(false)
                    };
                    mergeElement.expandDownwards = new ko.computed(function() {
                        var top = this.top();   // Ensure Update is triggered
                        var visible = this.visible();
                        if(!visible) 
                        {
                            return false;
                        }

                        var mergeTagCallout = jQuery(".gn-kirjaMergeTagCallout");
                        if(mergeTagCallout.length == 0) 
                        {
                            return false;
                        }

                        var editor = jQuery(".gn-kirjaPageRichTextEditor:visible");
                        if(editor.length == 0) 
                        {
                            return false;
                        }

                        var mergeTagContainer = this.elem.getBoundingClientRect();
                        var mergeTagBoundingBox = mergeTagCallout[0].getBoundingClientRect();
                        var containerBoundingBox = editor[0].getBoundingClientRect();
                        return mergeTagBoundingBox.y < containerBoundingBox.y || mergeTagContainer.y - mergeTagBoundingBox.height < containerBoundingBox.y;
                    }, mergeElement);

                    this.visibleMergeTags.push(mergeElement);
                    setTimeout(function() {
                        mergeElement.visible(true);
                    }, 10);
                },

                /**
                 * Gets called if the merge tag position must be updated
                 */
                 updateMergeTagPosition: function() {
                    var mergeTags = this.visibleMergeTags();
                    for(let curMergeTag = 0; curMergeTag < mergeTags.length; ++curMergeTag)
                    {
                        var mergeTagElement = jQuery(mergeTags[curMergeTag].elem);
                        var position = this.getCalloutPositionFromElement(mergeTagElement);
                        mergeTags[curMergeTag].left(position.left);
                        mergeTags[curMergeTag].top(position.top);
                        mergeTags[curMergeTag].width(mergeTagElement.width());
                        mergeTags[curMergeTag].height(mergeTag.height());
                    }
                },

                /**
                 * Accepts or rejects all merge groups
                 * @param {string} keepTag Tags to keep
                 * @param {string} removeTag Tags to remove
                 */
                acceptRejectAllMergeGroups: function(keepTag, removeTag) {
                    var newHtml = this.acceptRejectMergeTagGroup(keepTag, removeTag, "*");
                    this.mergeHtml(newHtml);
                },

                /**
                 * Accepts a merge tag
                 * @param {object} mergeTag Merge Tag
                 * @param {boolean} isAccept True if the tag must be accepted, else false
                 */
                acceptRejectMergeTag: function(mergeTag, isAccept) {
                    var mergeGroupId = jQuery(mergeTag.elem).attr("mergeGroupId");

                    var keepTag = "ins";
                    var removeTag = "del";
                    if(!isAccept) 
                    {
                        keepTag = "del";
                        removeTag = "ins";
                    }

                    this.acceptRejectMergeTagGroup(keepTag, removeTag, mergeGroupId);
                },

                /**
                 * Accepts or rejects a merge tag group
                 * @param {string} keepTag Tag to keep
                 * @param {string} removeTag Tags to remove
                 * @param {string} groupId Id of the group, * for all
                 */
                acceptRejectMergeTagGroup: function(keepTag, removeTag, groupId) {
                    var keepSelector = keepTag;
                    var removeSelector = removeTag;
                    if(groupId != "*") {
                        keepSelector += "[mergeGroupId=\"" + groupId + "\"]";
                        removeSelector += "[mergeGroupId=\"" + groupId + "\"]";
                    }

                    var mergeHtml = jQuery("<div>" + this.mergeHtml() + "</div>");
                    mergeHtml.find(keepSelector).each(function() {
                        jQuery(this).replaceWith(jQuery(this).html());
                    });
                    mergeHtml.find(removeSelector).remove();

                    var newHtml = this.removeEmptyTags(mergeHtml.html());
                
                    jQuery(".gn-kirjaPageRichTextEditor:visible").focus();
                    this.selectAllReviewText();
                    document.execCommand("insertHTML", 0, newHtml);

                    this.visibleMergeTags.removeAll();

                    return newHtml;
                },

                /**
                 * Saves a merge
                 */
                saveMerge: function() {
                    if(!this.checkForUnmergedChanges()) {
                        this.unmergedChangesExist(true);
                        return;
                    }
                    
                    this.unmergedChangesExist(false);

                    var url = "/api/KirjaApi/UpdatePage?id=" + this.reviewedPageId();

                    var request = {
                        name: this.mergePageName(),
                        content: this.getCleanedHtml(this.mergeHtml())
                    };

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.post(url, request).done(function() {
                        GoNorth.LockService.releaseCurrentLock();
                        self.setStatus("Merged").done(function() {
                            self.isRunningMerge(false);
                            self.revokeExternalShareToken();
                        });
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Checks if any unmerged changes exist
                 */
                checkForUnmergedChanges: function() {
                    var mergeCheck = jQuery("<div>" + this.mergeHtml() + "</div>");
                    return mergeCheck.find("ins").length == 0 && mergeCheck.find("del").length == 0;
                },


                /**
                 * Returns the external access token
                 * @returns {string} External access toekn
                 */
                getExternalAccessToken: function() {
                    return GoNorth.Util.getParameterFromUrl("token");
                },


                /**
                 * Triggers a delete for a review 
                 */
                deleteReview: function() {
                    var self = this;
                    GoNorth.PromptService.openYesNoPrompt(Review.areYouSure, Review.areYouSureYouWantToDeleteTheReview).done(function() {
                        var url = "/api/KirjaApi/DeleteReview?id=" + encodeURIComponent(self.id());
                        GoNorth.HttpClient.delete(url, {}).done(function() {
                            self.isLoading(false);
                            self.backToReviewedPage();
                        }).fail(function(xhr) {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    });
                },


                /**
                 * Acquires a lock
                 */
                 acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("KirjaReview", this.id(), false, this.getExternalAccessToken()).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                        }
                        else
                        {
                            self.isReadonly(false);
                            self.lockedByUser("");
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isReadonly(true);
                    });
                }
            });

        }(Kirja.Review = Kirja.Review || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));