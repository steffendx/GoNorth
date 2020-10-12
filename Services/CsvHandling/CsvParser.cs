using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;

namespace GoNorth.Services.CsvHandling
{
    /// <summary>
    /// Interface for reading CSV-File
    /// </summary>
    public class CsvParser : ICsvParser
    {
        /// <summary>
        /// Possible CSV Delimiters
        /// </summary>
        private readonly List<string> PossibleDelimiters = new List<string> { ",", ";", "\t", "|" };

        /// <summary>
        /// Reads a CSV-File
        /// </summary>
        /// <param name="csvStream">CSV Stream Reader</param>
        /// <returns>CSV-Content</returns>
        public async Task<CsvReadResult> ReadCsvFile(Stream csvStream) 
        {
            CsvReadResult readResult = new CsvReadResult();

            using(StreamReader streamReader = new StreamReader(csvStream))
            {
                string delimiter = await DetectDelimiter(csvStream, streamReader);

                CsvConfiguration configuration = new CsvConfiguration(CultureInfo.CurrentUICulture);
                configuration.Delimiter = delimiter;
                using (CsvReader csvReader = new CsvReader(streamReader, configuration))
                {
                    while (await csvReader.ReadAsync())
                    {
                        IDictionary<string, object> rowValues = csvReader.GetRecord<dynamic>() as IDictionary<string, object>;
                        if (rowValues == null)
                        {
                            continue;
                        }

                        AddMissingHeaders(readResult, rowValues);

                        readResult.Rows.Add(ReadRow(readResult.Columns, rowValues));
                    }
                }
            }

            return readResult;
        }

        /// <summary>
        /// Detects the delimiter of a CSV File
        /// </summary>
        /// <param name="csvStream">CSV Stream</param>
        /// <param name="streamReader">Stream Reader</param>
        /// <returns>Delimiter</returns>
        private async Task<string> DetectDelimiter(Stream csvStream, StreamReader streamReader)
        {
            string headerLine = await streamReader.ReadLineAsync();
            csvStream.Seek(0, SeekOrigin.Begin);
            streamReader.DiscardBufferedData();

            foreach (var possibleDelimiter in PossibleDelimiters)
            {
                if (headerLine.Contains(possibleDelimiter))
                {
                    return possibleDelimiter;
                }
            }

            return PossibleDelimiters[0];
        }

        /// <summary>
        /// Adds missing headers to a read result
        /// </summary>
        /// <param name="readResult">Read result</param>
        /// <param name="rowValues">Row values</param>
        private void AddMissingHeaders(CsvReadResult readResult, IDictionary<string, object> rowValues)
        {
            List<string> missingHeaders = rowValues.Keys.Where(k => !readResult.Columns.Contains(k)).ToList();
            if(!missingHeaders.Any())
            {
                return;
            }

            readResult.Columns.AddRange(missingHeaders);
            readResult.Rows.ForEach(r => missingHeaders.ForEach(h => r.Add(h, string.Empty)));
        }

        /// <summary>
        /// Reads a row
        /// </summary>
        /// <param name="columns">Columns to read</param>
        /// <param name="rowValues">Row values</param>
        /// <returns>Read row</returns>
        private Dictionary<string, string> ReadRow(List<string> columns, IDictionary<string, object> rowValues)
        {
            Dictionary<string, string> row = new Dictionary<string, string>();
            foreach(string curCol in columns)
            {
                string fieldValue = string.Empty;
                if(rowValues.ContainsKey(curCol) && rowValues[curCol] != null)
                {
                    fieldValue = rowValues[curCol].ToString();
                }

                row.Add(curCol, fieldValue);
            }

            return row;
        }
    }
}
