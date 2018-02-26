using System.Collections.Generic;
using System.Globalization;

namespace GoNorth.Localization
{
    /// <summary>
    /// Json Localization Options
    /// </summary>
    public class JsonLocalizationOptions
    {
        /// <summary>
        /// Resources Path
        /// </summary>
        public string ResourcesPath { get; set; }

        /// <summary>
        /// Fallback Culture
        /// </summary>
        public CultureInfo FallbackCulture { get; set; }
    }
}