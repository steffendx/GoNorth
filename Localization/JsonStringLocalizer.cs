using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace GoNorth.Localization
{
    /// <summary>
    /// Json String Localizer
    /// </summary>
    public class JsonStringLocalizer : IStringLocalizer
    {
        /// <summary>
        /// Object cache
        /// </summary>
        private readonly ConcurrentDictionary<string, Lazy<JsonElement?>> _resourceObjectCache = new ConcurrentDictionary<string, Lazy<JsonElement?>>();

        /// <summary>
        /// Base Name
        /// </summary>
        private readonly string _baseName;

        /// <summary>
        /// Application Name
        /// </summary>
        private readonly string _applicationName;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Resource File Locations
        /// </summary>
        private readonly IEnumerable<string> _resourceFileLocations;

        /// <summary>
        /// Fallback Culture
        /// </summary>
        private readonly CultureInfo _fallbackCulture;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="baseName">Base Name</param>
        /// <param name="applicationName">Application Name</param>
        /// <param name="logger">Logger</param>
        /// <param name="fallbackCulture">Fallback Culture</param>
        public JsonStringLocalizer(string baseName, string applicationName, ILogger logger, CultureInfo fallbackCulture)
        {
            if (baseName == null)
            {
                throw new ArgumentNullException(nameof(baseName));
            }
            if (applicationName == null)
            {
                throw new ArgumentNullException(nameof(applicationName));
            }
            if (logger == null)
            {
                throw new ArgumentNullException(nameof(logger));
            }
            
            this._baseName = baseName;
            this._applicationName = applicationName;
            this._logger = logger;
            this._fallbackCulture = fallbackCulture;

            // Get a list of possible resource file locations.
            _resourceFileLocations = LocalizerUtil.ExpandPaths(baseName, applicationName).ToList();
            foreach (string resFileLocation in _resourceFileLocations)
            {
                logger.LogTrace($"Resource file location base path: {resFileLocation}");
            }
        }

        /// <summary>
        /// Returns a localized string
        /// </summary>
        /// <param name="name">Key Name</param>
        /// <returns>Localized string</returns>
        public virtual LocalizedString this[string name]
        {
            get
            {
                if (name == null)
                {
                    throw new ArgumentNullException(nameof(name));
                }

                string value = GetLocalizedString(name, CultureInfo.CurrentUICulture);
                return new LocalizedString(name, value ?? name, resourceNotFound: value == null);
            }
        }

        /// <summary>
        /// Returns a localized string
        /// </summary>
        /// <param name="name">Key Name</param>
        /// <param name="arguments">Additional arguments</param>
        /// <returns>Localized string</returns>
        public virtual LocalizedString this[string name, params object[] arguments]
        {
            get
            {
                if (name == null)
                {
                    throw new ArgumentNullException(nameof(name));
                }

                string format = GetLocalizedString(name, CultureInfo.CurrentUICulture);
                string value = string.Format(format ?? name, arguments);
                return new LocalizedString(name, value, resourceNotFound: format == null);
            }
        }

        /// <summary>
        /// Returns all strings
        /// </summary>
        /// <param name="includeAncestorCultures">true if ancestor cultures should be included</param>
        /// <returns>All Strings</returns>
        public virtual IEnumerable<LocalizedString> GetAllStrings(bool includeAncestorCultures) => GetAllStrings(includeAncestorCultures, CultureInfo.CurrentUICulture);

        /// <summary>
        /// Returns all strings
        /// </summary>
        /// <param name="includeAncestorCultures">true if ancestor cultures should be included</param>
        /// <param name="culture">Culture</param>
        /// <returns>All strings</returns>
        protected IEnumerable<LocalizedString> GetAllStrings(bool includeAncestorCultures, CultureInfo culture)
        {
            if (culture == null)
            {
                throw new ArgumentNullException(nameof(culture));
            }
            throw new NotImplementedException();
        }

        /// <summary>
        /// Returns a string localizer with a culture
        /// </summary>
        /// <param name="culture">Culture</param>
        /// <returns>String Localizer</returns>
        public IStringLocalizer WithCulture(CultureInfo culture)
        {
            if (culture == null)
            {
                return new JsonStringLocalizer(_baseName, _applicationName, _logger, _fallbackCulture);
            }
            throw new NotImplementedException();
        }

        /// <summary>
        /// returns a localized string
        /// </summary>
        /// <param name="name">String Name</param>
        /// <param name="culture">Culture</param>
        /// <returns>Localized string</returns>
        protected string GetLocalizedString(string name, CultureInfo culture)
        {
            if (name == null)
            {
                throw new ArgumentNullException(nameof(name));
            }

            // Attempt to get resource with the given name from the resource object. if not found, try parent
            // resource object until parent begets himself.
            CultureInfo currentCulture = culture;
            bool triedFallback = false;
            CultureInfo previousCulture = null;
            while (previousCulture != currentCulture)
            {
                JsonElement? resourceObject = GetResourceObject(currentCulture);
                if (!resourceObject.HasValue)
                {
                    _logger.LogInformation($"No resource file found or error occurred for base name {_baseName}, culture {currentCulture} and key '{name}'");
                }
                else
                {
                    JsonElement value;
                    if (resourceObject.Value.TryGetProperty(name, out value))
                    {
                        string localizedString = value.GetString();
                        return localizedString;
                    }
                }

                // Consult parent culture.
                previousCulture = currentCulture;
                currentCulture = currentCulture.Parent;
                if(!triedFallback && currentCulture.LCID == CultureInfo.InvariantCulture.LCID)
                {
                    currentCulture = _fallbackCulture;
                    triedFallback = true;
                }
                _logger.LogTrace($"Switching to parent culture {currentCulture} for key '{name}'.");
            }

            _logger.LogInformation($"Could not find key '{name}' in resource file for base name {_baseName} and culture {CultureInfo.CurrentCulture}");
            return null;
        }

        /// <summary>
        /// Returns a resource object for a culture
        /// </summary>
        /// <param name="currentCulture">Current Culture</param>
        /// <returns>Resource object</returns>
        private JsonElement? GetResourceObject(CultureInfo currentCulture)
        {
            if (currentCulture == null)
            {
                throw new ArgumentNullException(nameof(currentCulture));
            }

            _logger.LogTrace($"Attempt to get resource object for culture {currentCulture}");
            string cultureSuffix = "." + currentCulture.Name;
            cultureSuffix = cultureSuffix == "." ? "" : cultureSuffix;

            Lazy<JsonElement?> lazyJObjectGetter = new Lazy<JsonElement?>(() =>
            {
                // First attempt to find a resource file location that exists.
                string resourcePath = null;
                foreach (string resourceFileLocation in _resourceFileLocations)
                {
                    resourcePath = resourceFileLocation + cultureSuffix + ".json";
                    if (File.Exists(resourcePath))
                    {
                        _logger.LogInformation($"Resource file location {resourcePath} found");
                        break;
                    }
                    else
                    {
                        _logger.LogTrace($"Resource file location {resourcePath} does not exist");
                        resourcePath = null;
                    }
                }
                if (resourcePath == null)
                {
                    _logger.LogTrace($"No resource file found for suffix {cultureSuffix}");
                    return null;
                }

                // Found a resource file path: attempt to parse it into a JObject.
                try
                {
                    using (FileStream resourceFileStream = new FileStream(resourcePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, FileOptions.Asynchronous | FileOptions.SequentialScan))
                    {
                        JsonDocument jsonDocument = JsonDocument.Parse(resourceFileStream);
                        using (jsonDocument)
                        {
                            return jsonDocument.RootElement.Clone();
                        }
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError($"Error occurred attempting to read JSON resource file {resourcePath}: {e}");
                    return null;
                }

            }, LazyThreadSafetyMode.ExecutionAndPublication);

            lazyJObjectGetter = _resourceObjectCache.GetOrAdd(cultureSuffix, lazyJObjectGetter);
            JsonElement? resourceObject = lazyJObjectGetter.Value;
            return resourceObject;
        }

        /// <summary>
        /// Returns culture suffixes
        /// </summary>
        /// <param name="currentCulture">Current culture</param>
        /// <returns>Culture suffixes</returns>
        private string[] GetCultureSuffixes(CultureInfo currentCulture)
        {
            string[] cultureSuffixes;
            if (currentCulture == null)
            {
                cultureSuffixes = new[] { "" };
            }
            else
            {
                if (currentCulture.IsNeutralCulture)
                {
                    cultureSuffixes = new[] { currentCulture.Name + ".", "" };
                }
                else
                {
                    cultureSuffixes = new[] { currentCulture.Name + ".", currentCulture.Parent.Name + ".", "" };
                }
            }

            string cultureSuffixesLogString = string.Join(", ", cultureSuffixes);
            _logger.LogTrace($"Using culture suffixes {cultureSuffixesLogString}");
            return cultureSuffixes;
        }
    }
}