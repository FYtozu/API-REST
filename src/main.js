const api = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    headers: {
        "Content-Type": "application/json;charset=utf-8"
    },
    params: {
        "api_key": API_KEY,
    }
});

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
        movieContainer.addEventListener("click", () => {
            location.hash = "#movie=" + movie.id
            navigationHistory.push(location.hash)
        });
        const movieImg = document.createElement("img");
        movieImg.classList.add("movie-img");
        movieImg.setAttribute("alt", movie.title);
        movieImg.setAttribute(lazyLoad ? "data-img" : "src", "https://image.tmdb.org/t/p/w300" + movie.poster_path);

        movieImg.addEventListener("error", () => {
            movieImg.setAttribute("src", "https://cdn-icons-png.flaticon.com/512/5220/5220262.png")
        })

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
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
    const movies = data.results

    displayMovies(genericSection, movies, { lazyLoad: true, clean: true })
}

async function getMoviesBySearch(query) {
    const { data } = await api("/search/movie", {
        params: {
            query,
        }
    })
    const movies = data.results

    displayMovies(genericSection, movies, { lazyLoad: true, clean: true })
}

async function getTrendingMovies() {
    const { data } = await api("/trending/movie/day")
    const movies = data.results

    displayMovies(genericSection, movies, { lazyLoad: true, clean: true })

    const btnLoadMore = document.createElement("button");
    btnLoadMore.innerText = "Cargar Más";
    btnLoadMore.addEventListener("click", getPaginatedTrendingMovies);
    genericSection.appendChild(btnLoadMore);
}

let page = 1;

async function getPaginatedTrendingMovies() {
    page++;
    const { data } = await api("/trending/movie/day", {
        params: {
            page,
        },
    });
    const movies = data.results

    genericSection.lastChild.remove();

    displayMovies(genericSection, movies, { lazyLoad: true, clean: false })

    const btnLoadMore = document.createElement("button");
    btnLoadMore.innerText = "Cargar Más";
    btnLoadMore.addEventListener("click", getPaginatedTrendingMovies);
    genericSection.appendChild(btnLoadMore);
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