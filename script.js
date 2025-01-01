  // Import Firebase functions
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB0Pb-j6Sr4sDDCdwOm6N_UEYPofjsaadw",
    authDomain: "moviepicker-b71da.firebaseapp.com",
    projectId: "moviepicker-b71da",
    databaseURL: "https://moviepicker-b71da-default-rtdb.firebaseio.com",
    storageBucket: "moviepicker-b71da.firebasestorage.app",
    messagingSenderId: "971993344619",
    appId: "1:971993344619:web:659b3e3dcdc42a3c195f2e",
    measurementId: "G-2NSCXY5NNX"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Define some example movies
  const movies = [
    { id: 1, title: 'Movie 1', poster: 'https://via.placeholder.com/150' },
    { id: 2, title: 'Movie 2', poster: 'https://via.placeholder.com/150' },
    { id: 3, title: 'Movie 3', poster: 'https://via.placeholder.com/150' }
  ];

  let currentMovieIndex = 0;
  let sharedPassword = "";

  // Select elements
  const startButton = document.getElementById("start-btn");
  const sharedPasswordInput = document.getElementById("shared-password");
  const setupScreen = document.getElementById("setup-screen");
  const swipeScreen = document.getElementById("swipe-screen");
  const movieCard = document.getElementById("movie-card");
  const moviePoster = document.getElementById("movie-poster");
  const movieTitle = document.getElementById("movie-title");
  const resultDiv = document.getElementById("result");

  // Start button click handler
  startButton.addEventListener("click", () => {
    const inputPassword = sharedPasswordInput.value.trim();
    if (inputPassword === "") {
      alert("Please enter a password.");
      return;
    }
    sharedPassword = inputPassword;

    // Transition screens
    setupScreen.style.display = "none";
    swipeScreen.style.display = "block";

    // Load the first movie
    loadMovie();
  });

  // Load a movie onto the screen
  function loadMovie() {
    if (currentMovieIndex >= movies.length) {
      resultDiv.textContent = "No more movies to swipe!";
      movieCard.style.display = "none";
      return;
    }

    const movie = movies[currentMovieIndex];
    moviePoster.src = movie.poster;
    movieTitle.textContent = movie.title;
    resultDiv.textContent = "";
  }

  // Swipe Left (dislike)
  window.swipeLeft = function() {
    console.log(`Movie "${movies[currentMovieIndex].title}" disliked`);
    saveVote(movies[currentMovieIndex].id, sharedPassword, 'left');
    nextMovie();
  }

  // Swipe Right (like)
  window.swipeRight = function() {
    console.log(`Movie "${movies[currentMovieIndex].title}" liked`);

    // Save the vote in Firebase
    saveVote(movies[currentMovieIndex].id, sharedPassword, 'right');

    // Check if both users liked the same movie
    checkMatch(movies[currentMovieIndex].id, sharedPassword);

    nextMovie();
  }

  // Move to the next movie
  function nextMovie() {
    currentMovieIndex++;
    loadMovie();
  }

  function checkUserTurn(password, movieId) {
    const db = getDatabase(app);
    const voteRef = ref(db, `votes/${password}/${movieId}`);
    
    // Check if vote data exists for the movie
    return get(voteRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Check if user1 has voted, then it's user2's turn
          const data = snapshot.val();
          if (data.user1) {
            return 'user2'; // It's user2's turn
          } else {
            return 'user1'; // It's user1's turn
          }
        } else {
          return 'user1'; // It's user1's turn because no votes yet
        }
      })
      .catch((error) => {
        console.error("Error checking user turn: ", error);
        return null;
      });
  }
  

 // Save the vote (for both users)
 function saveVote(movieId, password, direction) {
  checkUserTurn(password, movieId)
    .then((user) => {
      if (user) {
        const db = getDatabase(app);
        const voteRef = ref(db, `votes/${password}/${movieId}`);
        
        // Save the vote based on the user turn
        const userVote = {
          [user]: direction
        };
        
        // Save the vote to Firebase
        set(voteRef, userVote)
          .then(() => {
            console.log(`${user} voted "${direction}" for movie ID: ${movieId}`);
          })
          .catch((error) => {
            console.error("Error saving vote: ", error);
          });
      }
    });
}


// Checking for a match (both users must swipe right)
function checkMatch(movieId, password) {
  const db = getDatabase();
  const voteRef = ref(db, `votes/${password}/${movieId}`);
  
  get(voteRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();

      // Check if both users have swiped right
      if (data.user1 === 'right' && data.user2 === 'right') {
        resultDiv.textContent = 'It\'s a match!';
      } else {
        resultDiv.textContent = 'No match yet.';
      }
    } else {
      resultDiv.textContent = 'No votes recorded yet.';
    }
  }).catch((error) => {
    console.error('Error reading from Firebase', error);
  }); 
}
