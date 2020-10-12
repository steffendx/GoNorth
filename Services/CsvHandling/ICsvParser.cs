using System.IO;
using System.Threading.Tasks;

namespace GoNorth.Services.CsvHandling
{
    /// <summary>
    /// Interface for reading CSV-File
    /// </summary>
    public interface ICsvParser
    {
        /// <summary>
        /// Reads a CSV-File
        /// </summary>
        /// <param name="csvStream">CSV Stream Reader</param>
        /// <returns>CSV-Content</returns>
        Task<CsvReadResult> ReadCsvFile(Stream csvStream);
    }
}
