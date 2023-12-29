let currentMovieStack = [];

const homeButton = document.querySelector("#home-button");
const searchBox = document.querySelector("#search-box");
const goToFavouriteButton = document.querySelector("#goto-favourites-button");
const movieCardContainer = document.querySelector("#movie-card-container");

function showAlert(message) {
  alert(message);
}

function renderList(actionForButton) {
  movieCardContainer.innerHTML = "";

  for (let i = 0; i < currentMovieStack.length; i++) {
    let movieCardCol = document.createElement("div");
    movieCardCol.classList.add("col-lg-3", "col-md-4", "col-sm-6", "mb-4");

    let movieCard = document.createElement("div");
    movieCard.classList.add("card", "h-100");

    movieCard.innerHTML = `
      <img src="${
        "https://image.tmdb.org/t/p/w500" + currentMovieStack[i].poster_path
      }" alt="${currentMovieStack[i].title}" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">${currentMovieStack[i].title}</h5>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <p class="card-text m-0">Rating: ${
            currentMovieStack[i].vote_average
          }</p>
          <button id="${
            currentMovieStack[i].id
          }" onclick="getMovieInDetail(this)" class="btn btn-primary btn-sm">Details</button>
        </div>
        <button onclick="${actionForButton}(this)" class="add-to-favourite-button btn btn-outline-secondary btn-block" data-id="${
      currentMovieStack[i].id
    }">
          Add to ${actionForButton}
        </button>
      </div>
    `;
    movieCardCol.appendChild(movieCard);
    movieCardContainer.appendChild(movieCardCol);
  }
}

function printError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = message;
  errorDiv.style.height = "100%";
  errorDiv.style.fontSize = "5rem";
  errorDiv.style.margin = "auto";
  movieCardContainer.innerHTML = "";
  movieCardContainer.append(errorDiv);
}

function getTrendingMovies() {
  const tmdb = fetch(
    "https://api.themoviedb.org/3/trending/movie/day?api_key=cb213741fa9662c69add38c5a59c0110"
  )
    .then((response) => response.json())
    .then((data) => {
      currentMovieStack = data.results;
      renderList("favourite");
    })
    .catch((err) => printError(err));
}
getTrendingMovies();

homeButton.addEventListener("click", getTrendingMovies);

searchBox.addEventListener("keyup", () => {
  let searchString = searchBox.value;

  if (searchString.length > 0) {
    let searchStringURI = encodeURI(searchString);
    const searchResult = fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=cb213741fa9662c69add38c5a59c0110&language=en-US&page=1&include_adult=false&query=${searchStringURI}`
    )
      .then((response) => response.json())
      .then((data) => {
        currentMovieStack = data.results;
        renderList("favourite");
      })
      .catch((err) => printError(err));
  }
});

function favourite(element) {
  let id = element.dataset.id;
  let favouriteMovies = JSON.parse(localStorage.getItem("favouriteMovies"));

  if (favouriteMovies === null) {
    favouriteMovies = [];
  }

  // Check if the movie already exists in favorites using its ID
  const isAlreadyAdded = favouriteMovies.some((movie) => movie.id == id);

  if (!isAlreadyAdded) {
    for (let i = 0; i < currentMovieStack.length; i++) {
      if (currentMovieStack[i].id == id) {
        favouriteMovies.unshift(currentMovieStack[i]);
        localStorage.setItem(
          "favouriteMovies",
          JSON.stringify(favouriteMovies)
        );
        showAlert(currentMovieStack[i].title + " added to favourites");
        return;
      }
    }
  } else {
    showAlert("Movie already exists in favourites");
  }
}

goToFavouriteButton.addEventListener("click", () => {
  let favouriteMovies = JSON.parse(localStorage.getItem("favouriteMovies"));
  if (favouriteMovies == null || favouriteMovies.length < 1) {
    showAlert("You have not added any movie to favourites");
    return;
  }

  currentMovieStack = favouriteMovies;
  renderList("remove");
});

function remove(element) {
  let id = element.dataset.id;
  let favouriteMovies = JSON.parse(localStorage.getItem("favouriteMovies"));
  let newFavouriteMovies = [];
  for (let i = 0; i < favouriteMovies.length; i++) {
    if (favouriteMovies[i].id == id) {
      continue;
    }
    newFavouriteMovies.push(favouriteMovies[i]);
  }

  localStorage.setItem("favouriteMovies", JSON.stringify(newFavouriteMovies));
  currentMovieStack = newFavouriteMovies;
  renderList("remove");
}

function renderMovieInDetail(movie) {
  movieCardContainer.innerHTML = "";

  let movieDetailCard = document.createElement("div");
  movieDetailCard.classList.add("detail-movie-card");

  movieDetailCard.innerHTML = `
		<img src="${
      "https://image.tmdb.org/t/p/w500" + movie.backdrop_path
    }" class="detail-movie-background">
		<img src="${
      "https://image.tmdb.org/t/p/w500" + movie.poster_path
    }" class="detail-movie-poster">
		<div class="detail-movie-title">
			<span>${movie.title}</span>
			<div class="detail-movie-rating">
				<img src="./res/rating-icon.png">
				<span>${movie.vote_average}</span>
			</div>
		</div>
		<div class="detail-movie-plot">
			<p>${movie.overview}</p>
			<p>Release date : ${movie.release_date}</p>
			<p>runtime : ${movie.runtime} minutes</p>
			<p>tagline : ${movie.tagline}</p>
		</div>
	`;

  movieCardContainer.append(movieDetailCard);
}

function getMovieInDetail(element) {
  fetch(
    `https://api.themoviedb.org/3/movie/${element.getAttribute(
      "id"
    )}?api_key=cb213741fa9662c69add38c5a59c0110&language=en-US`
  )
    .then((response) => response.json())
    .then((data) => renderMovieInDetail(data))
    .catch((err) => printError(err));
}
