const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let games = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("startGame", () => {
    const playerSign = Math.random() < 0.5 ? "X" : "O";
    const aiSign = playerSign === "X" ? "O" : "X";

    const gameState = {
      board: Array(9).fill(null),
      currentTurn: "X",
      playerSign,
      aiSign,
      gameOver: false,
      winner: null,

    };

    if (gameState.currentTurn === aiSign) {
      makeAIMove(gameState);
    }

    games[socket.id] = gameState;
    socket.emit("gameStart", gameState);
  });

  socket.on("playerMove", (index) => {
    const gameState = games[socket.id];
    if (
      gameState.gameOver ||
      gameState.board[index] !== null ||
      gameState.currentTurn !== gameState.playerSign

  ) {
      return;
    }

    gameState.board[index] = gameState.playerSign;
    gameState.currentTurn = gameState.aiSign;
    checkGameOver(gameState);

    if (!gameState.gameOver) {
      makeAIMove(gameState);
      checkGameOver(gameState);
    }

    io.to(socket.id).emit("gameUpdate", gameState);
  });

  socket.on("disconnect", () => {
    delete games[socket.id];
    console.log("A user disconnected:", socket.id);
  });
});

function makeAIMove(gameState) {
  const emptyIndices = gameState.board
    .map((value, index) => (value === null ? index : null))
    .filter((val) => val !== null);
  const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  gameState.board[aiMove] = gameState.aiSign;
  gameState.currentTurn = gameState.playerSign;
}

function checkGameOver(gameState) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (
      gameState.board[a] &&
      gameState.board[a] === gameState.board[b] &&
      gameState.board[a] === gameState.board[c]
    ) {
      gameState.gameOver = true;
      gameState.winner = gameState.board[a];
      return;
    }
  }

  if (gameState.board.every((cell) => cell !== null)) {
    gameState.gameOver = true;
    gameState.winner = "Draw";
  }
}
