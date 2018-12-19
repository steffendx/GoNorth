using Microsoft.Extensions.Options;

namespace GoNorth.Config
{
    /// <summary>
    /// Class for appsettings access
    /// </summary>
    public class AppSettingsConfigViewAccess : IConfigViewAccess
    {
        /// <summary>
        /// Config Data
        /// </summary>
        private readonly ConfigurationData _configData;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public AppSettingsConfigViewAccess(IOptions<ConfigurationData> configuration)
        {
            _configData = configuration.Value;
        }

        /// <summary>
        /// Returns if the GDPR functionality is used
        /// </summary>
        /// <returns>true if GDPR is used, else false</returns>
        public bool IsUsingGdpr()
        {
            return _configData.Misc.UseGdpr;
        }

        /// <summary>
        /// Returns if the Legal Notice functionality is used
        /// </summary>
        /// <returns>true if Legal Notice is used, else false</returns>
        public bool IsUsingLegalNotice()
        {
            return _configData.Misc.UseLegalNotice;
        }
    }
}