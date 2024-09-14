let eventsData = [];

async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:8080/events');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        eventsData = await response.json();
        console.log("Get events!\n");
        displayEventList();
    } catch (error) {
        console.error("イベントデータの取得に失敗しました:", error);
        document.getElementById('event-list').innerHTML = `
            <p>イベントデータの取得に失敗しました。しばらくしてからもう一度お試しください。</p>
        `;
    }
}


const platformIcons = {
    "GitHub": "./img/svgs/github.svg",
    "Discord": "./img/svgs/discord.svg",
    "Google Meet": "./img/svgs/google.svg",
    "Telegram": "./img/svgs/telegram.svg",
    "Microsoft Teams": "./img/svgs/microsoft-teams.svg",
    "Slack": "./img/svgs/slack.svg",
    "Skype": "./img/svgs/skype.svg",
    "Meta": "./img/svgs/meta.svg",
    "Facebook": "./img/svgs/facebook.svg",
    "Apple": "./img/svgs/apple.svg",
    "Line": "./img/svgs/line.svg",
    "default" : "./img/svgs/globe.svg"
};

function getPlatformIconPath(platform) {
    return platformIcons[platform] || platformIcons.default;
}

function showEventDetail(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    const bookmarks = loadBookmarks();
    const modal = document.getElementById('event-detail');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${event.eventName}</h2>
            <p>${event.description}</p>
            <p><img src="./img/fas/calender.svg" alt="Calendar"> 締切: ${event.deadline}</p>
            <p><img src="./img/fas/user.svg" alt="User"> 応募条件: ${event.conditions}</p>
            <p>
                <img src="${getPlatformIconPath(event.platform)}" alt="${event.platform} icon" class="event-icon">
                プラットフォーム: ${event.platform}
            </p>
            <p><img src="./img/fas/person.svg" alt="author"> 主催者: ${event.author}</p>
            <button class="button join-button"><img src="./img/fas/user.svg" alt="User"> Join</button>
            <button class="button share-button"><img src="./img/fas/share.svg" alt="Share"> Share</button>
            <button class="button bookmark-button" data-id="${event.id}">
                <img src="${bookmarks[event.id] ? './img/fas/bm-ed.svg' : './img/fas/bm.svg'}" alt="Bookmark">
                ${bookmarks[event.id] ? 'ブックマーク解除' : 'ブックマーク'}
            </button>
        </div>
    `;
    modal.style.display = "block";

    modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = "none";
    });

    // [join]ボタンが押されたときにcommunityLinkに遷移
    modal.querySelector('.join-button').addEventListener('click', () => {
        window.open(event.communityLink, '_blank'); // 新しいタブで開く
    });

    modal.querySelector('.bookmark-button').addEventListener('click', (e) => {
        toggleBookmark(e.target.dataset.id);
        showEventDetail(eventId); // モーダルを更新
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}


function displayEventList() {
    const eventList = document.getElementById('event-list');
    const bookmarks = loadBookmarks();
    eventList.innerHTML = eventsData.map(event => `
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
    `).join('');

    eventList.querySelectorAll('.event-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('bookmark-icon')) {
                showEventDetail(item.dataset.id);
            }
        });
    });

    eventList.querySelectorAll('.bookmark-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(icon.dataset.id);
        });
    });
}

// ブックマークの状態を保存する関数
function saveBookmarks(bookmarks) {
    localStorage.setItem('eventBookmarks', JSON.stringify(bookmarks));
}

// ブックマークの状態を読み込む関数
function loadBookmarks() {
    const savedBookmarks = localStorage.getItem('eventBookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : {};
}

// ブックマークの切り替え
function toggleBookmark(eventId) {
    let bookmarks = loadBookmarks();
    bookmarks[eventId] = !bookmarks[eventId];
    saveBookmarks(bookmarks);
    displayEventList(); // リストを更新
}

document.addEventListener('DOMContentLoaded', displayEventList);
document.addEventListener('DOMContentLoaded', fetchEvents);