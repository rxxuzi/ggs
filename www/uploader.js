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
            const response = await fetch('http://localhost:8080/events', {
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