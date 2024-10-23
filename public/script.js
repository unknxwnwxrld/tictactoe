const socket = io();
      let gameState = {};

      function startGame() {
        socket.emit("startGame");
        document.body.style.background = 'white';
      }

      socket.on("gameStart", (state) => {
        gameState = state;
        renderBoard();
        document.getElementById(
          "message"
        ).innerText = `You are ${gameState.playerSign}`;
      });

      socket.on("gameUpdate", (state) => {
        gameState = state;
        renderBoard();
        if (gameState.gameOver) {
                  if (gameState.winner === "Draw") {
                    document.getElementById("message").innerText = "It's a draw!";
                    document.body.style.background = 'yellow';
                  } else {
                    if (gameState.winner === gameState.playerSign) {
                      document.getElementById("message").innerText = "You win!";
                      document.body.style.background = 'green';
                    } else {
                      document.getElementById("message").innerText = "You lose!";
                      document.body.style.background = 'red';
                    }
                  }
        }
      });

      function renderBoard() {
        const gameElement = document.getElementById("game");
        gameElement.innerHTML = "";
        gameState.board.forEach((cell, index) => {
          const cellElement = document.createElement("div");
          cellElement.className = "cell";
          cellElement.innerText = cell || "";
          cellElement.addEventListener("click", () => {
            if (gameState.gameOver) {
              return;
            }
            if (cell !== null) {
              alert("Клітинка зайнята!");
            } else if (gameState.currentTurn === gameState.playerSign) {
              socket.emit("playerMove", index);
              socket.style.backgroundColor = "red"
            }
          });
          gameElement.appendChild(cellElement);
        });
      }
