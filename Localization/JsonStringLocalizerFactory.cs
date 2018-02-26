using System;
using System.Collections.Concurrent;
using System.Linq;
using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Collections.Generic;

namespace GoNorth.Localization
{
    /// <summary>
    /// Json String Localizer Factory
    /// </summary>
    public class JsonStringLocalizerFactory : IStringLocalizerFactory
    {
        /// <summary>
        /// Known View Extensions
        /// </summary>
        private static readonly string[] KnownViewExtensions = new[] { ".cshtml" };
        
        /// <summary>
        /// Cached objects
        /// </summary>
        private readonly ConcurrentDictionary<string, JsonStringLocalizer> _localizerCache = new ConcurrentDictionary<string, JsonStringLocalizer>();

        /// <summary>
        /// Hosting Environment
        /// </summary>        
        private readonly IHostingEnvironment _applicationEnvironment;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger<JsonStringLocalizerFactory> _logger;

        /// <summary>
        /// Resources relativ path
        /// </summary>
        private string _resourcesRelativePath;

        /// <summary>
        /// Fallback Culture
        /// </summary>
        private readonly CultureInfo _fallbackCulture;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="applicationEnvironment">Application Environment</param>
        /// <param name="localizationOptions">Localization Options</param>
        /// <param name="logger">Logger</param>
        public JsonStringLocalizerFactory(IHostingEnvironment applicationEnvironment, IOptions<JsonLocalizationOptions> localizationOptions, ILogger<JsonStringLocalizerFactory> logger)
        {
            if (applicationEnvironment == null)
            {
                throw new ArgumentNullException(nameof(applicationEnvironment));
            }
            if (localizationOptions == null)
            {
                throw new ArgumentNullException(nameof(localizationOptions));
            }
            if (logger == null)
            {
                throw new ArgumentNullException(nameof(logger));
            }

            this._applicationEnvironment = applicationEnvironment;
            this._logger = logger;
            
            _resourcesRelativePath = localizationOptions.Value.ResourcesPath ?? string.Empty;
            if (!string.IsNullOrEmpty(_resourcesRelativePath))
            {
                _resourcesRelativePath = _resourcesRelativePath
                    .Replace(Path.AltDirectorySeparatorChar, '.')
                    .Replace(Path.DirectorySeparatorChar, '.') + ".";
            }

            _fallbackCulture = localizationOptions.Value.FallbackCulture;
            
            logger.LogTrace($"Created {nameof(JsonStringLocalizerFactory)} with:{Environment.NewLine}" +
                $"    (application name: {applicationEnvironment.ApplicationName}{Environment.NewLine}" +
                $"    (resources relative path: {_resourcesRelativePath})");
        }

        /// <summary>
        /// Returns a string localizer
        /// </summary>
        /// <param name="resourceSource">Resource Source</param>
        /// <returns>String Localizer</returns>
        public IStringLocalizer Create(Type resourceSource)
        {
            if (resourceSource == null)
            {
                throw new ArgumentNullException(nameof(resourceSource));
            }
            
            _logger.LogTrace($"Getting localizer for type {resourceSource}");
            
            TypeInfo typeInfo = resourceSource.GetTypeInfo();
            Assembly assembly = typeInfo.Assembly;

            // Re-root the base name if a resources path is set.
            string resourceBaseName = string.IsNullOrEmpty(_resourcesRelativePath)
                ? typeInfo.FullName
                : _applicationEnvironment.ApplicationName + "." + _resourcesRelativePath +
                    LocalizerUtil.TrimPrefix(typeInfo.FullName, _applicationEnvironment.ApplicationName + ".");
            _logger.LogTrace($"Localizer basename: {resourceBaseName}");

            return _localizerCache.GetOrAdd(resourceBaseName, new JsonStringLocalizer(resourceBaseName, _applicationEnvironment.ApplicationName, _logger, _fallbackCulture));
        }

        /// <summary>
        /// Returns a string localizer
        /// </summary>
        /// <param name="baseName">Base Name</param>
        /// <param name="location">Location</param>
        /// <returns>String Localizer</returns>
        public IStringLocalizer Create(string baseName, string location)
        {
            if (baseName == null)
            {
                throw new ArgumentNullException(nameof(baseName));
            }
            
            _logger.LogTrace($"Getting localizer for baseName {baseName} and location {location}");
            
            location = location ?? _applicationEnvironment.ApplicationName;
            
            // Re-root base name if a resources path is set and strip the cshtml part.
            string resourceBaseName = location + "." + _resourcesRelativePath + LocalizerUtil.TrimPrefix(baseName, location + ".");
            
            string viewExtension = KnownViewExtensions.FirstOrDefault(extension => resourceBaseName.EndsWith(extension));
            if (viewExtension != null)
            {
                resourceBaseName = resourceBaseName.Substring(0, resourceBaseName.Length - viewExtension.Length);
            }
            
            _logger.LogTrace($"Localizer basename: {resourceBaseName}");
            
            return _localizerCache.GetOrAdd(resourceBaseName, new JsonStringLocalizer(resourceBaseName, _applicationEnvironment.ApplicationName, _logger, _fallbackCulture));
        }
    }
}