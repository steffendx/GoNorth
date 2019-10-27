using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Localization;

namespace GoNorth.Localization
{
    /// <summary>
    /// Json Localization Service Collection Extensions
    /// </summary>
    public static class JsonLocalizationServiceCollectionExtensions
    {
        /// <summary>
        /// Adds Json Localization
        /// </summary>
        /// <param name="services">Service Collection</param>
        /// <returns>Updated Service Collection</returns>
        public static IServiceCollection AddJsonLocalization(this IServiceCollection services)
        {
            if (services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }
            return AddJsonLocalization(services, setupAction: null);
        }

        /// <summary>
        /// Adds Json Localization
        /// </summary>
        /// <param name="services">Service Collection</param>
        /// <param name="setupAction">Setup action</param>
        /// <returns>Json Localization</returns>
        public static IServiceCollection AddJsonLocalization(this IServiceCollection services, Action<JsonLocalizationOptions> setupAction)
        {
            if (services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }

            services.TryAdd(new ServiceDescriptor(typeof(IStringLocalizerFactory), typeof(JsonStringLocalizerFactory), ServiceLifetime.Singleton));

            if (setupAction != null)
            {
                services.Configure(setupAction);
            }
            return services;
        }
    }
}