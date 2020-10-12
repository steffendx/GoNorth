using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Services.CsvHandling
{
    /// <summary>
    /// Interface for generating CSV-File
    /// </summary>
    public interface ICsvGenerator
    {
        /// <summary>
        /// Generates a CSV-File
        /// </summary>
        /// <param name="headerNames">Header names</param>
        /// <param name="fieldValues">Field values</param>
        /// <returns>CSV-Content</returns>
        Task<string> GenerateCsvFile(List<string> headerNames, List<Dictionary<string, string>> fieldValues);
    }
}
