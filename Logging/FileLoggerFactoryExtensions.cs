using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace GoNorth.Logging
{
    /// <summary>
    /// Extensions for adding the <see cref="FileLoggerProvider" /> to the <see cref="ILoggingBuilder" />
    /// </summary>
    public static class FileLoggerFactoryExtensions
    {
        /// <summary>
        /// Adds a file logger named 'File' to the factory.
        /// </summary>
        /// <param name="builder">The <see cref="ILoggingBuilder"/> to use.</param>
        public static ILoggingBuilder AddFile(this ILoggingBuilder builder)
        {
            builder.Services.AddSingleton<ILoggerProvider, FileLoggerProvider>();
            return builder;
        }
    }
}