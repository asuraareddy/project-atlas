using Microsoft.AspNetCore.Mvc;
using ProjectAtlas.Domain.Ledger;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1")]
public class WalletsController : ControllerBase
{
    [HttpGet("me/wallets")]
    public IActionResult GetMyWallet()
    {
        string userId = "usr_player_01";
        var wallet = LedgerService.GetBalance(userId);

        return Ok(new
        {
            data = new
            {
                wallet
            }
        });
    }

    [HttpGet("me/transactions")]
    public IActionResult GetMyTransactions()
    {
        var transactions = LedgerService.GetTransactionHistory();

        return Ok(new
        {
            data = new
            {
                transactions,
                count = transactions.Count
            }
        });
    }

    public record WithdrawalPayload(long AmountMinor, string DestinationType, string DestinationReference);

    [HttpPost("withdrawals")]
    public IActionResult RequestWithdrawal([FromBody] WithdrawalPayload payload)
    {
        string userId = "usr_player_01";

        try
        {
            string txId = $"wd_req_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            bool reserved = LedgerService.ReserveCash(userId, payload.AmountMinor, txId);

            return Ok(new
            {
                data = new
                {
                    withdrawal = new
                    {
                        id = txId,
                        userId,
                        amountMinor = payload.AmountMinor,
                        destinationType = payload.DestinationType,
                        destinationReference = payload.DestinationReference,
                        status = "PENDING_APPROVAL"
                    },
                    message = "Withdrawal requested and funds reserved successfully."
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
