using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Interface for a single topic kirja page parser
    /// </summary>
    public interface IKirjaParser
    {
        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        void ParsePage(KirjaPage page);
    }
}