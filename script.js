const STORAGE_KEY = "vedaTask30Posts";

const postForm = document.getElementById("postForm");

const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");
const postStatus = document.getElementById("postStatus");

const previewTitle = document.getElementById("previewTitle");
const previewContent = document.getElementById("previewContent");
const previewStatus = document.getElementById("previewStatus");

const postsContainer = document.getElementById("postsContainer");
const postCount = document.getElementById("postCount");

const statusFilter = document.getElementById("statusFilter");

const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const clearFormBtn = document.getElementById("clearFormBtn");

let posts = loadPosts();
let editingPostId = null;

/* ---------------------------------
   LOAD POSTS
--------------------------------- */

function loadPosts() {
    try {
        const savedPosts = localStorage.getItem(STORAGE_KEY);

        if (!savedPosts) {
            return [];
        }

        const parsedPosts = JSON.parse(savedPosts);

        return Array.isArray(parsedPosts)
            ? parsedPosts
            : [];

    } catch (error) {
        console.error("Unable to load posts:", error);
        return [];
    }
}

/* ---------------------------------
   SAVE POSTS
--------------------------------- */

function savePosts() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(posts)
    );
}

/* ---------------------------------
   UNIQUE ID
--------------------------------- */

function createUniqueId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );
}

/* ---------------------------------
   DATE FORMAT
--------------------------------- */

function formatDate(timestamp) {

    const date = new Date(timestamp);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/* ---------------------------------
   FORM PREVIEW
--------------------------------- */

function updateLivePreview() {

    const title =
        postTitle.value.trim();

    const content =
        postContent.value.trim();

    const status =
        postStatus.value;

    previewTitle.textContent =
        title || "Your Post Title";

    previewContent.textContent =
        content ||
        "Your post content will appear here as you type.";

    previewStatus.textContent =
        status === "published"
            ? "PUBLISHED"
            : "DRAFT";

    previewStatus.className =
        `status-badge ${status}`;
}

postTitle.addEventListener(
    "input",
    updateLivePreview
);

postContent.addEventListener(
    "input",
    updateLivePreview
);

postStatus.addEventListener(
    "change",
    updateLivePreview
);

/* ---------------------------------
   CREATE / UPDATE POST
--------------------------------- */

postForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const title =
        postTitle.value.trim();

    const content =
        postContent.value.trim();

    const status =
        postStatus.value;

    if (!title || !content) {
        alert("Please enter both title and content.");
        return;
    }

    const now = Date.now();

    if (editingPostId) {

        const postIndex =
            posts.findIndex(
                post => post.id === editingPostId
            );

        if (postIndex !== -1) {

            posts[postIndex] = {
                ...posts[postIndex],
                title,
                content,
                status,
                updatedAt: now
            };
        }

    } else {

        const newPost = {
            id: createUniqueId(),
            title,
            content,
            status,
            createdAt: now,
            updatedAt: now
        };

        posts.push(newPost);
    }

    savePosts();

    resetForm();

    renderPosts();
});

/* ---------------------------------
   RENDER POSTS
--------------------------------- */

function renderPosts() {

    const filter =
        statusFilter.value;

    let filteredPosts =
        [...posts];

    if (filter !== "all") {

        filteredPosts =
            filteredPosts.filter(
                post => post.status === filter
            );
    }

    // Latest updated posts first
    filteredPosts.sort(
        (a, b) => b.updatedAt - a.updatedAt
    );

    postCount.textContent =
        `${filteredPosts.length} ${
            filteredPosts.length === 1
                ? "post"
                : "posts"
        }`;

    if (filteredPosts.length === 0) {

        postsContainer.innerHTML = `
            <div class="empty-state">

                <h3>No posts found</h3>

                <p>
                    ${
                        filter === "all"
                            ? "Create your first blog post."
                            : `No ${filter} posts available.`
                    }
                </p>

            </div>
        `;

        return;
    }

    postsContainer.innerHTML =
        filteredPosts.map(post => {

            const excerpt =
                post.content.length > 180
                    ? post.content.substring(0, 180) + "..."
                    : post.content;

            const toggleText =
                post.status === "published"
                    ? "Move to Draft"
                    : "Publish";

            return `
                <article class="post-card">

                    <div class="post-card-header">

                        <div>

                            <h3>
                                ${escapeHTML(post.title)}
                            </h3>

                            <span
                                class="status-badge ${post.status}"
                            >
                                ${post.status.toUpperCase()}
                            </span>

                            <div class="post-date">
                                Last updated:
                                ${formatDate(post.updatedAt)}
                            </div>

                        </div>

                    </div>

                    <p class="post-excerpt">
                        ${escapeHTML(excerpt)}
                    </p>

                    <div class="card-actions">

                        <button
                            class="edit-btn"
                            onclick="editPost('${post.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="toggle-btn"
                            onclick="togglePostStatus('${post.id}')"
                        >
                            ${toggleText}
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deletePost('${post.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </article>
            `;
        }).join("");
}

/* ---------------------------------
   EDIT POST
--------------------------------- */

function editPost(id) {

    const post =
        posts.find(
            item => item.id === id
        );

    if (!post) {
        return;
    }

    editingPostId = id;

    postTitle.value = post.title;
    postContent.value = post.content;
    postStatus.value = post.status;

    formTitle.textContent =
        "Edit Post";

    saveBtn.textContent =
        "Update Post";

    cancelEditBtn.classList.remove(
        "hidden"
    );

    updateLivePreview();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* ---------------------------------
   TOGGLE STATUS
--------------------------------- */

function togglePostStatus(id) {

    const post =
        posts.find(
            item => item.id === id
        );

    if (!post) {
        return;
    }

    post.status =
        post.status === "published"
            ? "draft"
            : "published";

    post.updatedAt = Date.now();

    savePosts();

    renderPosts();
}

/* ---------------------------------
   DELETE POST
--------------------------------- */

function deletePost(id) {

    const post =
        posts.find(
            item => item.id === id
        );

    if (!post) {
        return;
    }

    const confirmed =
        confirm(
            `Are you sure you want to delete "${post.title}"?`
        );

    if (!confirmed) {
        return;
    }

    posts =
        posts.filter(
            item => item.id !== id
        );

    savePosts();

    if (editingPostId === id) {
        resetForm();
    }

    renderPosts();
}

/* ---------------------------------
   CLEAR FORM
--------------------------------- */

clearFormBtn.addEventListener(
    "click",
    () => {

        const hasContent =
            postTitle.value.trim() ||
            postContent.value.trim();

        if (hasContent) {

            const confirmed =
                confirm(
                    "Clear the current form?"
                );

            if (!confirmed) {
                return;
            }
        }

        resetForm();
    }
);

/* ---------------------------------
   CANCEL EDIT
--------------------------------- */

cancelEditBtn.addEventListener(
    "click",
    resetForm
);

/* ---------------------------------
   RESET FORM
--------------------------------- */

function resetForm() {

    postForm.reset();

    editingPostId = null;

    formTitle.textContent =
        "Create New Post";

    saveBtn.textContent =
        "Create Post";

    cancelEditBtn.classList.add(
        "hidden"
    );

    updateLivePreview();
}

/* ---------------------------------
   FILTER
--------------------------------- */

statusFilter.addEventListener(
    "change",
    renderPosts
);

/* ---------------------------------
   ESCAPE HTML
--------------------------------- */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ---------------------------------
   INITIALIZATION
--------------------------------- */

updateLivePreview();
renderPosts();