using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using GoNorth.Models;
using GoNorth.Models.AccountViewModels;
using GoNorth.Services.Email;
using GoNorth.Data.User;
using GoNorth.Extensions;
using Microsoft.Extensions.Localization;
using GoNorth.Templates;
using GoNorth.Services.Timeline;
using GoNorth.Config;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Account controller
    /// </summary>
    [Authorize]
    [Route("[controller]/[action]")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class AccountController : Controller
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
        /// Email Sender
        /// </summary>
        private readonly IEmailSender _emailSender;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _emailLocalizer;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// Configuration
        /// </summary>
        private readonly ConfigurationData _configuration;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userManager">UserManager</param>
        /// <param name="signInManager">SignInManager</param>
        /// <param name="emailSender">Email Sender</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factor</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="configuration">Configuration</param>
        public AccountController(UserManager<GoNorthUser> userManager, SignInManager<GoNorthUser> signInManager, IEmailSender emailSender, ILogger<AccountController> logger, IStringLocalizerFactory localizerFactory, ITimelineService timelineService, IOptions<ConfigurationData> configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(AccountController));
            _emailLocalizer = localizerFactory.Create(typeof(EmailTemplates));
            _timelineService = timelineService;
            _configuration = configuration.Value;
        }

        /// <summary>
        /// Temporary error message
        /// </summary>
        [TempData]
        public string ErrorMessage { get; set; }

        /// <summary>
        /// Login view
        /// </summary>
        /// <param name="returnUrl">Return url to return to after login</param>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Login(string returnUrl = null)
        {
            // Clear the existing external cookie to ensure a clean login process
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        /// <summary>
        /// Login post
        /// </summary>
        /// <param name="model">Login Model View</param>
        /// <param name="returnUrl">Return url</param>
        /// <returns>View</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                // This doesn't count login failures towards account lockout
                // To enable password failures to trigger account lockout, set lockoutOnFailure: true
                Microsoft.AspNetCore.Identity.SignInResult result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, lockoutOnFailure: false);
                if (result.Succeeded)
                {
                    _logger.LogInformation("User logged in.");
                    return RedirectToLocal(returnUrl);
                }
                if (result.IsLockedOut)
                {
                    _logger.LogWarning("User account locked out.");
                    return RedirectToAction(nameof(Lockout));
                }
                else
                {
                    ModelState.AddModelError(string.Empty, _localizer["InvalidLogin"]);
                    return View(model);
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        /// <summary>
        /// Locks the user out
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Lockout()
        {
            return View();
        }
        
        /// <summary>
        /// Logout page
        /// </summary>
        /// <returns>View</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out.");
            return RedirectToAction(nameof(SignedOut), "Account");
        }

        /// <summary>
        /// User Signed out
        /// </summary>
        /// <returns>Signed out</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult SignedOut()
        {
            return View();
        }

        /// <summary>
        /// Confirm email view
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <param name="code">Code</param>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }

            GoNorthUser user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException(_localizer["UserNotFound"]);
            }
            
            IdentityResult result = await _userManager.ConfirmEmailAsync(user, code);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        /// <summary>
        /// Forgot password view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        /// <summary>
        /// Sends the forgot password email
        /// </summary>
        /// <param name="model">ViewModel</param>
        /// <returns>View</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                GoNorthUser user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    return RedirectToAction(nameof(ForgotPasswordConfirmation));
                }

                string code = await _userManager.GeneratePasswordResetTokenAsync(user);
                string callbackUrl = Url.ResetPasswordCallbackLink(user.Id, code, Request.Scheme, _configuration);
                await _emailSender.SendEmailAsync(model.Email, _emailLocalizer["ResetPasswordSubject"], _emailLocalizer["ResetPasswordBody", callbackUrl]);
                return RedirectToAction(nameof(ForgotPasswordConfirmation));
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        /// <summary>
        /// Forgot password confirmation page
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        /// <summary>
        /// Reset password view
        /// </summary>
        /// <param name="code">Code</param>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPassword(string code = null)
        {
            if (code == null)
            {
                throw new ApplicationException(_localizer["CodeMissing"]);
            }

            ResetPasswordViewModel model = new ResetPasswordViewModel { Code = code };
            return View(model);
        }

        /// <summary>
        /// Resets the password
        /// </summary>
        /// <param name="model">View Model</param>
        /// <returns>View</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            GoNorthUser user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return RedirectToAction(nameof(ResetPasswordConfirmation));
            }

            IdentityResult result = await _userManager.ResetPasswordAsync(user, model.Code, model.Password);
            if (result.Succeeded)
            {
                return RedirectToAction(nameof(ResetPasswordConfirmation));
            }

            AddErrors(result);
            return View();
        }

        /// <summary>
        /// Confirmation page for password reset
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        /// <summary>
        /// Access denied page
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
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
        /// Redirects to local
        /// </summary>
        /// <param name="returnUrl">Return url</param>
        /// <returns>View</returns>
        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }
        }

        #endregion
    }
}
