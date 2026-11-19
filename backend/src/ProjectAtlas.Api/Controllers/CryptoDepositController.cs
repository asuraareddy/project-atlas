using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Crypto;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/crypto")]
public class CryptoDepositController : ControllerBase
{
    [HttpGet("whitelist")]
    public IActionResult GetWhitelist()
    {
        var assets = CryptoWatcherService.GetWhitelistedAssets();
        return Ok(new
        {
            data = new
            {
                assets,
                count = assets.Count
            }
        });
    }

    public record CreateIntentRequest(string Network, string Asset, long AmountGbpMinor);

    [HttpPost("deposit-intents")]
    public IActionResult CreateIntent([FromBody] CreateIntentRequest request)
    {
        try
        {
            string userId = "usr_player_01"; // Default or from JWT
            var intent = CryptoWatcherService.CreateDepositIntent(userId, request.Network, request.Asset, request.AmountGbpMinor);

            return Ok(new
            {
                data = new
                {
                    intent
                }
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("deposit-intents/{id}")]
    public IActionResult GetIntentById(string id)
    {
        var intent = CryptoWatcherService.GetIntent(id);
        if (intent == null)
        {
            return NotFound(new { error = $"Deposit intent '{id}' not found." });
        }

        return Ok(new
        {
            data = new
            {
                intent
            }
        });
    }

    public record SimulateWatcherRequest(string IntentId, string TxHash, string Network, string Asset, string DestinationAddress, decimal AmountCrypto, int Confirmations);

    [HttpPost("simulate-watcher")]
    public IActionResult SimulateWatcher([FromBody] SimulateWatcherRequest request)
    {
        var tx = new ChainTransactionRecord
        {
            TxHash = request.TxHash,
            Network = request.Network,
            Asset = request.Asset,
            DestinationAddress = request.DestinationAddress,
            AmountCrypto = request.AmountCrypto,
            Confirmations = request.Confirmations
        };

        var (credited, message) = CryptoWatcherService.ProcessObservedTransaction(request.IntentId, tx);

        return Ok(new
        {
            data = new
            {
                credited,
                message,
                intent = CryptoWatcherService.GetIntent(request.IntentId)
            }
        });
    }
}
