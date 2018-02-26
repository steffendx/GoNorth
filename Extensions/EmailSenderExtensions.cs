using System.Text.Encodings.Web;
using System.Threading.Tasks;
using GoNorth.Services.Email;
using Microsoft.Extensions.Localization;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Email Sender Extensions
    /// </summary>
    public static class EmailSenderExtensions
    {
        /// <summary>
        /// Sends and email confirmation
        /// </summary>
        /// <param name="emailSender">Email Sender</param>
        /// <param name="localizer">Email localizer</param>
        /// <param name="email">Email to send to</param>
        /// <param name="link">Link for confirmation</param>
        /// <returns>Task for the async task</returns>
        public static Task SendEmailConfirmationAsync(this IEmailSender emailSender, IStringLocalizer localizer, string email, string link)
        {
            return emailSender.SendEmailAsync(email, localizer["EmailConfirmationSubject"], localizer["EmailConfirmationBody", HtmlEncoder.Default.Encode(link)]);
        }
    }
}
