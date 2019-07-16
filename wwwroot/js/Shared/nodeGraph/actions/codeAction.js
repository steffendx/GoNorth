(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for entering a code
            var actionTypeCode = 28;

            /**
             * Code Action
             * @class
             */
            Actions.CodeAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.CodeAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.CodeAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'><a class='gn-clickable gn-nodeActionScriptName'>" + DefaultNodeShapes.Localization.Actions.ClickHereToEditCode + "</a></div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.CodeAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var scriptName = contentElement.find(".gn-nodeActionScriptName");
                scriptName.click(function(e) {
                    self.openCodeEditor();
                });
            };

            /**
             * Opens the code editor
             */
            Actions.CodeAction.prototype.openCodeEditor = function() {
                var actionData = null;
                try
                {
                    actionData = JSON.parse(this.nodeModel.get("actionData"));
                }
                catch(e) 
                {
                }

                var scriptName = "";
                var scriptCode = "";
                if(actionData) 
                {
                    scriptName = actionData.scriptName;
                    scriptCode = actionData.scriptCode;
                }
                
                var self = this;
                DefaultNodeShapes.openCodeEditor(scriptName, scriptCode).then(function(codeResult) {
                    var serializeData = {
                        scriptName: codeResult.name,
                        scriptCode: codeResult.code
                    }; 
                    
                    self.nodeModel.set("actionData", JSON.stringify(serializeData));
                    self.contentElement.find(".gn-nodeActionScriptName").text(serializeData.scriptName);
                });
            };

            /**
             * Deserializes the data
             */
            Actions.CodeAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionScriptName").text(data.scriptName);
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.CodeAction.prototype.buildAction = function() {
                return new Actions.CodeAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.CodeAction.prototype.getType = function() {
                return actionTypeCode;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.CodeAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.CodeActionLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.CodeAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));