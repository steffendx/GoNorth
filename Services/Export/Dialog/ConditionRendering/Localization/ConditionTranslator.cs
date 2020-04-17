using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.Localization
{
    /// <summary>
    /// Class for translating condition types
    /// </summary>
    public class ConditionTranslator : IConditionTranslator
    {
        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer factory</param>
        public ConditionTranslator(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(ConditionTranslator));
        }

        /// <summary>
        /// Returns the translated displayname for a condition
        /// </summary>
        /// <param name="conditionType">Condition Type to translate</param>
        public string TranslateConditionType(ConditionType conditionType)
        {
            return _localizer[string.Format("ConditionType{0}", conditionType.ToString())];
        }
    }
}