(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Base class for changing the value of object to pick
             * @class
             */
            Actions.ChangeValueChooseObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeValueChooseObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeValueChooseObjectAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<select class='gn-actionNodeAttributeSelect'></select>" +
                        "<select class='gn-actionNodeAttributeOperator'></select>" +
                        "<input type='text' class='gn-actionNodeAttributeChange'/>";
            };

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeValueChooseObjectAction.prototype.getChooseLabel = function() {
                return "NOT IMPLEMENTED";
            };

            /**
             * Returns the open object tool label
             * 
             * @returns {string} Open object label
             */
            Actions.ChangeValueChooseObjectAction.prototype.getOpenObjectTooltip = function() {
                return "NOT IMPLEMENTED";
            };

            /**
             * Returns true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             * 
             * @returns {bool} true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             */
            Actions.ChangeValueChooseObjectAction.prototype.isUsingIndividualObjectId = function() {
                return true;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeValueChooseObjectAction.prototype.getObjectId = function(existingData) {
                return this.nodeModel.get("objectId");
            };

            /**
             * Returns the names of the custom action attributes
             * 
             * @returns {string[]} Name of the custom action attributes
             */
            Actions.ChangeValueChooseObjectAction.prototype.getCustomActionAttributes = function() {
                return [ "objectId" ];
            };

            /**
             * Returns true if the object can be loaded, else false
             * 
             * @returns {bool} true if the object can be loaded, else false
             */
            Actions.ChangeValueChooseObjectAction.prototype.canLoadObject = function() {
                return !!this.nodeModel.get("objectId");
            };

            /**
             * Opens the object
             * @param {string} id Id of the object
             */
            Actions.ChangeValueChooseObjectAction.prototype.openObject = function(id) {

            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeValueChooseObjectAction.prototype.openSearchDialog = function() {
            };

            /**
             * Parses additional data
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             * @param {object} fieldObject Loaded Field object
             */
            Actions.ChangeValueChooseObjectAction.prototype.parseAdditionalData = function(contentElement, actionNode, fieldObject) {
                contentElement.find(".gn-actionNodeObjectSelect").text(fieldObject.name);
            };

            /**
             * Runs additional initialize actions
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueChooseObjectAction.prototype.onInitializeAdditional = function(contentElement, actionNode) {
                var self = this;

                var openObjectLink = contentElement.find(".gn-nodeActionOpenObject");

                contentElement.find(".gn-actionNodeObjectSelect").on("click", function() {
                    self.openSearchDialog().then(function(fieldObject) {
                        self.nodeModel.set("objectId", fieldObject.id);
                        self.loadFields(contentElement, actionNode);

                        contentElement.find(".gn-actionNodeObjectSelect").text(fieldObject.name);

                        openObjectLink.show();
                    });
                });

                if(this.nodeModel.get("objectId"))
                {
                    openObjectLink.show();
                }

                openObjectLink.on("click", function() {
                    var objectId = self.nodeModel.get("objectId");
                    if(objectId) 
                    {
                        self.openObject(objectId);
                    }
                });
            };

            /**
             * Serializes additional data
             * 
             * @param {object} serializeData Existing Serialize Data
             */
            Actions.ChangeValueChooseObjectAction.prototype.serializeAdditionalData = function(serializeData) {
                serializeData.objectId = this.nodeModel.get("objectId") ? this.nodeModel.get("objectId") : null;
            };

            /**
             * Deserializes data before loading data
             */
            Actions.ChangeValueChooseObjectAction.prototype.deserializePreLoadData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return;
                }

                var data = JSON.parse(actionData);
                this.nodeModel.set("objectId", data.objectId);
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));