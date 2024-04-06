
 
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
  import { getDatabase, ref, set, onValue, onChildAdded, push, off, get, onDisconnect } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
  import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
  
  
  // Your web app's Firebase configuration
  const firebaseConfig = { 
    apiKey: "AIzaSyAFimP-R_PDw8YKIcVeCmjevBIE-nPDZmU",
    authDomain: "naseem-akbar.firebaseapp.com",
    databaseURL: "https://naseem-akbar-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "naseem-akbar",
    storageBucket: "naseem-akbar.appspot.com",
    messagingSenderId: "804593419200",
    appId: "1:804593419200:web:cfce0e173223a99cf7be25"
  };
   // Your config info here 
  
  
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase();
  
    let status = "waiting";
    let playerId;
    let playerRef;
    let players = {};
    let numPlayers, myColor, currentTurn;
    numPlayers = 0;
     let items = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  var currentBoard;
  
  var myPlayerNumber = 1;
  
    const allPlayersRef = ref(getDatabase(), `players`);
  
  
    onValue(ref(getDatabase(), 'players'), (snapshot) => {
        //Fires whenever a change occurs
        players = snapshot.val() || {};
        Object.keys(players).forEach((key) => {
          const characterState = players[key];
        })
       
        numPlayers = Object.keys(players).length;
      
        if (numPlayers < 2) {
          document.getElementById("whoseTurn").innerHTML = "Please wait for the second player to join.";
        }  
        if (numPlayers == 2 && status == "waiting") {
          status = "playing";
          if (myPlayerNumber==1) {
          document.getElementById("whoseTurn").innerHTML = "It\'s your turn  dude!";
          }
          if (myPlayerNumber==2) {
          document.getElementById("whoseTurn").innerHTML = "It\'s your opponent\'s turn  dude!";
          }
        }  
   
      });
  
  onValue(ref(getDatabase(), 'gameStats'), (snapshot) => {
        //Fires whenever a change occurs
        var gamestate = snapshot.val() || null;
        items = JSON.parse(gamestate['board']);
        currentTurn = gamestate["turn"];
        if (currentTurn == myPlayerNumber) {
            document.getElementById("whoseTurn").innerHTML = "Your turn dude "
  
        } else {
            document.getElementById("whoseTurn").innerHTML = "Your oppenent\'s turn"
  
        }
        reloadTheSquares();
        tallyScore();
      });
  
    onChildAdded(ref(getDatabase(), 'players'), (snapshot) => {
        //Fires whenever a new node is added the tree
        const addedPlayer = snapshot.val();
      });
  
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      console.log(user)
      if (user) {
        //You're logged in!
        playerId = user.uid;
        playerRef = ref(getDatabase(), `players/${playerId}`);
        if (numPlayers == 0) {
           myPlayerNumber = 1;
           myColor = "red";
        }
        if (numPlayers == 1) {
           myPlayerNumber = 2;
           myColor = "green";
        }
      
        var boardstr = JSON.stringify(items);
        if (Object.keys(players).length < 2) {
        set(
            ref(getDatabase(), `players/${playerId}`),
            {
              playerColor: myColor,
              playerNumber: myPlayerNumber,
              score: 0
            });
          document.getElementById("Playernum").innerHTML = myPlayerNumber;
          document.getElementById("Playercol").innerHTML = myColor;
            set(
            ref(getDatabase(), `gameStats`),
            {
              turn: 1,
              board: boardstr
            });
  
        } 
  
        //Remove me from Firebase when I diconnect
        onDisconnect(playerRef).remove();
      
        console.log("signed in");
        console.log(Object.keys(players).length);
        //startGame();
      } else {
        //You're logged out.
      }
    })
  
    signInAnonymously(auth).catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log(errorCode, errorMessage);
    });
  
  
  window.addEventListener("load", (event) => {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) { 
      var iDiv = document.createElement('div');
      iDiv.id = 'square-' + row + '-' + col;
      iDiv.className = 'square';
      document.getElementById('game-board').appendChild(iDiv);
      iDiv.addEventListener('click', handleSquareClick);
      
    }
  }
  let squares = document.getElementsByClassName('square');
  setInterval(gameLoop, 5000);
  });
  
  function reloadTheSquares() { 
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) { 
       let squareId = 'square-' + row + '-' + col;    
      if (items[row][col] == 0) {
         document.getElementById(squareId).style.backgroundColor = "white";
      }  
      if (items[row][col] == 1) {
         document.getElementById(squareId).style.backgroundColor = "red";
      }  
      if (items[row][col] == 2) {
         document.getElementById(squareId).style.backgroundColor = "green";
      }  
    }
  }
  }
  
  function gameLoop() {
   
      
  }
  
    function handleSquareClick(event) {
     
      if (currentTurn == myPlayerNumber && status == "playing") {
      let squareId = event.target.id;
      let squareElement = document.getElementById(squareId);
      
      // Check if the square is already occupied
      if (squareElement.classList.contains('occupied')) {
        return; // Square is already taken, do not proceed
      }
    
      // Make the move for the current player
      squareElement.classList.add('occupied');
      squareElement.classList.add('player' + myPlayerNumber);
      
      let chrow = squareId.substring(7,8);
      let chcol = squareId.substring(9,10);
      
      items[chrow][chcol] = myPlayerNumber;
      
      currentBoard = JSON.stringify(items);
      if (currentTurn == 1) {currentTurn = 2;} else 
      {currentTurn = 1;}
  
      const reference = ref(db, 'gameStats');
      set(reference, { 
      turn: currentTurn,
      board: currentBoard
      }); 
      
      tallyScore();
  
      }
    }
  
    function tallyScore() {
      const occurrences1 = countOccurrencesof1(items);
      const occurrences2 = countOccurrencesof2(items);
      if (myPlayerNumber==1) {
      document.getElementById("myScore").innerHTML = occurrences1;
      document.getElementById("otherScore").innerHTML = occurrences2;
      }
      if (myPlayerNumber==2) {
      document.getElementById("myScore").innerHTML = occurrences2;
      document.getElementById("otherScore").innerHTML = occurrences1;
      }
      const hasFour1 = hasFourInARow1(items);
      const hasFour2 = hasFourInARow2(items);
      if (hasFour1 && myPlayerNumber == 1) {
        document.getElementById("won4").innerHTML = "You won 4 in a row, game over!"
        status = "done";
      }
       if (hasFour2 && myPlayerNumber == 1) {
        document.getElementById("won4").innerHTML = "Your oppenent won 4 in a row, game over!"
         status = "done";
      }
      if (hasFour1 && myPlayerNumber == 2) {
        document.getElementById("won4").innerHTML = "Your oppenent won 4 in a row, game over!"
         status = "done";
      }
       if (hasFour2 && myPlayerNumber == 2) {
        document.getElementById("won4").innerHTML = "You won 4 in a row, game over!"
         status = "done";
      }
  
  
    }
    function countOccurrencesof1(items) {
    let count = 0;
  
    // Check rows
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        if (items[i][j] === 1 && items[i][j + 1] === 1 && items[i][j + 2] === 1) {
          count++;
        }
      }
    }
  
    // Check columns
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        if (items[i][j] === 1 && items[i + 1][j] === 1 && items[i + 2][j] === 1) {
          count++;
        }
      }
    }
  
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (items[i][j] === 1 && items[i + 1][j + 1] === 1 && items[i + 2][j + 2] === 1) {
          count++;
        }
      }
    }
  
    // Check diagonals (bottom-left to top-right)
    for (let i = 4; i >= 2; i--) {
      for (let j = 0; j < 3; j++) {
        if (items[i][j] === 1 && items[i - 1][j + 1] === 1 && items[i - 2][j + 2] === 1) {
          count++;
        }
      }
    }
  
    return count;
  }
  
  function countOccurrencesof2(items) {
    let count = 0;
  
    // Check rows
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        if (items[i][j] === 2 && items[i][j + 1] === 2 && items[i][j + 2] === 2) {
          count++;
        }
      }
    }
  
    // Check columns
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        if (items[i][j] === 2 && items[i + 1][j] === 2 && items[i + 2][j] === 2) {
          count++;
        }
      }
    }
  
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (items[i][j] === 2 && items[i + 1][j + 1] === 2 && items[i + 2][j + 2] === 2) {
          count++;
        }
      }
    }
  
    // Check diagonals (bottom-left to top-right)
    for (let i = 4; i >= 2; i--) {
      for (let j = 0; j < 3; j++) {
        if (items[i][j] === 2 && items[i - 1][j + 1] === 2 && items[i - 2][j + 2] === 2) {
          count++;
        }
      }
    }
  
    return count;
  }
  function hasFourInARow1(items) {
    // Check rows
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        if (
          items[i][j] === 1 &&
          items[i][j + 1] === 1 &&
          items[i][j + 2] === 1 &&
          items[i][j + 3] === 1
        ) {
          return true;
        }
      }
    }
  // Check columns 
   for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 5; j++) {
        if (
          items[i][j] === 1 &&
          items[i+1][j] === 1 &&
          items[i+2][j] === 1 &&
          items[i+3][j] === 1
        ) {
          return true;
        }
      }
    }
  
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (
          items[i][j] === 1 &&
          items[i + 1][j + 1] === 1 &&
          items[i + 2][j + 2] === 1 &&
          items[i + 3][j + 3] === 1
        ) {
          return true;
        }
      }
    }
  
    // Check diagonals (bottom-left to top-right)
    for (let i = 3; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        if (
          items[i][j] === 1 &&
          items[i - 1][j + 1] === 1 &&
          items[i - 2][j + 2] === 1 &&
          items[i - 3][j + 3] === 1
        ) {
          return true;
        }
      }
    }
  
    return false;
  }
  
  function hasFourInARow2(items) {
    // Check rows
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        if (
          items[i][j] === 2 &&
          items[i][j + 1] === 2 &&
          items[i][j + 2] === 2 &&
          items[i][j + 3] === 2
        ) {
          return true;
        }
      }
    }
  
   // Check columns
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 5; j++) {
        if (
          items[i][j] === 2 &&
          items[i+1][j] === 2 &&
          items[i+2][j] === 2 &&
          items[i+3][j] === 2
        ) {
          return true;
        }
      }
    }
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (
          items[i][j] === 2 &&
          items[i + 1][j + 1] === 2 &&
          items[i + 2][j + 2] === 2 &&
          items[i + 3][j + 3] === 2
        ) {
          return true;
        }
      }
    }
  
    // Check diagonals (bottom-left to top-right)
    for (let i = 3; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        if (
          items[i][j] === 2 &&
          items[i - 1][j + 1] === 2 &&
          items[i - 2][j + 2] === 2 &&
          items[i - 3][j + 3] === 2
        ) {
          return true;
        }
      }
    }
  
    return false;
  }
   
  
  
  
  
  
  