document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('query').value;
    if (query) {
        window.history.pushState({}, '', `?query=${encodeURIComponent(query)}`);
        search(query);
    }
});

document.getElementById('prev').addEventListener('click', function() {
    if (startIndex > 1) {
        startIndex -= 10;
        const query = new URLSearchParams(window.location.search).get('query');
        if (query) search(query);
    }
});

document.getElementById('next').addEventListener('click', function() {
    startIndex += 10;
    const query = new URLSearchParams(window.location.search).get('query');
    if (query) search(query);
});

let startIndex = 1;

function search(query) {
    const apiKey = '';
    const searchEngineId = '';
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&start=${startIndex}`;

    document.title = `Barclay Search - "${query}"`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            handleSearchResults(data, query);
        })
        .catch(error => {
            console.error('Error:', error);
            fallbackSearch(query);
        });
}

function handleSearchResults(data, query) {
    const resultsContainer = document.getElementById('results');
    const totalResultsElement = document.getElementById('total-results');
    const paginationInfoElement = document.getElementById('pagination-info');
    resultsContainer.innerHTML = '';
    if (data.items) {
        totalResultsElement.textContent = `Showing ${data.items.length} of ${parseInt(data.searchInformation.totalResults).toLocaleString()} results`;
        data.items.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.innerHTML = `
                <p class="result-url">${item.link}</p>
                <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                <p>${item.snippet}</p>
            `;
            resultsContainer.appendChild(resultItem);
        });

        const currentPage = Math.ceil(startIndex / 10);
        const totalPages = Math.ceil(data.searchInformation.totalResults / 10);
        paginationInfoElement.textContent = `Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}`;

        document.getElementById('prev').disabled = startIndex === 1;
        document.getElementById('next').disabled = startIndex + data.items.length > data.searchInformation.totalResults;
        window.scrollTo(0, 0)
    } else {
        resultsContainer.innerHTML = '<p>No results found</p>';
        totalResultsElement.textContent = '';
        paginationInfoElement.textContent = '';
        document.getElementById('prev').disabled = true;
        document.getElementById('next').disabled = true;
    }
}

function fallbackSearch(query) {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleSearchUrl, '_blank');
}

window.onload = function() {
    const query = new URLSearchParams(window.location.search).get('query');
    if (query) {
        document.getElementById('query').value = query;
        search(query);
    }
};