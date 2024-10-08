let eventsData = [];
let baseUrl = '';
let currentUser = '';
const userNames = ['Jane'];
let joinStatusMap = {};

document.addEventListener('DOMContentLoaded', () => {
    currentUser = userNames[Math.floor(Math.random() * userNames.length)];
    console.log('Current user:', currentUser);
    const h1 = document.getElementById('hello');
    h1.innerHTML = `<h1>Hello! ${currentUser}</h1>`
    loadEvents();
});


document.addEventListener('DOMContentLoaded', () => {
    currentUser = userNames[Math.floor(Math.random() * userNames.length)];
    console.log('Current user:', currentUser);
    const h1 = document.getElementById('hello');
    h1.innerHTML = `<h1>Hello! ${currentUser}</h1>`
    loadEvents();
});

function loadEvents() {
    // ウェブストレージからイベントデータを取得
    const storedEvents = JSON.parse(sessionStorage.getItem('eventsData')) || [];
    eventsData = storedEvents;
    
    // JSONファイルからもイベントデータを取得
    fetchEvents();
    
    joinStatusData = JSON.parse(sessionStorage.getItem('joinStatusData')) || [];
    displayEventList();
}

async function fetchEvents() {
    try {
        const response = await fetch('json/events.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonEvents = await response.json();
        
        // JSONのイベントデータとウェブストレージのイベントデータをマージ
        eventsData = [...eventsData, ...jsonEvents.filter(jsonEvent => 
            !eventsData.some(storedEvent => storedEvent.id === jsonEvent.id)
        )];
        
        // マージしたデータをウェブストレージに保存
        sessionStorage.setItem('eventsData', JSON.stringify(eventsData));
        
        await fetchJoinStatus();
        displayEventList();
    } catch (error) {
        console.error("イベントデータの取得に失敗しました:", error);
        const eventList = document.getElementById('event-list');
        if (eventList) {
            eventList.innerHTML = `
                <p>イベントデータの取得に失敗しました。</p>
                <p>エラー詳細: ${error.message}</p>
                <p>しばらくしてからもう一度お試しください。問題が続く場合は管理者にお問い合わせください。</p>
            `;
        }
    }
}

function updateEventList() {
    loadEvents();
}

function calculateMatchingCounts() {
    const userMatchCounts = {};
    
    // 全てのイベントをループ
    Object.values(joinStatusMap).forEach(users => {
        // 現在のユーザーがこのイベントに参加している場合
        if (users.includes(currentUser)) {
            users.forEach(user => {
                if (user !== currentUser) {
                    if (!userMatchCounts[user]) {
                        userMatchCounts[user] = 0;
                    }
                    userMatchCounts[user]++;
                }
            });
        }
    });
    
    // 2回以上マッチしたユーザーのみをフィルタリング
    return Object.entries(userMatchCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1]); // マッチ回数で降順ソート
}

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

async function fetchJoinStatus() {
    try {
        const response = await fetch('json/join_status.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        joinStatusData = await response.json();
        console.log("Join status fetched:", joinStatusData);
    } catch (error) {
        console.error("Join状態の取得に失敗しました:", error);
        joinStatusData = []; // エラーの場合は空の配列を設定
    }
}

function getJoinedUsers(eventId) {
    return joinStatusData
        .filter(entry => entry.eventId === eventId && entry.joined)
        .map(entry => entry.user);
}

function isUserJoined(eventId, user) {
    return joinStatusData.some(entry => 
        entry.eventId === eventId && entry.user === user && entry.joined
    );
}

function calculateMatchingCounts() {
    const userMatchCounts = {};
    
    joinStatusData.forEach(entry => {
        if (entry.user === currentUser && entry.joined) {
            const eventUsers = getJoinedUsers(entry.eventId);
            eventUsers.forEach(user => {
                if (user !== currentUser) {
                    userMatchCounts[user] = (userMatchCounts[user] || 0) + 1;
                }
            });
        }
    });
    
    return Object.entries(userMatchCounts)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1]);
}

async function toggleJoin(eventId) {
    const isJoined = isUserJoined(eventId, currentUser);
    const newJoinStatus = !isJoined;

    // 既存のエントリーを探す
    let existingEntry = joinStatusData.find(entry => 
        entry.eventId === eventId && entry.user === currentUser
    );

    if (existingEntry) {
        existingEntry.joined = newJoinStatus;
    } else {
        joinStatusData.push({
            eventId: eventId,
            user: currentUser,
            joined: newJoinStatus
        });
    }

    // ここで通常はサーバーにデータを送信しますが、
    // この例ではローカルストレージに保存します
    localStorage.setItem('joinStatusData', JSON.stringify(joinStatusData));

    showEventDetail(eventId); // モーダルを更新
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
    "Google": "./img/svgs/google.svg",
    "Telegram": "./img/svgs/telegram.svg",
    "Microsoft Teams": "./img/svgs/microsoft-teams.svg",
    "Teams": "./img/svgs/microsoft-teams.svg",
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
    const joinedUsers = getJoinedUsers(eventId);
    const isJoined = isUserJoined(eventId, currentUser);
    const matchingCounts = isJoined ? calculateMatchingCounts() : [];
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
            <p><img src="./img/fas/link.svg" alt="Link"> リンク: <a href="${event.communityLink}" target="_blank">${event.communityLink}</a></p>
            <button class="button join-button" data-id="${event.id}">
                <img src="./img/fas/user.svg" alt="User"> ${isJoined ? 'Leave' : 'Join'}
            </button>
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
            <div class="joined-users">
                <h3>参加者:</h3>
                <ul>
                    ${joinedUsers.map(user => `<li>${user}${user === currentUser ? ' (あなた)' : ''}</li>`).join('')}
                </ul>
            </div>
            ${isJoined ? `
            <div class="matching-users">
                <h3>よくマッチするユーザー:</h3>
                <ul>
                    ${matchingCounts.map(([user, count]) => `<li>${user} (${count})</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;

    modal.style.display = "block";

    // 閉じるボタン
    modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = "none";
    });
    
    modal.querySelector('.join-button').addEventListener('click', (e) => {
        toggleJoin(e.target.dataset.id);
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

// ブックマークの状態を保存する関数
function saveBookmarks(bookmarks) {
    sessionStorage.setItem('eventBookmarks', JSON.stringify(bookmarks));
}

// ブックマークの状態を読み込む関数
function loadBookmarks() {
    const savedBookmarks = sessionStorage.getItem('eventBookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : {};
}

// ブックマークの切り替え
function toggleBookmark(eventId) {
    let bookmarks = loadBookmarks();
    bookmarks[eventId] = !bookmarks[eventId];
    saveBookmarks(bookmarks);
    
    // イベントリストとブックマークの両方を更新
    displayEventList(); 
    displayBookmarkedEvents(); 
}


document.addEventListener('DOMContentLoaded', displayEventList);
document.addEventListener('DOMContentLoaded', fetchEvents);