(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Learn or Forget a Skill Action
             * @class
             */
            Actions.LearnForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.LearnForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.LearnForgetSkillAction.prototype = jQuery.extend(Actions.LearnForgetSkillAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.LearnForgetSkillAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectSkill gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenSkill' title='" + DefaultNodeShapes.Localization.Actions.OpenSkillTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.LearnForgetSkillAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectSkill").html(DefaultNodeShapes.Localization.Actions.ChooseSkillLabel);

                var skillOpenLink = contentElement.find(".gn-nodeActionOpenSkill");

                // Deserialize
                var existingSkillId = this.deserializeData();
                if(existingSkillId)
                {
                    skillOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingSkillId).then(function(skill) {
                        contentElement.find(".gn-nodeActionSelectSkill").text(skill.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectSkillAction = contentElement.find(".gn-nodeActionSelectSkill");
                contentElement.find(".gn-nodeActionSelectSkill").on("click", function() {
                    DefaultNodeShapes.openSkillSearchDialog().then(function(skill) {
                        selectSkillAction.data("skillid", skill.id);
                        selectSkillAction.text(skill.name);
                        self.saveData();

                        skillOpenLink.show();
                    });
                });

                skillOpenLink.on("click", function() {
                    if(selectSkillAction.data("skillid"))
                    {
                        window.open("/Evne/Skill?id=" + selectSkillAction.data("skillid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * 
             * @returns {string} Id of the selected skill
             */
            Actions.LearnForgetSkillAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var skillId = "";
                if(data.skillId)
                {
                    this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid", data.skillId);
                    skillId = data.skillId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid", "");
                }

                return skillId;
            }

            /**
             * Saves the data
             */
            Actions.LearnForgetSkillAction.prototype.saveData = function() {
                var skillId = this.getObjectId();
                var serializeData = {
                    skillId: skillId
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", this.getObjectTypeName());
                this.nodeModel.set("actionRelatedToObjectId", skillId);
            }

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.LearnForgetSkillAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectSkill;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.LearnForgetSkillAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid");
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.LearnForgetSkillAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @param {string} skillId Skill Id
             * @returns {jQuery.Deferred} Deferred for the skill loading
             */
            Actions.LearnForgetSkillAction.prototype.loadObject = function(skillId) {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + skillId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));