using GoNorth.Services.Encryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Administration Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("/api/[controller]/[action]")]
    public class AdministrationApiController : ControllerBase
    {
        /// <summary>
        /// Request for encrypting a config value
        /// </summary>
        public class EncryptConfigValueRequest
        {
            /// <summary>
            /// Config Value
            /// </summary>
            public string ConfigValue { get; set; }
        };


        /// <summary>
        /// Encryption Service
        /// </summary>
        private readonly IEncryptionService _encryptionService;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="encryptionService">Encryption Service</param>
        /// <param name="logger">Logger</param>
        public AdministrationApiController(IEncryptionService encryptionService, ILogger<AdministrationApiController> logger)
        {
            _encryptionService = encryptionService;
            _logger = logger;
        }

        /// <summary>
        /// Encrypted a config value
        /// </summary>
        /// <param name="value">Encryption request</param>
        /// <returns>Encrypted value</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public IActionResult EncryptConfigValue([FromBody]EncryptConfigValueRequest value)
        {
            string encryptedValue = _encryptionService.Encrypt(value.ConfigValue);
            return Ok(encryptedValue);
        }

    }
}