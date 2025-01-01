// Movie data (Replace with API calls later)
const movies = [
    { id: 1, title: "Inception", poster: "https://via.placeholder.com/300x400" },
    { id: 2, title: "The Notebook", poster: "https://via.placeholder.com/300x400" },
    { id: 3, title: "Interstellar", poster: "https://via.placeholder.com/300x400" },
  ];
  
  let currentMovieIndex = 0;
  let userLikes = [];
  let sharedPassword = "";
  let storedLikes = {};
  
  // Elements
  const setupScreen = document.getElementById("setup-screen");
  const swipeScreen = document.getElementById("swipe-screen");
  const moviePoster = document.getElementById("movie-poster");
  const movieTitle = document.getElementById("movie-title");
  const resultDiv = document.getElementById("result");
  const startButton = document.getElementById("start-btn");
  
  // Initialize
  startButton.addEventListener("click", () => {
    const inputPassword = document.getElementById("shared-password").value;
    if (!inputPassword) {
      alert("Please enter a valid password.");
      return;
    }
  
    sharedPassword = inputPassword;
    setupScreen.style.display = "none";
    swipeScreen.style.display = "block";
  
    // Retrieve stored likes for the password
    storedLikes = JSON.parse(localStorage.getItem(sharedPassword)) || {};
    loadMovie();
  });
  
  function loadMovie() {
    if (currentMovieIndex >= movies.length) {
      resultDiv.textContent = "No more movies to swipe!";
      document.getElementById("movie-card").style.display = "none";
      return;
    }
  
    const movie = movies[currentMovieIndex];
    moviePoster.src = movie.poster;
    movieTitle.textContent = movie.title;
  }
  
  function swipeLeft() {
    currentMovieIndex++;
    loadMovie();
  }
  
  function swipeRight() {
    const movie = movies[currentMovieIndex];
    userLikes.push(movie.id);
  
    // Increment likes for the current movie in localStorage
    storedLikes[movie.id] = (storedLikes[movie.id] || 0) + 1;
  
    // Save to localStorage
    localStorage.setItem(sharedPassword, JSON.stringify(storedLikes));
  
    // Check if it's a match
    if (storedLikes[movie.id] >= 2) {
      resultDiv.textContent = `Match Found! Watch "${movie.title}"`;
      document.getElementById("movie-card").style.display = "none";
      return;
    }
  
    currentMovieIndex++;
    loadMovie();
  }
  
  // Listen for changes in localStorage (sync across tabs)
  window.addEventListener("storage", (event) => {
    if (event.key === sharedPassword) {
      storedLikes = JSON.parse(event.newValue || "{}");
  
      // Check if the current movie is a match
      const movie = movies[currentMovieIndex];
      if (storedLikes[movie.id] >= 2) {
        resultDiv.textContent = `Match Found! Watch "${movie.title}"`;
        document.getElementById("movie-card").style.display = "none";
      }
    }
  });
  