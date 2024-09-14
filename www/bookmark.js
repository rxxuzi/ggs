document.addEventListener('DOMContentLoaded', () => {
    waitForEventsData().then(() => {
        displayBookmarkedEvents();
        setupSearchFunctionality();
        setupCollapsibles();
    });
});

// ... (既存の関数はそのまま) ...

function setupCollapsibles() {
    const collapsibles = document.querySelectorAll('.collapsible');

    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

// ... (他の既存の関数) ...ß