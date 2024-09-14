let eventsData = [];
let baseUrl = '';

async function loadBaseUrl() {
    try {
        const response = await fetch('address.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        baseUrl = await response.text();
        baseUrl = baseUrl.trim();
        console.log("Base URL loaded:", baseUrl);
    } catch (error) {
        console.error("Base URLの読み込みに失敗しました:", error);
    }
}

async function fetchEvents() {
    if (!baseUrl) {
        await loadBaseUrl();
    }
    try {
        const response = await fetch(`${baseUrl}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        eventsData = await response.json();
        console.log("Get events!\n", eventsData);
        displayEventList();
    } catch (error) {
        console.error("イベントデータの取得に失敗しました:", error);
        const eventList = document.getElementById('event-list');
        if (eventList) {
            eventList.innerHTML = `
                <p>イベントデータの取得に失敗しました。しばらくしてからもう一度お試しください。</p>
            `;
        }
    }
}

function displayEventList() {
    const eventList = document.getElementById('event-list');
    if (!eventList) {
        console.error("event-list element not found");
        return;
    }
    const bookmarks = loadBookmarks();
    if (!eventsData || eventsData.length === 0) {
        eventList.innerHTML = '<p>イベントがありません。</p>';
        return;
    }
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

    addEventListeners(eventList);
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
        });
    });
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
            <p><img src="./img/fas/calender.svg" alt="Calendar"> 締切: ${event.deadline}</p>
            <p><img src="./img/fas/user.svg" alt="User"> 応募条件: ${event.conditions}</p>
            <p>
                <img src="${getPlatformIconPath(event.platform)}" alt="${event.platform} icon" class="event-icon">
                プラットフォーム: ${event.platform}
            </p>
            <button class="button join-button"><img src="./img/fas/user.svg" alt="User"> Join</button>
            <div class="dropdown">
                <button class="button share-button"><img src="./img/fas/share.svg" alt="Share"> Share</button>
                <div class="dropdown-content">
                    <button class="button copy-link-button">Copy link</button>
                    <button class="button share-x-button">Share on X</button>
                </div>
            </div>
            <button class="button bookmark-button" data-id="${event.id}">
                <img src="${bookmarks[event.id] ? './img/fas/bm-ed.svg' : './img/fas/bm.svg'}" alt="Bookmark">
                ${bookmarks[event.id] ? 'ブックマーク解除' : 'ブックマーク'}
            </button>
        </div>
    `;
    modal.style.display = "block";

    // 閉じるボタン
    modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = "none";
    });

    // [Join]ボタンが押されたときにcommunityLinkに遷移
    modal.querySelector('.join-button').addEventListener('click', () => {
        window.open(event.communityLink, '_blank'); // 新しいタブで開く
    });

    // [Copy link] ボタンでリンクをクリップボードにコピー
    modal.querySelector('.copy-link-button').addEventListener('click', () => {
        navigator.clipboard.writeText(event.communityLink)
            .then(() => alert("リンクがクリップボードにコピーされました！"))
            .catch(err => console.error('クリップボードへのコピーに失敗しました:', err));
    });

    // [Share on X] ボタンでXにシェア
    modal.querySelector('.share-x-button').addEventListener('click', () => {
        const shareText = `私とこのイベントに参加しませんか？\nイベント: ${event.eventName}\n締切: ${event.deadline}\nリンク: ${event.communityLink}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
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