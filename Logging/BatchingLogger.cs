using System;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Logging;

namespace GoNorth.Logging
{
    /// <summary>
    /// Batching Logger
    /// </summary>
    public class BatchingLogger : ILogger
    {
        /// <summary>
        /// Logging Provider
        /// </summary>
        private readonly BatchingLoggerProvider _provider;

        /// <summary>
        /// Category
        /// </summary>
        private readonly string _category;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="loggerProvider">Logger Provider</param>
        /// <param name="categoryName">Category name</param>
        public BatchingLogger(BatchingLoggerProvider loggerProvider, string categoryName)
        {
            _provider = loggerProvider;
            _category = categoryName;
        }

        /// <summary>
        /// Beginns a scope
        /// </summary>
        /// <param name="state">State</param>
        /// <returns>Scope</returns>
        public IDisposable BeginScope<TState>(TState state)
        {
            return null;
        }

        /// <summary>
        /// Returns if the logger is enabled
        /// </summary>
        /// <param name="logLevel">Log Level</param>
        /// <returns>True if the logger is enabled, else false</returns>
        public bool IsEnabled(LogLevel logLevel)
        {
            if (logLevel == LogLevel.None)
            {
                return false;
            }
            return true;
        }

        /// <summary>
        /// Logs a message
        /// </summary>
        /// <param name="timestamp">Timestamp</param>
        /// <param name="logLevel">Log Level</param>
        /// <param name="eventId">Event Id</param>
        /// <param name="state">State</param>
        /// <param name="exception">Exception</param>
        /// <param name="formatter">Formatter</param>
        public void Log<TState>(DateTimeOffset timestamp, LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                return;
            }

            StringBuilder builder = new StringBuilder();
            builder.Append(timestamp.ToString("yyyy-MM-dd HH:mm:ss.fff zzz"));
            builder.Append(" [");
            builder.Append(logLevel.ToString());
            builder.Append("] ");
            builder.Append(_category);
            builder.Append(": ");
            builder.AppendLine(formatter(state, exception));

            if (exception != null)
            {
                builder.AppendLine(exception.ToString());
            }

            _provider.AddMessage(timestamp, builder.ToString());
        }

        /// <summary>
        /// Logs a message
        /// </summary>
        /// <param name="logLevel">Log Level</param>
        /// <param name="eventId">Event Id</param>
        /// <param name="state">State</param>
        /// <param name="exception">Exception</param>
        /// <param name="formatter">Formatter</param>
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
        {
            Log(DateTimeOffset.UtcNow, logLevel, eventId, state, exception, formatter);
        }
    }
}