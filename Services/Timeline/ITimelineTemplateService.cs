namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Interface for Timeline Template Service
    /// </summary>
    public interface ITimelineTemplateService
    {
        /// <summary>
        /// Formats a timeline entry
        /// </summary>
        /// <param name="entry">Entry</param>
        /// <returns>Formatted timeline entry</returns>
        FormattedTimelineEntry FormatTimelineEntry(TimelineEntry entry);
    }
}