using Microsoft.AspNetCore.SignalR;
using ProjectAtlas.Domain.Games.Carrom;
using ProjectAtlas.Domain.Games.Pool;
using ProjectAtlas.Domain.Games.Ludo;
using ProjectAtlas.Domain.Games.Rummy;

namespace ProjectAtlas.Api.Hubs;

public class CarromHub : Hub
{
    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("PlayerJoined", new
        {
            connectionId = Context.ConnectionId,
            roomId,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    public async Task SendShot(string roomId, double angle, double power, double strikerX)
    {
        await Clients.Group(roomId).SendAsync("ShotExecuted", new
        {
            playerId = Context.ConnectionId,
            angle,
            power,
            strikerX,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    public async Task TriggerBotShot(string roomId, string targetColor)
    {
        var color = targetColor.Equals("white", StringComparison.OrdinalIgnoreCase) ? CoinType.White : CoinType.Black;
        // Compute bot shot using standard physics heuristics
        var botShot = CarromPhysicsEngine.ComputeBotShot(new List<CarromCoin>(), color);

        await Clients.Group(roomId).SendAsync("BotShotCalculated", new
        {
            angle = botShot.Angle,
            power = botShot.Power,
            strikerX = botShot.StrikerX,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }
}

public class PoolHub : Hub
{
    public async Task JoinTable(string tableId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, tableId);
        await Clients.Group(tableId).SendAsync("PlayerJoinedTable", new
        {
            connectionId = Context.ConnectionId,
            tableId
        });
    }

    public async Task CueShot(string tableId, double angle, double power, double cueBallX, double cueBallY)
    {
        await Clients.Group(tableId).SendAsync("CueShotTaken", new
        {
            playerId = Context.ConnectionId,
            angle,
            power,
            cueBallX,
            cueBallY,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    public async Task BallInHandPlaced(string tableId, double x, double y)
    {
        await Clients.Group(tableId).SendAsync("BallInHandUpdated", new
        {
            playerId = Context.ConnectionId,
            x,
            y
        });
    }
}

public class LudoHub : Hub
{
    public async Task JoinCircuit(string circuitId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, circuitId);
    }

    public async Task RollDice(string circuitId)
    {
        int roll = LudoEngine.RollDiceCsprng();
        await Clients.Group(circuitId).SendAsync("DiceRolled", new
        {
            playerId = Context.ConnectionId,
            roll,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    public async Task MoveToken(string circuitId, int tokenId, int roll)
    {
        await Clients.Group(circuitId).SendAsync("TokenMoved", new
        {
            playerId = Context.ConnectionId,
            tokenId,
            roll,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }
}

public class RummyHub : Hub
{
    public async Task JoinTable(string tableId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, tableId);
        await Clients.Group(tableId).SendAsync("PlayerJoinedRummyTable", new
        {
            connectionId = Context.ConnectionId,
            tableId
        });
    }

    public async Task DrawCard(string tableId, string source) // "CLOSED_DECK" or "OPEN_DISCARD"
    {
        await Clients.Group(tableId).SendAsync("CardDrawn", new
        {
            playerId = Context.ConnectionId,
            source,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    public async Task DiscardCard(string tableId, string cardId)
    {
        await Clients.Group(tableId).SendAsync("CardDiscarded", new
        {
            playerId = Context.ConnectionId,
            cardId,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    public async Task DeclareShow(string tableId, List<CardGroup> groups, int wildJokerRank)
    {
        var validation = RummyValidator.ValidateHand(groups, wildJokerRank);
        await Clients.Group(tableId).SendAsync("ShowDeclared", new
        {
            playerId = Context.ConnectionId,
            isValid = validation.IsValidDeclaration,
            points = validation.TotalScorePoints,
            message = validation.Message,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }
}
