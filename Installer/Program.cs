using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth;
using GoNorth.Data;
using GoNorth.Data.Project;
using GoNorth.Data.User;
using GoNorth.Services.Email;
using GoNorth.Services.User;
using Installer.Services.AppSettingUpdater;
using Installer.Services.Messages;
using Installer.Services.Mock;
using Installer.Services.ProviderBuilder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Installer
{
    /// <summary>
    /// Main Installer Entry class
    /// </summary>
    public class Program
    {
        /// <summary>
        /// Main Installer Entry point
        /// </summary>
        /// <param name="args">Arguments</param>
        /// <returns>Task</returns>
        public static async Task Main(string[] args)
        {
            MessageService.PrintWelcomeMessage();

            // Db Settings
            await ConfigureDb();

            // Email Settings
            await ConfigureEMail();

            // Configure Admin Account
            await ConfigureAdminAccount();

            // Configure project
            await ConfigureProject();

            MessageService.PrintDoneMessage();
        }

        /// <summary>
        /// Configures the database
        /// </summary>
        /// <returns>Task</returns>
        private static async Task ConfigureDb()
        {
            do
            {
                string connectionString = MessageService.GetMongoDbConnectionString();
                AppSettingUpdater.AddOrUpdateAppSetting((config) => config.MongoDb.ConnectionString = connectionString);
                string databaseName = MessageService.GetMongoDbDatabasename();
                AppSettingUpdater.AddOrUpdateAppSetting((config) => config.MongoDb.DbName = databaseName);
            
                MessageService.PrintVerifyingDatabase();
                try
                {
                    ServiceProvider serviceProvider = ServiceProviderBuilder.BuildServiceProvider();
                    IDbSetup dbSetup = serviceProvider.GetService<IDbSetup>();
                    await dbSetup.SetupDatabaseAsync();
                    MessageService.PrintSuccessVerifyingDatabase();
                    break;
                }
                catch(Exception ex)
                {
                    MessageService.PrintErrorVerifyingDatabase(ex);
                }
            }
            while(true);
        }

        /// <summary>
        /// Configures the email settings
        /// </summary>
        /// <returns>Task</returns>        
        private static async Task ConfigureEMail()
        {
            do
            {
                string smtpServer = MessageService.GetSmtpServer();
                if(string.IsNullOrEmpty(smtpServer))
                {
                    MessageService.PrintEMailConfigSkip();
                    break;
                }

                try
                {
                    AppSettingUpdater.AddOrUpdateAppSetting((config) => config.Email.SmtpServer = smtpServer);
                    int port = MessageService.GetSmtpPort();
                    AppSettingUpdater.AddOrUpdateAppSetting((config) => config.Email.SmtpPort = port);
                    bool useSsl = MessageService.GetSmtpUseSsl();
                    AppSettingUpdater.AddOrUpdateAppSetting((config) => config.Email.SmtpUseSSL = useSsl);                
                    string smtpUsername = MessageService.GetSmtpUsername();
                    AppSettingUpdater.AddOrUpdateAppSetting((config) => config.Email.SmtpUsername = smtpUsername);                
                    string smtpPasword = MessageService.GetSmtpPassword();
                    AppSettingUpdater.AddOrUpdateAppSetting((config) => config.Email.SmtpPassword = smtpPasword);                
                    string smtpTestReceiver = MessageService.GetSmtpTestReceiver();

                    MessageService.PrintVerifyingStmp();
                    
                    ServiceProvider serviceProvider = ServiceProviderBuilder.BuildServiceProvider();
                    IEmailSender emaiLSender = serviceProvider.GetService<IEmailSender>();
                    await emaiLSender.SendEmailAsync(smtpTestReceiver, "GoNorth - Mail Test", "Mail test successful.");
                    MessageService.PrintSuccessVerifyingSmtpServer();
                    break;
                }
                catch(Exception ex)
                {
                    MessageService.PrintErrorVerifyingSmtpServer(ex);
                }
            }
            while(true);   
        }

        
        /// <summary>
        /// Configures the admin account
        /// </summary>
        /// <returns>Task</returns>
        private static async Task ConfigureAdminAccount()
        {
            ServiceProvider serviceProvider = ServiceProviderBuilder.BuildServiceProvider();

            IUserDbAccess userDbAccess = serviceProvider.GetService<IUserDbAccess>();
            if(await userDbAccess.DoesAdminUserExist())
            {
                MessageService.PrintAdminAccountExistMessage();
                return;
            }

            string email;
            do
            {
                try
                {
                    string displayName = MessageService.GetAdminAccountDisplayName();
                    email = MessageService.GetAdminAccountEMail();
                    string password = MessageService.GetAdminAccountPassword();

                    IUserCreator userCreator = serviceProvider.GetService<IUserCreator>();
                    IdentityResult result = await userCreator.CreateUser(new MockUrlHelper(), "https", displayName, email, password, RoleNames.Administrator);
                    if(!result.Succeeded)
                    {
                        throw new Exception(string.Join(',', result.Errors.Select(e => e.Description)));
                    }

                    MessageService.PrintSuccessCreatingAdminAccount();
                    break;
                }
                catch(Exception ex)
                {
                    MessageService.PrintErrorCreatingAdminAccount(ex);
                }
            }
            while(true);

            try
            {
                UserManager<GoNorthUser> userManager = serviceProvider.GetService<UserManager<GoNorthUser>>();
                GoNorthUser adminUser = await userManager.FindByEmailAsync(email);

                List<string> rolesToAdd = RoleNames.GetAllRoleNames().Where(r => r != RoleNames.Administrator).ToList();

                IdentityResult result = await userManager.AddToRolesAsync(adminUser, rolesToAdd);
                if(!result.Succeeded)
                {
                    throw new Exception(string.Join(',', result.Errors.Select(e => e.Description)));
                }
            }
            catch(Exception ex)
            {
                MessageService.PrintErrorAssignAllRolesToUser(ex);
            }
        }
        
        /// <summary>
        /// Configures the project
        /// </summary>
        /// <returns>Task</returns>
        private static async Task ConfigureProject()
        {
            ServiceProvider serviceProvider = ServiceProviderBuilder.BuildServiceProvider();

            IProjectDbAccess projectDbAccess = serviceProvider.GetService<IProjectDbAccess>();
            GoNorthProject defaultProject = await projectDbAccess.GetDefaultProject();
            if(defaultProject != null)
            {
                MessageService.PrintDefaultProjectExistMessage();
                return;
            }

            try
            {
                string displayName = MessageService.GetDefaultProjectName();
                GoNorthProject projectToCreate = new GoNorthProject
                {
                    Name = displayName,
                    IsDefault = true
                };
                await projectDbAccess.CreateProject(projectToCreate);
                MessageService.PrintSuccessCreatingDefaultProject();
            }
            catch(Exception ex)
            {
                MessageService.PrintErrorCreatingDefaultProject(ex);
            }
        }
    }
}
