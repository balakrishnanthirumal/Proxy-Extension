const bookmarksContainer = document.getElementById('bookmarksContainer');
const saveTimestampButton = document.getElementById('saveTimestamp');
const commentInput = document.getElementById('commentInput');
const filterInput = document.getElementById('filterInput'); // Get the filter input
const filterButton = document.getElementById('filterButton'); // Get the filter button
const titleElement = document.getElementById('dynamicTitle'); // Get title element
const popupContainer = document.querySelector('.popup-container'); // Get popup container

// Function to detect the current platform (YouTube, Netflix, Prime Video, Disney+ Hotstar)
function detectPlatform(url) {
    if (url.includes('youtube.com/watch')) {
        return 'YouTube';
    } else if (url.includes('netflix.com/watch')) {
        return 'Netflix';
    } else if (url.includes('primevideo.com/detail')) {
        return 'Prime Video';
    } else if (url.includes('hotstar.com/')) {
        return 'Disney+ Hotstar';
    } else if (url.includes('instagram.com/')) {
        return 'Instagram'; // Example for Instagram
    } else {
        return null;
    }
}

// Function to set the dialog title and background color based on the current platform
function setDialogTitle() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const platform = detectPlatform(url);
        if (platform) {
            titleElement.textContent = `${platform} Bookmarks`; // Set the title
            popupContainer.setAttribute('data-platform', platform); // Set the platform data attribute
        } else {
            titleElement.textContent = 'Bookmarks'; // Default title
            popupContainer.removeAttribute('data-platform'); // Remove the attribute
            popupContainer.style.backgroundColor = '#ffffff'; // Default white background
            titleElement.style.color = '#000000'; // Default black title color
        }
    });
}

// Function to get the current timestamp from the video
function getVideoTimestamp() {
    return document.querySelector('video') ? document.querySelector('video').currentTime : 0;
}

// Function to save current timestamp with comment
saveTimestampButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        const url = tabs[0].url;
        const platform = detectPlatform(url);
        const comment = commentInput.value;

        if (platform) {
            chrome.scripting.executeScript({
                target: { tabId },
                function: getVideoTimestamp
            }, (results) => {
                const timestamp = Math.floor(results[0].result);
                const bookmark = { platform, url, timestamp, comment };

                // Get existing bookmarks for the platform
                chrome.storage.sync.get(platform, (data) => {
                    const bookmarks = data[platform] || [];
                    bookmarks.push(bookmark);
                    chrome.storage.sync.set({ [platform]: bookmarks }, renderBookmarks);
                    commentInput.value = '';  // Clear input
                });
            });
        } else {
            alert("This platform is not supported.");
        }
    });
});

// Function to delete a bookmark
function deleteBookmark(index, platform) {
    chrome.storage.sync.get(platform, (data) => {
        const bookmarks = data[platform] || [];
        bookmarks.splice(index, 1);  // Remove bookmark
        chrome.storage.sync.set({ [platform]: bookmarks }, renderBookmarks);
    });
}

// Function to copy the bookmark link to the clipboard and show a notification
function copyBookmarkLink(bookmark) {
    const link = `${bookmark.url}&t=${bookmark.timestamp}s`;
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');  // Show copy notification
    });
}

// Function to render bookmarks with comments, copy, and delete functionality
function renderBookmarks(filter = '') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const platform = detectPlatform(url);

        // Clear existing bookmarks in the container
        bookmarksContainer.innerHTML = '';

        if (platform) {
            chrome.storage.sync.get(platform, (data) => {
                const bookmarks = data[platform] || [];

                bookmarks.forEach((bookmark, index) => {
                    // Filter bookmarks based on input
                    if (bookmark.comment.toLowerCase().includes(filter.toLowerCase())) {
                        const bookmarkElement = document.createElement('div');
                        bookmarkElement.className = 'bookmark';
                        bookmarkElement.style.marginBottom = '10px'; // Add space between timestamps

                        // Create a hyperlink for the comment
                        const commentElement = document.createElement('a');
                        commentElement.textContent = bookmark.comment || `Bookmark ${index + 1}`;
                        commentElement.href = `${bookmark.url}&t=${bookmark.timestamp}s`;
                        commentElement.target = '_blank';
                        commentElement.className = 'comment-link';

                        // Create a copy button
                        const copyButton = document.createElement('button');
                        copyButton.textContent = 'Copy';
                        copyButton.className = 'copy-button';
                        copyButton.addEventListener('click', () => copyBookmarkLink(bookmark));

                        // Create a delete button
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'delete-button';
                        deleteButton.addEventListener('click', () => deleteBookmark(index, platform));

                        // Append comment, copy, and delete buttons to the bookmark element
                        bookmarkElement.appendChild(commentElement);
                        bookmarkElement.appendChild(copyButton);
                        bookmarkElement.appendChild(deleteButton);

                        // Append the bookmark element to the container
                        bookmarksContainer.appendChild(bookmarkElement);
                    }
                });
            });
        }
    });
}

// Load bookmarks on popup open
document.addEventListener('DOMContentLoaded', () => {
    setDialogTitle(); // Set the dynamic title when popup opens
    renderBookmarks(); // Load bookmarks initially
});

// Filter button functionality
filterButton.addEventListener('click', () => {
    const filterValue = filterInput.value; // Get the filter input value
    renderBookmarks(filterValue); // Call renderBookmarks with the filter value
});
