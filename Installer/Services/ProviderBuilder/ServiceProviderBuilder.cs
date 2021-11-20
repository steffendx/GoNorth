using System;
using System.Collections.Generic;
using System.Globalization;
using GoNorth;
using GoNorth.Authentication;
using GoNorth.Config;
using GoNorth.Data;
using GoNorth.Data.Evne;
using GoNorth.Data.Kortisto;
using GoNorth.Data.LockService;
using GoNorth.Data.Project;
using GoNorth.Data.Role;
using GoNorth.Data.Styr;
using GoNorth.Data.Timeline;
using GoNorth.Data.User;
using GoNorth.Localization;
using GoNorth.Logging;
using GoNorth.Services.Email;
using GoNorth.Services.Encryption;
using GoNorth.Services.User;
using Installer.Services.Mock;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Installer.Services.ProviderBuilder
{
    /// <summary>
    /// Service to build a service provider
    /// </summary>
    public static class ServiceProviderBuilder
    {
        /// <summary>
        /// Builds a service provider with the current config
        /// </summary>
        /// <returns>Service provider</returns> 
        public static ServiceProvider BuildServiceProvider()
        {
            IConfigurationRoot configuration = BuildConfiguration();

            ServiceCollection serviceCollection = new ServiceCollection();
            serviceCollection.AddOptions();
            serviceCollection.Configure<ConfigurationData>(configuration);
            
            SetupDIConfig(serviceCollection);

            ServiceProvider serviceProvider = serviceCollection.BuildServiceProvider();
            return serviceProvider;
        }

        /// <summary>
        /// Builds the current configuration
        /// </summary>
        /// <returns>Configuration</returns>
        private static IConfigurationRoot BuildConfiguration()
        {
            IConfigurationBuilder builder = new ConfigurationBuilder()
                            .SetBasePath(AppContext.BaseDirectory)
                            .AddJsonFile("appsettings.json")
                            .AddEnvironmentVariables();

            IConfigurationRoot configuration = builder.Build();
            return configuration;
        }
        
        /// <summary>
        /// Prepares the Dependency Injection config
        /// </summary>
        /// <param name="serviceCollection">Service collection</param>
        private static void SetupDIConfig(ServiceCollection serviceCollection)
        {
            serviceCollection.AddTransient<IWebHostEnvironment, MockWebHostEnvironment>();

            serviceCollection.AddIdentity<GoNorthUser, GoNorthRole>(options => {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = Constants.MinPasswordLength;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = false;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                options.Lockout.MaxFailedAccessAttempts = 10;

                // User settings
                options.User.RequireUniqueEmail = true;
            }).AddUserManager<GoNorthUserManager>().AddRoleManager<GoNorthRoleManager>().
               AddUserStore<GoNorthUserStore>().AddRoleStore<GoNorthRoleStore>().AddErrorDescriber<GoNorthIdentityErrorDescriber>().
               AddUserValidator<GoNorthUserValidator>().AddDefaultTokenProviders();

            CultureInfo defaultCulture = new CultureInfo("en");
            List<CultureInfo> supportedCultures = new List<CultureInfo>
            {
                new CultureInfo("en")
            };
            serviceCollection.AddJsonLocalization(options => {
                options.FallbackCulture = defaultCulture;
                options.ResourcesPath = "Resources";
            });
            serviceCollection.AddLogging();
            serviceCollection.AddSingleton<ILoggerProvider, FileLoggerProvider>();
            
            serviceCollection.AddTransient<IEncryptionService, AesEncryptionService>();
            serviceCollection.AddTransient<IEmailSender, EmailSender>();
            serviceCollection.AddTransient<IUserCreator, UserCreator>();

            serviceCollection.AddTransient<IProjectDbAccess, ProjectMongoDbAccess>();
            serviceCollection.AddTransient<IKortistoNpcTagDbAccess, KortistoNpcTagMongoDbAccess>();
            serviceCollection.AddTransient<IStyrItemTagDbAccess, StyrItemTagMongoDbAccess>();
            serviceCollection.AddTransient<IEvneSkillTagDbAccess, EvneSkillTagMongoDbAccess>();
            serviceCollection.AddTransient<ITimelineDbAccess, TimelineMongoDbAccess>();
            serviceCollection.AddTransient<ILockServiceDbAccess, LockServiceMongoDbAccess>();
            serviceCollection.AddTransient<IUserDbAccess, UserMongoDbAccess>();
            serviceCollection.AddTransient<IUserPreferencesDbAccess, UserPreferencesMongoDbAccess>();
            serviceCollection.AddTransient<IDbSetup, MongoDbSetup>();
        }
    }
}