const navigationHistory = []

searchFormBtn.addEventListener("click", () => {
    location.hash = "#search=" + searchFormInput.value

    navigationHistory.push(location.hash)
})

trendingBtn.addEventListener("click", () => {
    location.hash = "#trends="

    navigationHistory.push(location.hash)
})

arrowBtn.addEventListener("click", () => {
    if (navigationHistory.length === 0) {
        location.hash = "#home"
    } else {
        location.hash = navigationHistory.pop()
    }
})

window.addEventListener("DOMContentLoaded", navigator, false);
window.addEventListener("hashchange", navigator, false);

function navigator() {

    if (location.hash.startsWith("#trends")) {
        trendsPage()
    } else if (location.hash.startsWith("#search")) {
        searchPage()
    } else if (location.hash.startsWith("#movie")) {
        movieDetailsPage()
    } else if (location.hash.startsWith("#category")) {
        CategoriesPage()
    } else {
        homePage()
    }
}

function homePage() {
    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.add("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.remove("inactive");
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.remove("inactive");
    trendingPreviewSection.classList.remove("inactive");
    categoriesPreviewSection.classList.remove("inactive");
    genericSection.classList.add("inactive");
    movieDetailSection.classList.add("inactive");
    getTrendingMoviesPreview();
    getCategoriesPreview();
}

function CategoriesPage() {
    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.remove("inactive");
    searchForm.classList.add("inactive");
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");

    headerCategoryTitle.innerHTML = decodeURI(location.hash.substring(location.hash.search("-") + 1))
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    getMoviesByCategory(location.hash.substring(location.hash.search("=") + 1, location.hash.search("-")))
}

function movieDetailsPage() {
    headerSection.classList.add("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.add("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.add("inactive");
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.add("inactive");
    movieDetailSection.classList.remove("inactive");

    let [_, movieId] = location.hash.split("=");

    getMovieById(movieId);
}

function searchPage() {
    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.remove("inactive");
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");

    let [_, query] = location.hash.split("=")

    getMoviesBySearch(decodeURI(query))
}

function trendsPage() {
    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive");
    headerCategoryTitle.classList.remove("inactive");
    searchForm.classList.add("inactive");
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");

    headerCategoryTitle.innerHTML = "Tendencias"

    getTrendingMovies()
}