using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using GoNorth.Config;
using Microsoft.Extensions.Options;

namespace GoNorth.Services.CsvHandling
{
    /// <summary>
    /// Interface for generating CSV-File
    /// </summary>
    public class CsvGenerator : ICsvGenerator
    {
        /// <summary>
        /// Delimiter
        /// </summary>
        private readonly string _delimiter;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration Data</param>
        public CsvGenerator(IOptions<ConfigurationData> configuration)
        {
            _delimiter = configuration.Value.Misc.CsvDelimiter;
        }
        
        /// <summary>
        /// Generates a CSV-File
        /// </summary>
        /// <param name="headerNames">Header names</param>
        /// <param name="fieldValues">Field values</param>
        /// <returns>CSV-Content</returns>
        public async Task<string> GenerateCsvFile(List<string> headerNames, List<Dictionary<string, string>> fieldValues)
        {
            using(TextWriter writer = new StringWriter())
            {
                CsvConfiguration configuration = new CsvConfiguration(CultureInfo.CurrentUICulture)
                {
                    Delimiter = _delimiter
                };
                using(CsvWriter csvWriter = new CsvWriter(writer, configuration))
                {
                    await WriteHeader(csvWriter, headerNames);
                    foreach(Dictionary<string, string> curRow in fieldValues)
                    {
                        foreach(string curHeader in headerNames)
                        {
                            string fieldValue = string.Empty;
                            if(curRow.ContainsKey(curHeader))
                            {
                                fieldValue = curRow[curHeader];
                            }

                            csvWriter.WriteField(fieldValue);
                        }
                        await csvWriter.NextRecordAsync();
                    }
                }

                return writer.ToString();
            }
        }

        /// <summary>
        /// Builds the CSV Header row
        /// </summary>
        /// <param name="csvWriter">CSV Writer</param>
        /// <param name="headerNames">Header names</param>
        /// <returns>CSV Header row</returns>
        private async Task WriteHeader(CsvWriter csvWriter, List<string> headerNames)
        {
            foreach(string curHeader in headerNames)
            {
                csvWriter.WriteField(curHeader);
            }

            await csvWriter.NextRecordAsync();
        }

    }
}
