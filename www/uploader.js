document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    const resultDiv = document.getElementById('result');

    // 既存のイベントデータをロード
    let eventsData = JSON.parse(localStorage.getItem('eventsData')) || [];

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventData = {
            id: generateUUID(),
            eventName: document.getElementById('eventName').value,
            shortDescription: document.getElementById('shortDescription').value,
            description: document.getElementById('description').value,
            platform: document.getElementById('platform').value,
            deadline: document.getElementById('deadline').value,
            conditions: document.getElementById('conditions').value,
            communityLink: document.getElementById('communityLink').value,
            author: document.getElementById('author').value
        };

        try {
            // 新しいイベントを追加
            eventsData.push(eventData);
            
            // ローカルストレージに保存
            localStorage.setItem('eventsData', JSON.stringify(eventsData));

            resultDiv.textContent = `イベントが正常に追加されました。ID: ${eventData.id}`;
            form.reset();

            // 開発用：コンソールに現在のイベントデータを表示
            console.log('Current events data:', eventsData);
        } catch (error) {
            resultDiv.textContent = `エラー: ${error.message}`;
        }
    });
});

// UUIDを生成する関数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}