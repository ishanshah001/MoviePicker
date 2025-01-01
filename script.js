// Define some example movies
const movies = [
    { id: 1, title: 'Movie 1', poster: 'https://via.placeholder.com/150' },
    { id: 2, title: 'Movie 2', poster: 'https://via.placeholder.com/150' },
    { id: 3, title: 'Movie 3', poster: 'https://via.placeholder.com/150' },
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
  function swipeLeft() {
    console.log(`Movie "${movies[currentMovieIndex].title}" disliked`);
    nextMovie();
  }
  
  // Swipe Right (like)
  function swipeRight() {
    console.log(`Movie "${movies[currentMovieIndex].title}" liked`);
  
    // Save the vote in Firebase
    const movie = movies[currentMovieIndex];
    saveVote(movie.id, sharedPassword, 'right');
  
    // Check if both users liked the same movie
    checkMatch(movie.id, sharedPassword);
  
    nextMovie();
  }
  
  // Move to the next movie
  function nextMovie() {
    currentMovieIndex++;
    loadMovie();
  }
  
 // Using Modular SDK to save a vote
function saveVote(movieId, password, direction) {
    const db = getDatabase();
    const voteRef = ref(db, `votes/${password}/${movieId}`);
    set(voteRef, {
      direction: direction
    });
  }
  
  // Checking for a match
  function checkMatch(movieId, password) {
    const db = getDatabase();
    const voteRef = ref(db, `votes/${password}/${movieId}`);
    get(voteRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.direction === 'right') {
          document.getElementById('result').textContent = 'It\'s a match!';
        }
      }
    }).catch((error) => {
      console.error('Error reading from Firebase', error);
    });
  }
  