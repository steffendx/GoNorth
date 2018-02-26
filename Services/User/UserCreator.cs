using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using GoNorth.Config;
using GoNorth.Data.User;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Extensions;
using Microsoft.Extensions.Localization;
using GoNorth.Services.Email;
using GoNorth.Templates;

namespace GoNorth.Services.User
{
    /// <summary>
    /// Service for User Creation
    /// </summary>
    public class UserCreator : IUserCreator
    {
        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger<UserCreator> _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _emailLocalizer;

        /// <summary>
        /// Email Sender
        /// </summary>
        private readonly IEmailSender _emailSender;

        /// <summary>
        /// Configuration
        /// </summary>
        private readonly ConfigurationData _configuration;
        

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userManager">User Manager</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="emailSender">Email Sender</param>
        /// <param name="configuration">Configuration</param>
        public UserCreator(UserManager<GoNorthUser> userManager, ILogger<UserCreator> logger, IStringLocalizerFactory localizerFactory, IEmailSender emailSender, IOptions<ConfigurationData> configuration)
        {
            _userManager = userManager;
            _logger = logger;
            _emailLocalizer = localizerFactory.Create(typeof(EmailTemplates));
            _emailSender = emailSender;
            _configuration = configuration.Value;
        }


        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="url">Url Helper</param>
        /// <param name="requestScheme">Request Scheme</param>
        /// <param name="displayName">Displayname of the user</param>
        /// <param name="email">Email of the user</param>
        /// <param name="password">Password of the user</param>
        /// <param name="defaultRole">Default Role of the user</param>
        /// <returns>Identity Result</returns>
        public async Task<IdentityResult> CreateUser(IUrlHelper url, string requestScheme, string displayName, string email, string password, string defaultRole)
        {
            if(string.IsNullOrEmpty(displayName) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                return IdentityResult.Failed();
            }

            // Check if user exists
            GoNorthUser existingUser = await _userManager.FindByEmailAsync(email);
            if(existingUser != null)
            {
                return IdentityResult.Failed();
            }

            // Create user
            GoNorthUser user = new GoNorthUser { UserName = email, Email = email, DisplayName = displayName };
            if(!string.IsNullOrEmpty(defaultRole))
            {
                user.Roles.Add(defaultRole);
            }

            IdentityResult result = await _userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                _logger.LogInformation("User account was created");

                string code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                string callbackUrl = url.EmailConfirmationLink(user.Id, code, requestScheme, _configuration);
                await _emailSender.SendEmailConfirmationAsync(_emailLocalizer, email, callbackUrl);
            }

            return result;
        }
    }
}
