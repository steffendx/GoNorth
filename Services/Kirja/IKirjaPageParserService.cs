using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Interface for a Services which parses complete kirja pages
    /// </summary>
    public interface IKirjaPageParserService
    {
        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        void ParsePage(KirjaPage page);
    }
}