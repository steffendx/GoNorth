using System.Threading.Tasks;

namespace GoNorth.Services.Email
{
    /// <summary>
    /// Interface for Email Senders
    /// </summary>
    public interface IEmailSender
    {
        /// <summary>
        /// Sends an email
        /// </summary>
        /// <param name="email">Email adress</param>
        /// <param name="subject">Subject</param>
        /// <param name="message">Message</param>
        /// <returns>Task for the async task</returns>
        Task SendEmailAsync(string email, string subject, string message);
    }
}
