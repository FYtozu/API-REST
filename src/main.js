const api = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    headers: {
        "Content-Type": "application/json;charset=utf-8"
    },
    params: {
        "api_key": API_KEY,
    }
});

function likedMoviesList() {
    const item = JSON.parse(localStorage.getItem("liked_movies"));
    let movies;

    if (item) {
        movies = item;
    } else {
        movies = {};
    }

    return movies
}

function likeMovie(movie) {
    const likedMovies = likedMoviesList()

    console.log(likedMovies);

    if (likedMovies[movie.id]) {
        delete likedMovies[movie.id];
    } else {
        likedMovies[movie.id] = movie
    }

    localStorage.setItem("liked_movies", JSON.stringify(likedMovies));
    getLikedMovies()
}

const lazyLoaderOptions = {
    root: document.querySelector("body"),
    rootMargin: "0px",
    threshold: 1.0,
};

const lazyLoaderCallback = (entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute("data-img")
            entry.target.setAttribute("src", url)
        }
    })
};

const lazyLoader = new IntersectionObserver(lazyLoaderCallback)

function displayMovies(
    container,
    movies,
    {
        lazyLoad = false,
        clean = true
    } = {},
) {
    if (clean) {
        container.innerHTML = ""
    }

    movies.forEach(movie => {
        const movieContainer = document.createElement("div");
        movieContainer.classList.add("movie-container");
        const movieImg = document.createElement("img");
        movieImg.classList.add("movie-img");
        movieImg.setAttribute("alt", movie.title);
        movieImg.setAttribute(lazyLoad ? "data-img" : "src", "https://image.tmdb.org/t/p/w300" + movie.poster_path);
        movieImg.addEventListener("click", () => {
            location.hash = "#movie=" + movie.id
            navigationHistory.push(location.hash)
        });
        movieImg.addEventListener("error", () => {
            movieImg.setAttribute("src", "https://cdn-icons-png.flaticon.com/512/5220/5220262.png")
        });

        const movieBtn = document.createElement("button");
        movieBtn.classList.add("movie-btn");
        if (likedMoviesList()[movie.id]) {
            movieBtn.classList.add("movie-btn--liked")
        } else {
            movieBtn.classList.remove("movie-btn--liked")
        }
        movieBtn.addEventListener("click", () => {
            movieBtn.classList.toggle("movie-btn--liked")
            likeMovie(movie);
            getTrendingMoviesPreview();
        })

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
    })
}

function displayCategories(container, categories) {
    container.innerHTML = ""

    categories.forEach(category => {
        const categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");
        const categoryTitle = document.createElement("h3");
        categoryTitle.classList.add("category-title");
        categoryTitle.setAttribute("id", "id" + category.id);
        categoryTitle.addEventListener("click", () => {
            location.hash = `#category=${category.id}-${category.name}`
        })
        const categoryTitleText = document.createTextNode(category.name);
        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    })
}

async function getTrendingMoviesPreview() {
    const { data } = await api("/trending/movie/day")
    const movies = data.results

    maxPages = data.total_pages;

    displayMovies(trendingMoviesPreviewList, movies, { lazyLoad: true, clean: true })
}

async function getCategoriesPreview() {
    const { data } = await api("/genre/movie/list")
    const categories = data.genres

    displayCategories(categoriesPreviewList, categories)
}

async function getMoviesByCategory(id) {
    const { data } = await api("/discover/movie", {
        params: {
            with_genres: id,
        }
    })
    const movies = data.results;
    maxPages = data.total_pages;
    displayMovies(genericSection, movies, { lazyLoad: true, clean: true })
}

function getPaginatedMoviesByCategory(id) {
    return async function () {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        const scrollIsBottom = (scrollTop + clientHeight) > scrollHeight - 15;

        const pageIsNotMax = page < maxPages

        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const { data } = await api("/discover/movie", {
                params: {
                    with_genres: id,
                    page,
                }
            })
            const movies = data.results
            displayMovies(genericSection, movies, { lazyLoad: true, clean: false })
        }
    }
}

async function getMoviesBySearch(query) {
    const { data } = await api("/search/movie", {
        params: {
            query,
        }
    })
    const movies = data.results
    maxPages = data.total_pages;
    displayMovies(genericSection, movies, { lazyLoad: true, clean: true })
}

function getPaginatedMoviesBySearch(query) {
    return async function () {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        const scrollIsBottom = (scrollTop + clientHeight) > scrollHeight - 15;

        const pageIsNotMax = page < maxPages

        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const { data } = await api("/search/movie", {
                params: {
                    query,
                    page,
                }
            })
            const movies = data.results
            displayMovies(genericSection, movies, { lazyLoad: true, clean: false })
        }
    }
}

async function getTrendingMovies() {
    const { data } = await api("/trending/movie/day")
    const movies = data.results

    maxPages = data.total_pages;

    displayMovies(genericSection, movies, { lazyLoad: true, clean: true });
}

async function getPaginatedTrendingMovies() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) > scrollHeight - 15;

    const pageIsNotMax = page < maxPages

    if (scrollIsBottom && pageIsNotMax) {
        page++;
        const { data } = await api("/trending/movie/day", {
            params: {
                page,
            },
        });
        const movies = data.results
        displayMovies(genericSection, movies, { lazyLoad: true, clean: false })
    }
}

async function getMovieById(id) {
    const { data: movie } = await api("/movie/" + id)

    const movieImgUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
    headerSection.style.background = `
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%),
    url(${movieImgUrl})
    `

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average.toFixed(1);

    displayCategories(movieDetailCategoriesList, movie.genres);
    getRelatedMoviesById(id);
}

async function getRelatedMoviesById(id) {
    const { data } = await api(`/movie/${id}/recommendations`)
    const relatedMovies = data.results

    displayMovies(relatedMoviesContainer, relatedMovies, { lazyLoad: true, clean: true })
}

function getLikedMovies() {
    const likedMovies = likedMoviesList();

    const likedMoviesArray = Object.values(likedMovies)

    displayMovies(likedMoviesListArticle, likedMoviesArray, { lazyLoad: true, clean: true })
}