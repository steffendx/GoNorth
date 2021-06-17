using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using GoNorth.Authentication;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Service to format timeline entries as HTML
    /// </summary>
    public class HtmlTimelineTemplateService : ITimelineTemplateService
    {
        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public HtmlTimelineTemplateService(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(HtmlTimelineTemplateService));
        }

        /// <summary>
        /// Formats a timeline entry
        /// </summary>
        /// <param name="entry">Entry</param>
        /// <returns>Formatted timeline entry</returns>
        public FormattedTimelineEntry FormatTimelineEntry(TimelineEntry entry)
        {
            string[] escapedValues = entry.AdditionalValues.Select(s => HtmlEncoder.Default.Encode(s)).ToArray();

            FormattedTimelineEntry formattedEntry = new FormattedTimelineEntry();
            formattedEntry.Timestamp = entry.Timestamp.ToLocalTime();
            formattedEntry.UserDisplayName = entry.Username != ExternalUserConstants.ExternalUserLoginName ? entry.UserDisplayName : _localizer["ExternalUserDisplayName"];
            try
            {
                formattedEntry.Content = _localizer[entry.Event.ToString(), escapedValues];
            }
            catch(FormatException)
            {
                // Handle case that template was updated and has new placeholder for old values
                List<string> extendedArguments = new List<string>(escapedValues);
                extendedArguments.AddRange(new List<string> {  string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty });
                formattedEntry.Content = _localizer[entry.Event.ToString(), extendedArguments.ToArray()];
            }

            return formattedEntry;
        }
    }
}
