document.addEventListener('DOMContentLoaded', () => {
    waitForEventsData().then(() => {
        displayBookmarkedEvents();
        setupSearchFunctionality();
    });
});

function waitForEventsData() {
    return new Promise((resolve) => {
        const checkEventsData = () => {
            if (eventsData && eventsData.length > 0) {
                resolve();
            } else {
                setTimeout(checkEventsData, 100);
            }
        };
        checkEventsData();
    });
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    } else {
        console.error('Search input or button not found');
    }
}

function performSearch(query) {
    const searchResults = eventsData.filter(event => 
        event.eventName.toLowerCase().includes(query.toLowerCase()) ||
        event.shortDescription.toLowerCase().includes(query.toLowerCase())
    );
    
    const searchResultsContainer = document.getElementById('search-results');
    
    if (searchResultsContainer) {
        if (searchResults.length === 0) {
            searchResultsContainer.innerHTML = '<p>検索結果が見つかりませんでした。</p>';
        } else {
            searchResultsContainer.innerHTML = searchResults.map(createEventHTML).join('');
            addEventListeners(searchResultsContainer);
        }
    } else {
        console.error('Search results container not found');
    }
}

function displayBookmarkedEvents() {
    const bookmarks = loadBookmarks();
    const bookmarkedEventsContainer = document.getElementById('bookmarked-events');
    
    if (!bookmarkedEventsContainer) {
        console.error('Bookmarked events container not found');
        return;
    }
    
    const bookmarkedEvents = eventsData.filter(event => bookmarks[event.id]);
    
    if (bookmarkedEvents.length === 0) {
        bookmarkedEventsContainer.innerHTML = '<p>ブックマークされたイベントはありません。</p>';
    } else {
        bookmarkedEventsContainer.innerHTML = bookmarkedEvents.map(createEventHTML).join('');
        addEventListeners(bookmarkedEventsContainer);
    }
}

function createEventHTML(event) {
    const bookmarks = loadBookmarks();
    return `
        <div class="event-item" data-id="${event.id}">
            <div class="event-icon-container">
                <img src="${getPlatformIconPath(event.platform)}" alt="${event.platform} icon" class="event-icon">
            </div>
            <div class="event-info">
                <div class="event-name">${event.eventName}</div>
                <div class="event-description">${event.shortDescription}</div>
                <div class="event-author">
                    <span>主催者: ${event.author}</span>
                </div>
            </div>
            <img src="${bookmarks[event.id] ? './img/fas/bm-ed.svg' : './img/fas/bm.svg'}" 
                 alt="Bookmark" 
                 class="bookmark-icon"
                 data-id="${event.id}">
        </div>
    `;
}

// addEventListeners 関数は app.js から移動
function addEventListeners(container) {
    container.querySelectorAll('.event-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('bookmark-icon')) {
                showEventDetail(item.dataset.id);
            }
        });
    });

    container.querySelectorAll('.bookmark-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(icon.dataset.id);
            displayBookmarkedEvents(); // ブックマークリストを更新
        });
    });
}