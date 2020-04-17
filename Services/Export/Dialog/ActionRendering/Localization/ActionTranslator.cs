using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.Localization
{
    /// <summary>
    /// Interface for translating action types
    /// </summary>
    public class ActionTranslator : IActionTranslator
    {
        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer factory</param>
        public ActionTranslator(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(ActionTranslator));
        }

        /// <summary>
        /// Returns the translated displayname for an action
        /// </summary>
        /// <param name="actionType">Action Type to translate</param>
        public string TranslateActionType(ActionType actionType)
        {
            return _localizer[string.Format("ActionType{0}", actionType.ToString())];
        }
    }
}