let baseUrl = '';

async function loadBaseUrl() {
    try {
        const response = await fetch('address.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        baseUrl = await response.text();
        baseUrl = baseUrl.trim(); // 余分な空白を削除
        console.log("Base URL loaded:", baseUrl);
    } catch (error) {
        console.error("Base URLの読み込みに失敗しました:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventData = {
            id: uuid.v4(),
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
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });

            if (response.ok) {
                const result = await response.json();
                resultDiv.textContent = `イベントが正常に追加されました。ID: ${result.id}`;
                form.reset();
            } else {
                resultDiv.textContent = 'エラー: イベントの追加に失敗しました。';
            }
        } catch (error) {
            resultDiv.textContent = `エラー: ${error.message}`;
        }
    });
});