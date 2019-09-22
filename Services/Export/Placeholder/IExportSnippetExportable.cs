namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for objects that can be exported with export snippets
    /// </summary>
    public interface IExportSnippetExportable
    {
        /// <summary>
        /// Id
        /// </summary>
        string Id { get; set; }
    }
}