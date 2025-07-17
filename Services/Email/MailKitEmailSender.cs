using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Services.Encryption;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace GoNorth.Services.Email
{
    /// <summary>
    /// Sends and Email for mail confirmation using MailKit
    /// </summary>
    public class MailKitEmailSender : IEmailSender
    {
        /// <summary>
        /// Port to use Start TLS for
        /// </summary>
        private const int StartTlsPort = 587;

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
        public MailKitEmailSender(IOptions<ConfigurationData> configuration, IEncryptionService encryptionService)
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
            if (string.IsNullOrEmpty(_Configuration.SmtpServer))
            {
                return;
            }

            using (SmtpClient smtpClient = new SmtpClient())
            {
                try
                {
                    await ConnectSmtpClient(smtpClient);

                    MimeMessage mimeMessage = BuildMessage(email, subject, message);
                    await smtpClient.SendAsync(mimeMessage);
                }
                finally
                {
                    if (smtpClient.IsConnected)
                    {
                        await smtpClient.DisconnectAsync(true);
                    }
                }
            }
        }
        
        /// <summary>
        /// Connects the SMTP Client
        /// </summary>
        /// <param name="client">SMTP Client</param>
        /// <returns>Task</returns>
        private async Task ConnectSmtpClient(SmtpClient client)
        {
            client.CheckCertificateRevocation = false;

            if (_Configuration.SmtpUseSSL && _Configuration.SmtpPort == StartTlsPort)
            {
                await client.ConnectAsync(_Configuration.SmtpServer, StartTlsPort, SecureSocketOptions.StartTls);
            }
            else
            {
                await client.ConnectAsync(_Configuration.SmtpServer, _Configuration.SmtpPort, _Configuration.SmtpUseSSL);
            }

            string userName = _Configuration.SmtpUsername;
            string password = _Configuration.SmtpPassword;
            if (!string.IsNullOrEmpty(userName) && !string.IsNullOrEmpty(password))
            {
                await client.AuthenticateAsync(userName, _EncryptionService.Decrypt(password));
            }
        }

        /// <summary>
        /// Builds a message
        /// </summary>
        /// <param name="to">Reciepient</param>
        /// <param name="subject">Subject</param>
        /// <param name="body">Body</param>
        /// <returns>Message</returns>
        private MimeMessage BuildMessage(string to, string subject, string body)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_Configuration.SmtpFromName));
            string[] toSplitted = to.Split(";");
            foreach (string curReceiver in toSplitted)
            {
                message.To.Add(MailboxAddress.Parse(curReceiver.Trim()));
            }
            message.Subject = subject;

            BodyBuilder builder = new BodyBuilder();
            builder.HtmlBody = body;
            message.Body = builder.ToMessageBody();

            return message;
        }

    }
}
