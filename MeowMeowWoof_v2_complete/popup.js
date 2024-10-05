
const bookmarksContainer = document.getElementById('bookmarksContainer');
const saveTimestampButton = document.getElementById('saveTimestamp');
const commentInput = document.getElementById('commentInput'); // New comment input

// Function to get the current timestamp from the YouTube video
function getVideoTimestamp() {
    return document.querySelector('video') ? document.querySelector('video').currentTime : 0;
}

// Function to save current timestamp with comment
saveTimestampButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        const url = tabs[0].url;
        const videoId = new URL(url).searchParams.get('v');
        const comment = commentInput.value;  // Capture the comment input

        if (videoId && url.includes('youtube.com/watch')) {
            // Send a message to the content script to get the current timestamp
            chrome.scripting.executeScript({
                target: { tabId },
                function: getVideoTimestamp
            }, (results) => {
                const timestamp = Math.floor(results[0].result);
                const bookmark = { videoId, timestamp, comment };
                chrome.storage.sync.get('bookmarks', (data) => {
                    const bookmarks = data.bookmarks || [];
                    bookmarks.push(bookmark);
                    chrome.storage.sync.set({ bookmarks }, renderBookmarks);
                    commentInput.value = '';  // Clear the comment input
                });
            });
        }
    });
});

// Function to delete a bookmark
function deleteBookmark(index) {
    chrome.storage.sync.get('bookmarks', (data) => {
        const bookmarks = data.bookmarks || [];
        bookmarks.splice(index, 1);  // Remove the bookmark at the specified index
        chrome.storage.sync.set({ bookmarks }, renderBookmarks);
    });
}

// Function to render bookmarks with comments and delete functionality
function renderBookmarks() {
    chrome.storage.sync.get('bookmarks', (data) => {
        const bookmarks = data.bookmarks || [];
        bookmarksContainer.innerHTML = '';

        bookmarks.forEach((bookmark, index) => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'bookmark';

            // Create a hyperlink for the comment
            const commentElement = document.createElement('a');
            commentElement.textContent = bookmark.comment || `Bookmark ${index + 1}`;
            commentElement.href = `https://www.youtube.com/watch?v=${bookmark.videoId}&t=${bookmark.timestamp}s`;
            commentElement.target = '_blank';  // Open in a new tab
            commentElement.className = 'comment-link';

            // Create a delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', () => deleteBookmark(index));

            // Append comment and delete button to the bookmark element
            bookmarkElement.appendChild(commentElement);
            bookmarkElement.appendChild(deleteButton);

            // Append the bookmark element to the container
            bookmarksContainer.appendChild(bookmarkElement);
        });
    });
}

// Load bookmarks on popup open
document.addEventListener('DOMContentLoaded', renderBookmarks);
