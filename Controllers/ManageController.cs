using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using GoNorth.Models;
using GoNorth.Models.ManageViewModels;
using GoNorth.Services.Email;
using GoNorth.Data.User;
using GoNorth.Extensions;
using Microsoft.Extensions.Localization;
using GoNorth.Templates;
using GoNorth.Config;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Controller for maning the account
    /// </summary>
    [Authorize]
    [Route("[controller]/[action]")]
    public class ManageController : Controller
    {
        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Sign In Manager
        /// </summary>
        private readonly SignInManager<GoNorthUser> _signInManager;

        /// <summary>
        /// Email sender
        /// </summary>
        private readonly IEmailSender _emailSender;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Url Encoder
        /// </summary>
        private readonly UrlEncoder _urlEncoder;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _emailLocalizer;

        /// <summary>
        /// Configuration
        /// </summary>
        private readonly ConfigurationData _configuration;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userManager">UserManager</param>
        /// <param name="signInManager">Sign In Manager</param>
        /// <param name="emailSender">Email sender</param>
        /// <param name="logger">Logger</param>
        /// <param name="urlEncoder">Url Encoder</param>
        /// <param name="localizerFactory">Localizer Factor</param>
        /// <param name="configuration">Configuration</param>
        public ManageController(UserManager<GoNorthUser> userManager, SignInManager<GoNorthUser> signInManager, IEmailSender emailSender, ILogger<ManageController> logger, UrlEncoder urlEncoder, IStringLocalizerFactory localizerFactory, IOptions<ConfigurationData> configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _logger = logger;
            _urlEncoder = urlEncoder;
            _localizer = localizerFactory.Create(typeof(ManageController));
            _emailLocalizer = localizerFactory.Create(typeof(EmailTemplates));
            _configuration = configuration.Value;
        }

        /// <summary>
        /// Temproary status message
        /// </summary>
        [TempData]
        public string StatusMessage { get; set; }

        /// <summary>
        /// Manage index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            GoNorthUser user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                throw new ApplicationException(_localizer["UserNotFound"]);
            }

            IndexViewModel model = new IndexViewModel
            {
                Username = user.UserName,
                DisplayName = user.DisplayName,
                Email = user.Email,
                IsEmailConfirmed = user.EmailConfirmed,
                StatusMessage = StatusMessage
            };

            return View(model);
        }

        /// <summary>
        /// Index manage view postback
        /// </summary>
        /// <param name="model">ViewModel</param>
        /// <returns>View</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(IndexViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            GoNorthUser user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                throw new ApplicationException(_localizer["UserNotFound"]);
            }

            bool userChanged = false;
            string email = user.Email;
            if (model.Email != email)
            {
                IdentityResult setEmailResult = await _userManager.SetEmailAsync(user, model.Email);
                if (!setEmailResult.Succeeded)
                {
                    throw new ApplicationException(_localizer["ErrorOccurredWhileSaving"]);
                }

                userChanged = true;
            }

            if (model.DisplayName != user.DisplayName)
            {
                user.DisplayName = model.DisplayName;
                userChanged = true;
            }

            if(userChanged)
            {
                IdentityResult updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    throw new ApplicationException(_localizer["ErrorOccurredWhileSaving"]);
                }

                await _signInManager.RefreshSignInAsync(user);
            }

            StatusMessage = _localizer["ProfileHasBeenUpdated"];
            return RedirectToAction(nameof(Index));
        }

        /// <summary>
        /// Sends a vverification mail
        /// </summary>
        /// <param name="model">View model</param>
        /// <returns>View</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SendVerificationEmail(IndexViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            GoNorthUser user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                throw new ApplicationException(_localizer["UserNotFound"]);
            }

            string code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            string callbackUrl = Url.EmailConfirmationLink(user.Id, code, Request.Scheme, _configuration);
            string email = user.Email;
            await _emailSender.SendEmailConfirmationAsync(_emailLocalizer, email, callbackUrl);

            StatusMessage = _localizer["VerificationEmailSent"];
            return RedirectToAction(nameof(Index));
        }

        /// <summary>
        /// Change password view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public async Task<IActionResult> ChangePassword()
        {
            GoNorthUser user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                throw new ApplicationException(_localizer["UserNotFound"]);
            }

            bool hasPassword = await _userManager.HasPasswordAsync(user);
            if (!hasPassword)
            {
                throw new ApplicationException(_localizer["NoPasswordExists"]);
            }

            ChangePasswordViewModel model = new ChangePasswordViewModel { StatusMessage = StatusMessage };
            return View(model);
        }

        /// <summary>
        /// Changes the view
        /// </summary>
        /// <param name="model">View model</param>
        /// <returns>View</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            GoNorthUser user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                throw new ApplicationException(_localizer["UserNotFound"]);
            }

            IdentityResult changePasswordResult = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
            if (!changePasswordResult.Succeeded)
            {
                AddErrors(changePasswordResult);
                return View(model);
            }

            await _signInManager.SignInAsync(user, isPersistent: false);
            _logger.LogInformation("User changed their password successfully.");
            StatusMessage = _localizer["PasswordHasBeenChanged"];

            return RedirectToAction(nameof(ChangePassword));
        }

        #region Helpers

        /// <summary>
        /// Adds an error
        /// </summary>
        /// <param name="result">Result</param>
        private void AddErrors(IdentityResult result)
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        /// <summary>
        /// Formats a key
        /// </summary>
        /// <param name="unformattedKey">Unformatted key</param>
        /// <returns>Formatted key</returns>
        private string FormatKey(string unformattedKey)
        {
            StringBuilder result = new StringBuilder();
            int currentPosition = 0;
            while (currentPosition + 4 < unformattedKey.Length)
            {
                result.Append(unformattedKey.Substring(currentPosition, 4)).Append(" ");
                currentPosition += 4;
            }
            if (currentPosition < unformattedKey.Length)
            {
                result.Append(unformattedKey.Substring(currentPosition));
            }

            return result.ToString().ToLowerInvariant();
        }
        
        #endregion
    }
}
