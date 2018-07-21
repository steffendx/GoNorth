using System;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Export Settings
    /// </summary>
    public class ExportSettings : IHasModifiedData
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Script Language
        /// </summary>
        public string ScriptLanguage { get; set; }

        /// <summary>
        /// Script Extension
        /// </summary>
        public string ScriptExtension { get; set; }

        /// <summary>
        /// Escape Character
        /// </summary>
        public string EscapeCharacter { get; set; }

        /// <summary>
        /// Characters that need escaping
        /// </summary>
        public string CharactersNeedingEscaping { get; set; }

        /// <summary>
        /// New Line Character
        /// </summary>
        public string NewlineCharacter { get; set; }


        /// <summary>
        /// Language File language
        /// </summary>
        public string LanguageFileLanguage { get; set; }

        /// <summary>
        /// Language File extension
        /// </summary>
        public string LanguageFileExtension { get; set; }

        /// <summary>
        /// Language File escape Character
        /// </summary>
        public string LanguageEscapeCharacter { get; set; }

        /// <summary>
        /// Language File characters that need escaping
        /// </summary>
        public string LanguageCharactersNeedingEscaping { get; set; }

        /// <summary>
        /// Language new line Character
        /// </summary>
        public string LanguageNewlineCharacter { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the template
        /// </summary>
        public string ModifiedBy { get; set; }


        /// <summary>
        /// Creates the default export settings
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Export settings</returns>
        public static ExportSettings CreateDefaultExportSettings(string projectId)
        {
            ExportSettings preferences = new ExportSettings();
            preferences.Id = string.Empty;
            preferences.ProjectId = projectId;

            preferences.ScriptLanguage = "ace/mode/lua";
            preferences.ScriptExtension = "lua";
            preferences.EscapeCharacter = "\\";
            preferences.CharactersNeedingEscaping = "\"'\\";
            preferences.NewlineCharacter = "\\n";

            preferences.LanguageFileLanguage = "ace/mode/ini";
            preferences.LanguageFileExtension = "ini";
            preferences.LanguageEscapeCharacter = "";
            preferences.LanguageCharactersNeedingEscaping = "";
            preferences.LanguageNewlineCharacter = "\\n";

            preferences.ModifiedBy = string.Empty;
            preferences.ModifiedOn = DateTimeOffset.MinValue;
            return preferences;
        }
    };
}