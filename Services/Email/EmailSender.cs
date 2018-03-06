using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Services.Encryption;
using Microsoft.Extensions.Options;

namespace GoNorth.Services.Email
{
    /// <summary>
    /// Sends and Email for mail confirmation
    /// </summary>
    public class EmailSender : IEmailSender
    {
        /// <summary>
        /// Configuration
        /// </summary>
        private EmailConfig _Configuration;

        /// <summary>
        /// Encryption Service
        /// </summary>
        private IEncryptionService _EncryptionService;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        /// <param name="encryptionService">Encryption Service</param>
        public EmailSender(IOptions<ConfigurationData> configuration, IEncryptionService encryptionService)
        {
            _Configuration = configuration.Value.Email;
            _EncryptionService = encryptionService;
        }

        /// <summary>
        /// Sends an email
        /// </summary>
        /// <param name="email">Email adress</param>
        /// <param name="subject">Subject</param>
        /// <param name="message">Message</param>
        /// <returns>Task for the async task</returns>
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            if(string.IsNullOrEmpty(_Configuration.SmtpServer))
            {
                return;
            }

            using(SmtpClient client = new SmtpClient(_Configuration.SmtpServer, _Configuration.SmtpPort))
            {
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(_Configuration.SmtpUsername, _EncryptionService.Decrypt(_Configuration.SmtpPassword));
                client.EnableSsl = _Configuration.SmtpUseSSL;
                client.DeliveryMethod = SmtpDeliveryMethod.Network;

                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(_Configuration.SmtpUsername, _Configuration.SmtpFromName);
                mailMessage.To.Add(email);
                mailMessage.Body = message;
                mailMessage.Subject = subject;
                mailMessage.IsBodyHtml = true;
                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
