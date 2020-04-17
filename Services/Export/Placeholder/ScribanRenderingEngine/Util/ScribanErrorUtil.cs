using Scriban.Parsing;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Utility class to for Scriban Errors
    /// </summary>
    public static class ScribanErrorUtil
    {
        /// <summary>
        /// Returns a span for error display
        /// </summary>
        /// <param name="span">Span</param>
        /// <returns>Formatted span</returns>
        public static string FormatScribanSpan(SourceSpan span)
        {
            return string.Format("({0}, {1})", span.Start.Line + 1, span.Start.Column);
        }
    }
}