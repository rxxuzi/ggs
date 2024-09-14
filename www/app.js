// app.js
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const eventsData = [
    {
        id: uuidv4(),
        eventName: "Open Source Friday with GitHub CLI!",
        shortDescription: "GitHub CLIを使ったオープンソース開発イベント",
        description: "GitHub CLIを使用してターミナルから直接GitHubを操作する方法を学びます。Andy、William、その他のエキスパートと一緒に、オープンソース開発の新しい可能性を探求しましょう。",
        platform: "GitHub",
        deadline: "2024-09-13",
        conditions: "GitHubアカウントを持っていること",
        communityLink: "https://github.com/cli/cli"
    },
    {
        id: uuidv4(),
        eventName: "Oracle Multicloud Partnerships Webinar",
        shortDescription: "Oracleのマルチクラウドパートナーシップについて学ぶ",
        description: "AWSやGoogleとのパートナーシップにより、Oracleがクラウドの常識を変える方法をご紹介します。グローバル展開を加速させる新しいサービスについても解説します。",
        platform: "Webex",
        deadline: "2024-09-20",
        conditions: "ITプロフェッショナル、クラウドエンジニア",
        communityLink: "https://www.oracle.com/cloud/"
    },
    {
        id: uuidv4(),
        eventName: "Telegram UX/UI Design Challenge",
        shortDescription: "UX/UIデザインのコンペティション",
        description: "Telegramでのユーザーエクスペリエンス向上を目指したデザインコンペです。クリエイティブなソリューションを考案し、世界中の参加者と競い合いましょう。",
        platform: "Telegram",
        deadline: "2024-09-25",
        conditions: "デザインに興味がある人、Telegramアカウントが必要",
        communityLink: "https://t.me/telegram_design_challenge"
    },
    {
        id: uuidv4(),
        eventName: "Facebook Business Growth Strategies",
        shortDescription: "Facebookを使ったビジネス拡大のためのウェビナー",
        description: "Facebookの専門家とともに、ビジネスの成長戦略について学びます。広告、ページ運営、ファン層拡大のノウハウを学べるセミナーです。",
        platform: "Facebook",
        deadline: "2024-10-01",
        conditions: "中小企業経営者、マーケティング担当者",
        communityLink: "https://www.facebook.com/business/webinars"
    },
    {
        id: uuidv4(),
        eventName: "Slack Community Wellness Retreat",
        shortDescription: "Slackコミュニティによるメンタルヘルスイベント",
        description: "メンタルヘルスやウェルネスをテーマにした、リラックスと自己改善を促すイベントです。業界の専門家によるセッションやリソースを活用し、ワークライフバランスの改善を目指しましょう。",
        platform: "Slack",
        deadline: "2024-09-30",
        conditions: "Slackアカウントが必要、ウェルネスに関心がある方",
        communityLink: "https://slack.com/community-wellness-retreat"
    },
    {
        id: uuidv4(),
        eventName: "Zoom Virtual Cooking Class",
        shortDescription: "オンラインでの料理教室",
        description: "プロのシェフと一緒にZoomで料理を学びましょう。初心者から中級者向けのクラスで、楽しく料理スキルを向上させることができます。",
        platform: "Zoom",
        deadline: "2024-09-22",
        conditions: "Zoomアカウント、料理道具を用意",
        communityLink: "https://zoom.us/virtual-cooking-class"
    }
];

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