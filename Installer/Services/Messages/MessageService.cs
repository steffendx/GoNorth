using System;
using GoNorth.Services.Encryption;
using Installer.Services.ProviderBuilder;
using Installer.Util;
using Microsoft.Extensions.DependencyInjection;

namespace Installer.Services.Messages
{
    /// <summary>
    /// Helper Class to print messages
    /// </summary>
    public static class MessageService
    {
        /// <summary>
        /// Prints a welcome message
        /// </summary>
        public static void PrintWelcomeMessage()
        {
            Console.WriteLine("Thank you for downloading GoNorth!");
            Console.WriteLine("This installer will help you setup GoNorth on your computer.");
            Console.WriteLine("");
            Console.WriteLine("First of all:");
            Console.WriteLine("  Make sure to install MongoDb Version 5.0 or older.");
            Console.WriteLine("  You can download the free community edition here: https://www.mongodb.com/");
            Console.WriteLine("");
            Console.WriteLine("Once MongoDb is installed (if you dont have it already installed) press any key.");
            KeyboardHelper.WaitForKeyPress();
        }


        /// <summary>
        /// Reads a mongodb connection string
        /// </summary>
        /// <returns>mongodb connection string</returns>
        public static string GetMongoDbConnectionString()
        {
            Console.WriteLine("======");
            Console.WriteLine("You will first have to specify the MongoDb Connection String that is used to connect to the database. (Details: https://docs.mongodb.com/manual/reference/connection-string/ )");
            Console.WriteLine("  Default value: mongodb://localhost:27017");
            Console.WriteLine("  This default value should be fine if you have mongodb installed locally on your pc and not protected by any username or password.");

            return KeyboardHelper.ReadConfigValue("Connectionstring (leave blank for default): ", "mongodb://localhost:27017");
        }

        /// <summary>
        /// Reads a mongodb databasename
        /// </summary>
        /// <returns>mongodb database</returns>
        public static string GetMongoDbDatabasename()
        {
            Console.WriteLine("======");
            Console.WriteLine("Now we need the database name in which GoNorth will store its data.");
            Console.WriteLine("  Default value: GoNorth");

            return KeyboardHelper.ReadConfigValue("Databasename (leave blank for default): ", "GoNorth");
        }
        
        /// <summary>
        /// Prints a message that the database is being verified
        /// </summary>
        public static void PrintVerifyingDatabase()
        {
            Console.WriteLine("=====");
            PrintWithColor("Verifying database connection...", ConsoleColor.DarkYellow);
        }

        /// <summary>
        /// Prints a message if an error occured verifying the database connection
        /// </summary>
        /// <param name="ex">Exception</param>
        public static void PrintErrorVerifyingDatabase(Exception ex)
        {
            PrintWithColor(string.Format("X Error verifying the database connection: {0}", ex.Message), ConsoleColor.Red);
            PrintWithColor("Please check the specified values.", ConsoleColor.Red);
        }

        /// <summary>
        /// Shows a success message if the database connection could be verified
        /// </summary>
        public static void PrintSuccessVerifyingDatabase()
        {
            PrintWithColor("✓ Database connection verified.", ConsoleColor.Green);
        }


        /// <summary>
        /// Reads an smtp mail server
        /// </summary>
        /// <returns>Smtp</returns>
        public static string GetSmtpServer()
        {
            Console.WriteLine("======");
            Console.WriteLine("If you want GoNorth to be able to send emails in case a user forgets their password, you will have to configure an SMTP-Server.");
            Console.WriteLine("First you have to specify the SMTP-Server Address (for example smtp.gmail.com for googlemail).");
            Console.WriteLine("  If you leave this blank no mail server will be configured.");

            return KeyboardHelper.ReadConfigValue("SMTP-Server (leave blank to skip): ", string.Empty);
        }

        /// <summary>
        /// Reads an smtp mail port
        /// </summary>
        /// <returns>Port</returns>
        public static int GetSmtpPort()
        {
            Console.WriteLine("======");
            Console.WriteLine("Please specify the SMTP-Server Port now.");
            Console.WriteLine("  Default Value: 25");

            string port = KeyboardHelper.ReadConfigValue("SMTP-Port (leave blank for default): ", "25");
            return int.Parse(port);
        }
        
        /// <summary>
        /// Reads if SSL must be used
        /// </summary>
        /// <returns>True if ssl must be used, esle false</returns>
        public static bool GetSmtpUseSsl()
        {
            Console.WriteLine("======");
            Console.WriteLine("Is it required to use SSL for the SMTP-Server (y/n)?");
            Console.WriteLine("  Default Value: y");

            string useSsl = KeyboardHelper.ReadConfigValue("Use SSL (y/n, leave blank for default): ", "y");
            return useSsl.ToLowerInvariant() == "y";
        }

        /// <summary>
        /// Reads the SMTP Username
        /// </summary>
        /// <returns>SMTP Username</returns>
        public static string GetSmtpUsername()
        {
            Console.WriteLine("======");
            Console.WriteLine("Please specify the username that is used to connect to the SMTP-Server.");

            return KeyboardHelper.ReadConfigValue("SMTP-Username: ", string.Empty);
        }

        /// <summary>
        /// Reads the SMTP password
        /// </summary>
        /// <returns>SMTP Username</returns>
        public static string GetSmtpPassword()
        {
            Console.WriteLine("======");
            Console.WriteLine("Please specify the password that is used to connect to the SMTP-Server (will be encrypted).");

            string password = KeyboardHelper.ReadConfigValue("SMTP-Password: ", string.Empty);
        
            ServiceProvider serviceProvider = ServiceProviderBuilder.BuildServiceProvider();
            IEncryptionService encryptionService = serviceProvider.GetService<IEncryptionService>();
            return encryptionService.Encrypt(password);
        }

        /// <summary>
        /// Reads the SMTP test receiver
        /// </summary>
        /// <returns>SMTP Test receiver</returns>
        public static string GetSmtpTestReceiver()
        {
            Console.WriteLine("======");
            Console.WriteLine("Please specify an E-Mail address to send a test mail to.");

            return KeyboardHelper.ReadConfigValue("SMTP-Test Address: ", string.Empty);
        }

        /// <summary>
        /// Prints a message that email config will be skipped
        /// </summary>
        public static void PrintEMailConfigSkip()
        {
            PrintWithColor("E-Mail config will be skipped.", ConsoleColor.DarkYellow);
        }

        /// <summary>
        /// Prints a message that the smtp server is being verified
        /// </summary>
        public static void PrintVerifyingStmp()
        {
            Console.WriteLine("=====");
            PrintWithColor("Verifying E-Mail sending...", ConsoleColor.DarkYellow);
        }

        /// <summary>
        /// Prints a message if an error occured verifying the smtp server
        /// </summary>
        /// <param name="ex">Exception</param>
        public static void PrintErrorVerifyingSmtpServer(Exception ex)
        {
            PrintWithColor(string.Format("X Error verifying the E-Mail sending: {0}", ex.Message), ConsoleColor.Red);
            PrintWithColor("Please check the specified values.", ConsoleColor.Red);
        }

        /// <summary>
        /// Shows a success message if the smtp server could be verified
        /// </summary>
        public static void PrintSuccessVerifyingSmtpServer()
        {
            PrintWithColor("✓ E-Mail sending verified.", ConsoleColor.Green);
        }


        /// <summary>
        /// Prints a message that an admin account already exists
        /// </summary>
        public static void PrintAdminAccountExistMessage()
        {
            Console.WriteLine("=====");
            PrintWithColor("An admin account already exists. Admin account creation will be skipped.", ConsoleColor.DarkYellow);
        }

        /// <summary>
        /// Reads the admin account displayname
        /// </summary>
        /// <returns>Admin account display name</returns>
        public static string GetAdminAccountDisplayName()
        {
            Console.WriteLine("======");
            Console.WriteLine("We will need to create an admin account. This account will have all available roles assigned and will be able to create additional accounts in the portal.");
            Console.WriteLine("  First specify the displayname of the account.");

            return KeyboardHelper.ReadConfigValueMandatory("Admin Account Displayname: ");
        }

        /// <summary>
        /// Reads the admin account email
        /// </summary>
        /// <returns>Admin account email</returns>
        public static string GetAdminAccountEMail()
        {
            Console.WriteLine("======");
            Console.WriteLine("Now you will have to specify the E-Mail Address of the admin account.");
            Console.WriteLine("  This E-Mail Address is also used to login.");

            return KeyboardHelper.ReadConfigValueMandatory("Admin Account E-Mail: ");
        }
        
        /// <summary>
        /// Reads the admin account password
        /// </summary>
        /// <returns>Admin account password</returns>
        public static string GetAdminAccountPassword()
        {
            Console.WriteLine("======");
            Console.WriteLine("Now you will have to specify the password of the admin account.");

            return KeyboardHelper.ReadMaskedValueMandatory("Admin Account password: ");
        }

        /// <summary>
        /// Prints a message if an error occured creating the admin account
        /// </summary>
        /// <param name="ex">Exception</param>
        public static void PrintErrorCreatingAdminAccount(Exception ex)
        {
            PrintWithColor(string.Format("X Error creating the admin account: {0}", ex.Message), ConsoleColor.Red);
            PrintWithColor("Please check the specified values.", ConsoleColor.Red);
        }

        /// <summary>
        /// Shows a success message if the admin account was created successfully
        /// </summary>
        public static void PrintSuccessCreatingAdminAccount()
        {
            PrintWithColor("✓ Successfully created admin.", ConsoleColor.Green);
        }
        
        /// <summary>
        /// Prints a message if an error occured while assigning all roles to user
        /// </summary>
        /// <param name="ex">Exception</param>
        public static void PrintErrorAssignAllRolesToUser(Exception ex)
        {
            PrintWithColor(string.Format("X Error assigning all roles to the admin account: {0}", ex.Message), ConsoleColor.Red);
            PrintWithColor("Please assigning these roles in the portal admin area after logging in.", ConsoleColor.Red);
        }

        
        /// <summary>
        /// Prints a message that a project already exists
        /// </summary>
        public static void PrintDefaultProjectExistMessage()
        {
            Console.WriteLine("=====");
            PrintWithColor("A project already exists. Project creation will be skipped.", ConsoleColor.DarkYellow);
        }

        /// <summary>
        /// Prints a message that a project already exists
        /// </summary>
        public static string GetDefaultProjectName()
        {
            Console.WriteLine("======");
            Console.WriteLine("A project must be created. All changes will be associated with this project.");

            return KeyboardHelper.ReadConfigValueMandatory("Project name: ");
        }

        /// <summary>
        /// Shows a success message if the default project was created successfully
        /// </summary>
        public static void PrintSuccessCreatingDefaultProject()
        {
            PrintWithColor("✓ Successfully created project.", ConsoleColor.Green);
        }
        
        /// <summary>
        /// Prints a message if an error occured while creating a default project
        /// </summary>
        /// <param name="ex">Exception</param>
        public static void PrintErrorCreatingDefaultProject(Exception ex)
        {
            PrintWithColor(string.Format("X Error creating project: {0}", ex.Message), ConsoleColor.Red);
            PrintWithColor("Retry or create the project in the portal.", ConsoleColor.Red);
        }


        /// <summary>
        /// Shows a success message if the default project was created successfully
        /// </summary>
        public static void PrintDoneMessage()
        {
            Console.WriteLine("======");
            PrintWithColor("Setup is done. You can start the portal now and connect.", ConsoleColor.Green);
        }


        /// <summary>
        /// Prints a message with color
        /// </summary>
        /// <param name="message">Message to print</param>
        /// <param name="color">Color to use</param>
        private static void PrintWithColor(string message, ConsoleColor color)
        {
            ConsoleColor defaultColor = Console.ForegroundColor;
            Console.ForegroundColor = color;
            try
            {
                Console.WriteLine(message);
            }
            finally
            {
                Console.ForegroundColor = defaultColor;
            }
        }
    }
}