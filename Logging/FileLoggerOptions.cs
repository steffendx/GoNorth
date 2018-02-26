using System;

namespace GoNorth.Logging
{
    /// <summary>
    /// Options for file logging.
    /// </summary>
    public class FileLoggerOptions : BatchingLoggerOptions
    {
        /// <summary>
        /// File Size Limit
        /// </summary>
        private int? _fileSizeLimit = 10 * 1024 * 1024;

        /// <summary>
        /// Retained file count limit
        /// </summary>
        private int? _retainedFileCountLimit = 2;

        /// <summary>
        /// Filename
        /// </summary>
        private string _fileName = "logs-";
        

        /// <summary>
        /// Gets or sets a strictly positive value representing the maximum log size in bytes or null for no limit.
        /// Once the log is full, no more messages will be appended.
        /// Defaults to <c>10MB</c>.
        /// </summary>
        public int? FileSizeLimit
        {
            get { return _fileSizeLimit; }
            set
            {
                if (value <= 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), $"{nameof(FileSizeLimit)} must be positive.");
                }
                _fileSizeLimit = value;
            }
        }

        /// <summary>
        /// Gets or sets a strictly positive value representing the maximum retained file count or null for no limit.
        /// Defaults to <c>2</c>.
        /// </summary>
        public int? RetainedFileCountLimit
        {
            get { return _retainedFileCountLimit; }
            set
            {
                if (value <= 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), $"{nameof(RetainedFileCountLimit)} must be positive.");
                }
                _retainedFileCountLimit = value;
            }
        }

        /// <summary>
        /// Gets or sets the filename prefix to use for log files.
        /// Defaults to <c>logs-</c>.
        /// </summary>
        public string FileName
        {
            get { return _fileName; }
            set
            {
                if (string.IsNullOrEmpty(value))
                {
                    throw new ArgumentException(nameof(value));
                }
                _fileName = value;
            }
        }

        /// <summary>
        /// The directory in which log files will be written, relative to the app process.
        /// Default to <c>Logs</c>
        /// </summary>
        public string LogDirectory { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        public FileLoggerOptions()
        {
            LogDirectory = "Logs";
        }
    }
}