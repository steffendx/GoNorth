using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GoNorth.Logging
{
    /// <summary>
    /// An <see cref="ILoggerProvider" /> that writes logs to a file
    /// </summary>
    [ProviderAlias("File")]
    public class FileLoggerProvider : BatchingLoggerProvider
    {
        /// <summary>
        /// Path
        /// </summary>
        private readonly string _path;

        /// <summary>
        /// Filename
        /// </summary>
        private readonly string _fileName;

        /// <summary>
        /// Max File Size
        /// </summary>
        private readonly int? _maxFileSize;

        /// <summary>
        /// Max reatined files
        /// </summary>
        private readonly int? _maxRetainedFiles;

        /// <summary>
        /// Creates an instance of the <see cref="FileLoggerProvider" /> 
        /// </summary>
        /// <param name="options">The options object controlling the logger</param>
        public FileLoggerProvider(IOptions<FileLoggerOptions> options) : base(options)
        {
            FileLoggerOptions loggerOptions = options.Value;
            _path = loggerOptions.LogDirectory;
            _fileName = loggerOptions.FileName;
            _maxFileSize = loggerOptions.FileSizeLimit;
            _maxRetainedFiles = loggerOptions.RetainedFileCountLimit;
        }

        /// <summary>
        /// Write Messages Function
        /// </summary>
        /// <param name="messages">Messages to wrtei</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        protected override async Task WriteMessagesAsync(IEnumerable<LogMessage> messages, CancellationToken cancellationToken)
        {
            Directory.CreateDirectory(_path);

            foreach (IGrouping<(int Year, int Month, int Day), LogMessage> group in messages.GroupBy(GetGrouping))
            {
                string fullName = GetFullName(group.Key);
                FileInfo fileInfo = new FileInfo(fullName);
                if (_maxFileSize > 0 && fileInfo.Exists && fileInfo.Length > _maxFileSize)
                {
                    return;
                }

                using (StreamWriter streamWriter = File.AppendText(fullName))
                {
                    foreach (LogMessage item in group)
                    {
                        await streamWriter.WriteAsync(item.Message);
                    }
                }
            }

            RollFiles();
        }

        /// <summary>
        /// Gets the fullname for a file
        /// </summary>
        /// <param name="group">Group for the filename</param>
        /// <returns>File</returns>
        private string GetFullName((int Year, int Month, int Day) group)
        {
            return Path.Combine(_path, $"{_fileName}{group.Year:0000}{group.Month:00}{group.Day:00}.log");
        }

        /// <summary>
        /// Returns the grouping
        /// </summary>
        /// <param name="message">Message</param>
        /// <returns>Grouping</returns>
        private (int Year, int Month, int Day) GetGrouping(LogMessage message)
        {
            return (message.Timestamp.Year, message.Timestamp.Month, message.Timestamp.Day);
        }

        /// <summary>
        /// Deletes old log files, keeping a number of files defined by <see cref="FileLoggerOptions.RetainedFileCountLimit" />
        /// </summary>
        protected void RollFiles()
        {
            if (_maxRetainedFiles > 0)
            {
                IEnumerable<FileInfo> files = new DirectoryInfo(_path).GetFiles(_fileName + "*").OrderByDescending(f => f.Name).Skip(_maxRetainedFiles.Value);

                foreach (FileInfo item in files)
                {
                    item.Delete();
                }
            }
        }
    }
}