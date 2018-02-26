(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Actions) {

            /**
             * Set Quest State Action
             * @class
             */
            Actions.ChangeQuestInNpcDialogBaseAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.ChangeQuestInNpcDialogBaseAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.ChangeQuestInNpcDialogBaseAction.prototype = jQuery.extend(Actions.ChangeQuestInNpcDialogBaseAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectNpc gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenDialog' title='" + Aika.Localization.Actions.OpenDialogTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        this.getAdditionalContent() +
                        "<div class='gn-aikaActionChangeQuestDialogValidationResult text-danger' style='display: none'>" + this.getValidationFailedText() + "</div>" +
                        "<div class='gn-aikaActionChangeQuestDialogMissingPermissions text-danger' style='display: none'>" + Aika.Localization.Actions.NpcDialogCheckMissingPermissions + "</div>";
            };

            /**
             * Returns additional HTML Content of the action
             * 
             * @returns {string} Additional HTML Content of the action
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.getAdditionalContent = function() {
                return "";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectNpc").text(Aika.Localization.Actions.ChooseNpcLabel);

                var dialogOpenLink = contentElement.find(".gn-nodeActionOpenDialog");

                this.initializeAdditional(contentElement, actionNode);

                // Deserialize
                var existingNpcId = this.deserializeData();
                if(existingNpcId)
                {
                    dialogOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    var nameDeferred = this.loadNpcName(existingNpcId);
                    nameDeferred.then(function(name) {
                        contentElement.find(".gn-nodeActionSelectNpc").text(name);
                    });

                    var validationDeferred = this.validateDialogNodeExists();

                    jQuery.when(nameDeferred, validationDeferred).then(function(name) {
                        actionNode.hideLoading();
                    }, function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectNpcAction = contentElement.find(".gn-nodeActionSelectNpc");
                contentElement.find(".gn-nodeActionSelectNpc").on("click", function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(quest) {
                        selectNpcAction.data("npcid", quest.id);
                        selectNpcAction.text(quest.name);
                        self.saveData();

                        dialogOpenLink.show();

                        self.validateDialogNodeExistsWithLoadingIndicator(actionNode);
                    });
                });

                contentElement.find(".gn-nodeActionOpenDialog").on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        var taleWindow = window.open("/Tale#npcId=" + selectNpcAction.data("npcid"));
                        taleWindow.taleDialogSaved = function() {
                            self.clearLoadedSharedObject();
                            self.validateDialogNodeExistsWithLoadingIndicator(actionNode);
                        };
                    }
                });
            };

            /**
             * Intializes additional values
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.initializeAdditional = function() {
                
            };

            /**
             * Returns the text which is displayed if the validation failed
             * 
             * @returns {string} Text which is displayed if the validation fails
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.getValidationFailedText = function() {
                return "";
            };

            /**
             * Validates that the dialog node exists and shows the loading process
             * 
             * @param {object} actionNode Action Node
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.validateDialogNodeExistsWithLoadingIndicator = function(actionNode) {
                actionNode.showLoading();
                actionNode.hideError();
                this.validateDialogNodeExists().then(function(name) {
                    actionNode.hideLoading();
                }, function(xhr) {
                    actionNode.hideLoading();
                    actionNode.showError();
                });
            };

            /**
             * Validates that the dialog node exists
             * 
             * @returns {jQuery.Deferred} Deferred for the loading Process
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.validateDialogNodeExists = function() {
                var objectDef = this.loadObjectShared();

                var self = this;
                objectDef.done(function(dialog) {
                    if(!dialog || !dialog.action) {
                        self.contentElement.find(".gn-aikaActionChangeQuestDialogValidationResult").show();
                    }

                    var isValid = false;
                    for(var curAction = 0; curAction < dialog.action.length; ++curAction)
                    {
                        if(self.isActionNodeValid(dialog.action[curAction]))
                        {
                            isValid = true;
                            break;
                        }
                    }

                    if(!isValid)
                    {
                        self.contentElement.find(".gn-aikaActionChangeQuestDialogValidationResult").show();
                    }
                    else
                    {
                        self.contentElement.find(".gn-aikaActionChangeQuestDialogValidationResult").hide();
                    }
                });

                return objectDef;
            };

            /**
             * Validates if a node is valid and fullfiles the search criterias
             * 
             * @param {object} actionNode Action node to validate
             * @returns {bool} true if the node is valid, else false
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.isActionNodeValid = function(actionNode) {
                return false;
            };

            /**
             * Deserializes the data
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var npcId = "";
                if(data.npcId)
                {
                    this.contentElement.find(".gn-nodeActionSelectNpc").data("npcid", data.npcId);
                    npcId = data.npcId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectNpc").data("npcid", "");
                }

                this.deserializeAdditionalData(data);

                return npcId;
            };
            
            /**
             * Deserializes additional data
             * 
             * @param {object} data Deserialized data
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.deserializeAdditionalData = function(data) {
            };

            /**
             * Saves the data
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.saveData = function() {
                var npcId = this.getObjectId();
                var serializeData = {
                    npcId: npcId
                };

                this.saveAdditionalData(serializeData);

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Saves additional data
             * 
             * @param {object} serializeData Already serialized data
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.saveAdditionalData = function(serializeData) {

            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectNpc").data("npcid");
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceDialogs;
            };

            /**
             * Loads the quest
             * 
             * @param {string} npcId Quest Id
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.loadObject = function(npcId) {
                var def = new jQuery.Deferred();

                if(!GoNorth.Aika.Quest.hasTaleRights)
                {
                    this.contentElement.find(".gn-aikaActionChangeQuestDialogMissingPermissions").show();
                    def.reject();
                    return;
                }

                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/GetDialogByRelatedObjectId?relatedObjectId=" + npcId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Loads the npc name
             * 
             * @param {string} npcId Id of the npc
             */
            Actions.ChangeQuestInNpcDialogBaseAction.prototype.loadNpcName = function(npcId) {
                var def = new jQuery.Deferred();

                if(!GoNorth.Aika.Quest.hasKortistoRights)
                {
                    this.contentElement.find(".gn-aikaActionChangeQuestDialogMissingPermissions").show();
                    def.reject();
                    return;
                }

                jQuery.ajax({ 
                    url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify([ npcId ]), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(itemNames) {
                    if(itemNames.length == 0)
                    {
                        def.reject();
                        return;
                    }

                    def.resolve(itemNames[0].name);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(Aika.Actions = Aika.Actions || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));