// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract XsollaLeaderboard {
    // Structure to store client game data
    struct ClientData {
        uint32 gameTime;
        uint32 moves;
        uint8[] lineClears;
        string[] powerUpsUsed;
    }

    // Structure to store player data with enhanced fields
    struct Player {
        address playerAddress;
        uint256 score;
        uint8 level;
        uint32 lines;
        uint256 timestamp;
        string verificationHash;
        uint8 rank;
        ClientData clientData;
    }

    // Array to store all players
    Player[] private players;

    // Mapping to track if an address is already in the leaderboard
    mapping(address => bool) private isPlayer;

    // Mapping to track the index of each player in the players array
    mapping(address => uint256) private playerIndex;

    // Event emitted when a score is submitted or updated
    event ScoreUpdated(
        address indexed playerAddress,
        uint256 score,
        uint8 level,
        uint32 lines,
        string verificationHash
    );

    /**
     * @dev Submit or update a player's score with enhanced data
     * @param _score The player's score
     * @param _level Player's level
     * @param _lines Number of lines completed
     * @param _verificationHash Hash for score verification
     * @param _gameTime Time played in seconds
     * @param _moves Number of moves made
     * @param _lineClears Array of line clear counts
     * @param _powerUpsUsed Array of power-up identifiers used
     */
    function submitScore(
        uint256 _score,
        uint8 _level,
        uint32 _lines,
        string memory _verificationHash,
        uint32 _gameTime,
        uint32 _moves,
        uint8[] memory _lineClears,
        string[] memory _powerUpsUsed
    ) public {
        // Create ClientData struct
        ClientData memory gameData = ClientData(
            _gameTime,
            _moves,
            _lineClears,
            _powerUpsUsed
        );

        if (isPlayer[msg.sender]) {
            // Update existing player
            uint256 index = playerIndex[msg.sender];
            players[index].score = _score;
            players[index].level = _level;
            players[index].lines = _lines;
            players[index].timestamp = block.timestamp;
            players[index].verificationHash = _verificationHash;
            players[index].clientData = gameData;
        } else {
            // Add new player with default rank of 0 (will be updated by sorting)
            players.push(
                Player(
                    msg.sender,
                    _score,
                    _level,
                    _lines,
                    block.timestamp,
                    _verificationHash,
                    0,
                    gameData
                )
            );
            isPlayer[msg.sender] = true;
            playerIndex[msg.sender] = players.length - 1;
        }

        // Sort the leaderboard and update ranks
        sortLeaderboard();

        emit ScoreUpdated(msg.sender, _score, _level, _lines, _verificationHash);
    }

    /**
     * @dev For backward compatibility - allows submitting just a score
     * @param _score The player's score
     */
    function submitScore(uint256 _score) public {
        uint8[] memory emptyLineClears = new uint8[](0);
        string[] memory emptyPowerUps = new string[](0);

        submitScore(
            _score,
            1,             // Default level
            0,             // Default lines
            "",            // Empty verification hash
            0,             // Default game time
            0,             // Default moves
            emptyLineClears,
            emptyPowerUps
        );
    }

    /**
     * @dev Get the current leaderboard
     * @return The sorted array of players
     */
    function getLeaderboard() public view returns (Player[] memory) {
        return players;
    }

    /**
     * @dev Get the top N players from the leaderboard
     * @param _count The number of top players to return
     * @return The top N players
     */
    function getTopPlayers(uint256 _count) public view returns (Player[] memory) {
        uint256 count = _count > players.length ? players.length : _count;
        Player[] memory topPlayers = new Player[](count);

        for (uint256 i = 0; i < count; i++) {
            topPlayers[i] = players[i];
        }

        return topPlayers;
    }

    /**
     * @dev Get the total number of players on the leaderboard
     * @return The number of players
     */
    function getPlayerCount() public view returns (uint256) {
        return players.length;
    }

    /**
     * @dev Get a specific player's score
     * @param _player The address of the player
     * @return The player's score, or 0 if player doesn't exist
     */
    function getPlayerScore(address _player) public view returns (uint256) {
        if (!isPlayer[_player]) {
            return 0;
        }
        uint256 index = playerIndex[_player];
        return players[index].score;
    }

    /**
     * @dev Get a specific player's complete data
     * @param _player The address of the player
     * @return The player's complete data
     */
    function getPlayerData(address _player) public view returns (Player memory) {
        require(isPlayer[_player], "Player not found");
        uint256 index = playerIndex[_player];
        return players[index];
    }

    /**
     * @dev Sort the leaderboard in descending order (highest score first)
     * Uses a simple bubble sort for simplicity, but consider gas costs for large leaderboards
     */
    function sortLeaderboard() private {
        uint256 n = players.length;
        if (n <= 1) return;

        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (players[j].score < players[j + 1].score) {
                    // Swap players
                    Player memory temp = players[j];
                    players[j] = players[j + 1];
                    players[j + 1] = temp;

                    // Update index mapping
                    playerIndex[players[j].playerAddress] = j;
                    playerIndex[players[j + 1].playerAddress] = j + 1;
                }
            }
        }

        // Update ranks after sorting
        for (uint256 i = 0; i < n; i++) {
            players[i].rank = uint8(i + 1);
        }
    }
}