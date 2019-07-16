(function (GoNorth) {
    "use strict";
    (function (Kortisto) {
        (function (Npc) {

            /**
             * Skill Form
             * @param {GoNorth.ChooseObjectDialog.ViewModel} objectDialog Object dialog
             * @class
             */
            Npc.SkillForm = function (objectDialog) {
                this.objectDialog = objectDialog;

                this.areSkillsExpanded = new ko.observable(false);
                this.learnedSkills = new ko.observableArray();
                this.skillToRemove = null;
                this.showConfirmRemoveDialog = new ko.observable(false);
                this.isLoadingSkills = new ko.observable(false);
                this.loadingSkillsError = new ko.observable(false);
            };

            Npc.SkillForm.prototype = {
                /**
                 * Loads the skills of the npc
                 * 
                 * @param {object[]} skills Skills of the npc
                 */
                loadSkills: function (skills) {
                    var learnedSkillIds = [];
                    for (var curSkill = 0; curSkill < skills.length; ++curSkill) {
                        learnedSkillIds.push(skills[curSkill].skillId);
                    }

                    this.isLoadingSkills(true);
                    this.loadingSkillsError(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/EvneApi/ResolveFlexFieldObjectNames",
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(learnedSkillIds),
                        type: "POST",
                        contentType: "application/json"
                    }).done(function (skillNames) {
                        var loadedSkills = [];
                        for (var curSkill = 0; curSkill < skillNames.length; ++curSkill) {
                            loadedSkills.push({
                                id: skillNames[curSkill].id,
                                name: skillNames[curSkill].name,
                            });
                        }

                        self.learnedSkills(loadedSkills);
                        self.isLoadingSkills(false);
                    }).fail(function (xhr) {
                        self.learnedSkills([]);
                        self.isLoadingSkills(false);
                        self.loadingSkillsError(true);
                    });
                },

                /**
                 * Serializes the skills
                 * 
                 * @returns {object[]} Serialized skills
                 */
                serializeSkills: function () {
                    var skills = [];
                    var learnedSkills = this.learnedSkills();
                    for (var curSkill = 0; curSkill < learnedSkills.length; ++curSkill) {
                        var skill = {
                            skillId: learnedSkills[curSkill].id
                        };
                        skills.push(skill);
                    }

                    return skills;
                },

                /**
                 * Toggles the skill visibility
                 */
                toogleSkillVisibility: function () {
                    this.areSkillsExpanded(!this.areSkillsExpanded());
                },

                /**
                 * Opens a dialog to add a new skill
                 */
                addSkill: function () {
                    var self = this;
                    this.objectDialog.openSkillSearch(Npc.Localization.AddSkill).then(function (skill) {
                        if (Npc.doesObjectExistInFlexFieldArray(self.learnedSkills, skill)) {
                            return;
                        }

                        self.learnedSkills.push({
                            id: skill.id,
                            name: skill.name
                        });

                        self.learnedSkills.sort(function (skill1, skill2) {
                            return skill1.name.localeCompare(skill2.name);
                        });
                    });
                },

                /**
                 * Builds the url for a skill
                 * 
                 * @param {object} skill Skill which should be opened
                 * @returns {string} Url for the skill
                 */
                buildSkillUrl: function (skill) {
                    return "/Evne/Skill?id=" + skill.id;
                },

                /**
                 * Removes a skill
                 * 
                 * @param {object} skill Skill to remove
                 */
                openRemoveSkillDialog: function (skill) {
                    this.skillToRemove = skill;
                    this.showConfirmRemoveDialog(true);
                },

                /**
                 * Removes the object which should be removed
                 */
                removeSkill: function () {
                    if (this.skillToRemove) {
                        this.learnedSkills.remove(this.skillToRemove);
                    }

                    this.closeConfirmRemoveDialog();
                },

                /**
                 * Closes the confirm remove dialog
                 */
                closeConfirmRemoveDialog: function () {
                    this.skillToRemove = null;
                    this.showConfirmRemoveDialog(false);
                }
            };

        }(Kortisto.Npc = Kortisto.Npc || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));