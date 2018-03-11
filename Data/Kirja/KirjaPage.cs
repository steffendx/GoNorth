using System;
using System.Collections.Generic;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja Page
    /// </summary>
    public class KirjaPage : IHasModifiedData
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id of the Page
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// true if the page is the default page for the project, else false
        /// </summary>
        public bool IsDefault { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Content of the page
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Mentioned Kirja Pages
        /// </summary>
        public List<string> MentionedKirjaPages { get; set; }

        /// <summary>
        /// Mentioned Quests
        /// </summary>
        public List<string> MentionedQuests { get; set; }

        /// <summary>
        /// Mentioned Npcs
        /// </summary>
        public List<string> MentionedNpcs { get; set; }

        /// <summary>
        /// Mentioned Items
        /// </summary>
        public List<string> MentionedItems { get; set; }

        /// <summary>
        /// Mentioned Skills
        /// </summary>
        public List<string> MentionedSkills { get; set; }

        /// <summary>
        /// Images that were uploaded to the article
        /// </summary>
        public List<string> UplodadedImages { get; set; }


        /// <summary>
        /// Attachments of the page
        /// </summary>
        public List<KirjaPageAttachment> Attachments { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the page
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}