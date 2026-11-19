using Microsoft.AspNetCore.Mvc;

namespace ProjectAtlas.Api.Controllers;

[ApiController]
[Route("api/v1/games/other")]
public class OtherGamesController : ControllerBase
{
    private record GameHubItem(
        string Id,
        string Name,
        string Category,
        string Description,
        string Badge,
        string Route,
        string Icon,
        int MinPlayers,
        int MaxPlayers
    );

    [HttpGet]
    public IActionResult GetOtherGames()
    {
        var games = new List<GameHubItem>
        {
            new("game_carrom", "Carrom Tabletop", "Tabletop", "2D rigid-body disc physics tournament tables with ray-cast aiming and multiplayer lobbies.", "Category 4", "/carrom", "Target", 2, 4),
            new("game_ludo", "Ludo Grand Circuit", "Board & Dice", "CSPRNG cryptographically seeded 4-player board racing with tournament safe zones.", "Category 4", "/ludo", "Gamepad2", 2, 4),
            new("game_pool_8ball", "8-Ball Pool Pro", "Pool", "Championship billiards cue simulation with precision trajectory physics and ball-in-hand rules.", "Category 4", "/pool", "CircleDot", 2, 2),
            new("game_ace2three", "Ace2Three", "Card & Rummy", "Official 13-card points rummy table with wild jokers, pure sequence checks, and instant declare.", "Category 4", "/ace2three", "Layers", 2, 6),
            new("game_chess_speed", "Blitz Chess", "Strategy", "5-minute blitz chess ladder with FIDE rating integration and anti-cheat engine.", "Category 4", "/other-games", "Shield", 2, 2)
        };

        var poolRooms = new[]
        {
            new { id = "pool_room_london", name = "London Snooker Hall", stake = "5.00 pts", players = 2, maxPlayers = 2, status = "ACTIVE" },
            new { id = "pool_room_mayfair", name = "Mayfair VIP Lounge", stake = "25.00 pts", players = 1, maxPlayers = 2, status = "WAITING" }
        };

        var carromRooms = new[]
        {
            new { id = "carrom_room_dubai", name = "Dubai Tabletop Arena", stake = "2.50 pts", players = 2, maxPlayers = 4, status = "ACTIVE" },
            new { id = "carrom_room_mumbai", name = "Mumbai Striker Masters", stake = "10.00 pts", players = 4, maxPlayers = 4, status = "FULL" },
            new { id = "carrom_room_singapore", name = "Singapore Blitz Open", stake = "5.00 pts", players = 1, maxPlayers = 2, status = "WAITING" }
        };

        var ludoRooms = new[]
        {
            new { id = "ludo_circuit_1", name = "Grand Prix 4P", stake = "1.00 pts", players = 3, maxPlayers = 4, status = "WAITING" },
            new { id = "ludo_circuit_2", name = "Speedway 2P Duel", stake = "5.00 pts", players = 2, maxPlayers = 2, status = "ACTIVE" },
            new { id = "ludo_circuit_3", name = "Royal Circuit 4P", stake = "10.00 pts", players = 1, maxPlayers = 4, status = "WAITING" }
        };

        return Ok(new
        {
            data = new
            {
                games,
                poolRooms,
                carromRooms,
                ludoRooms
            },
            meta = new
            {
                count = games.Count,
                timestamp = DateTime.UtcNow.ToString("o")
            }
        });
    }
}
