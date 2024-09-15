document.addEventListener('DOMContentLoaded', () => {
    waitForEventsData().then(() => {
        displayBookmarkedEvents();
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