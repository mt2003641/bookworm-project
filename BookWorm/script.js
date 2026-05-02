// Bookworm Social Platform
// Handles authentication, posts, feed, likes, comments, and follow system

// ==============================================
// Local Storage Initialization
// Create main storage object if it doesn't exist
// ==============================================

if (!localStorage.getItem("bookwormData")) {
  const initialData = {
    users: [],
    posts: [],
  };

  localStorage.setItem("bookwormData", JSON.stringify(initialData));
}


// ===================================================
// Page Protection (Redirect if user is not logged in)
// ===================================================

const currentUser = localStorage.getItem("currentUser");

if (!currentUser && (window.location.pathname.includes("profile.html") || window.location.pathname.includes("feed.html"))) {
  window.location.href = "login.html";
}



// ===================================================
// Dark Mode Toggle (Saves preference in localStorage)
// ===================================================

const darkModeBtn = document.getElementById("dark-mode-toggle");

function updateDarkModeUI() {
  if (document.body.classList.contains("dark-mode")) {
    darkModeBtn.textContent = "☀️";
  } else {
    darkModeBtn.textContent = "🌙";
  }
}

if (darkModeBtn) {
  darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }

    updateDarkModeUI();
  });
}

const savedMode = localStorage.getItem("darkMode");

if (savedMode === "enabled") {
  document.body.classList.add("dark-mode");
} else if (!savedMode) {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.body.classList.add("dark-mode");
    }
}

if (darkModeBtn) {
  updateDarkModeUI();
}


// =====================
// Data Helper Functions
// =====================

// gets all saved data from localStorage
function getData() {
  const data = localStorage.getItem("bookwormData");
  return data ? JSON.parse(data) : { users: [], posts: [] };
}

// saves updated data back to localeStorage
function saveData(data) {
  localStorage.setItem("bookwormData", JSON.stringify(data));
}


// ===========================================================
// custom toast message
// ===========================================================

function showToast(message, type = "info") {
  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}


// ============================================================
// Data Migration (Update old data to work with the new system)
// ============================================================

function migrateOldData() {
  const data = getData();
  let changed = false;

  data.posts.forEach((post) => {
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
      changed = true;
    }

    if ("likes" in post) {
      delete post.likes;
      changed = true;
    }

    if (!Array.isArray(post.comments)) {
      post.comments = [];
      changed = true;
    }
  });

  if (changed) {
    saveData(data);
  }
}

migrateOldData();
let activeFeedTab = "following";


// ===========================
// User Registration (Sign Up)
// ===========================

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const data = getData();

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < 8 || !hasLetter || !hasNumber) {
      showToast(
        "Use a strong password: at least 8 characters with letters and numbers.",
        "error",
      );
    return;
    }

    const existingUser = data.users.find((u) => u.username === username);
    if (existingUser) {
      showToast("Username already exists.", "error");
      return;
    }

    const newUser = {
      username: username,
      email: email,
      password: password,
      name: username,
      bio: "",
      photo: "",
      followers: [],
      following: [],
    };

    data.users.push(newUser);
    saveData(data);

    showToast("Account created successfully.", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}


// ==========
// User Login
// ==========

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const data = getData();
    const user = data.users.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      localStorage.setItem("currentUser", user.username);
      window.location.href = "profile.html";
    } else {
      showToast("Invalid username or password.", "error");
    }
  });
}


// ===========
// Create Post
// ===========

const postBtn = document.getElementById("post-btn");

if (postBtn) {
  postBtn.addEventListener("click", function () {
    const postInput = document.getElementById("post-input");
    const postText = postInput.value.trim();
    const authorInput = document.getElementById("author-input").value.trim();
    const bookInput = document.getElementById("book-input").value.trim();

    if (postText === "") return;

    const data = getData();
    const currentUser = localStorage.getItem("currentUser");

    const newPost = {
      id: Date.now(),
      author: currentUser,
      text: postText,
      authorInput: authorInput,
      bookInput: bookInput,
      likedBy: [],
      comments: [],
      timestamp: Date.now(),
    };

    data.posts.push(newPost);
    saveData(data);

    postInput.value = "";

    document.getElementById("author-input").value = "";
    document.getElementById("book-input").value = "";

    loadUserPosts();
    loadGlobalFeed();
    updateProfileUI();
  });
}

const togglePostBtn = document.getElementById("toggle-create-post-btn");
const createPostSection = document.getElementById("create-post-section");

if (togglePostBtn) {
  togglePostBtn.addEventListener("click", () => {
    createPostSection.classList.toggle("hidden");
  });
}


// ===============
// Load User Posts
// ===============

function loadUserPosts() {
  const postList = document.getElementById("user-posts-list");
  if (!postList) return;

  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const viewedUser = localStorage.getItem("viewProfile") || currentUser;
  const isOwnProfile = viewedUser === currentUser;

  postList.innerHTML = "";

  const userPosts = data.posts.filter((p) => p.author === viewedUser);

  if (userPosts.length === 0) {
    postList.innerHTML =
      "<p class='empty-msg'>No posts yet. Start sharing your favorite quotes!</p>";
    return;
  }

  userPosts.reverse().forEach((post) => {
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const isLiked = post.likedBy.includes(currentUser);
    const div = document.createElement("div");
    div.classList.add("post");

    div.innerHTML = `
            <p>
              ${post.text}
              <strong>- ${post.authorInput || "Unknown Author"}
              ${post.bookInput ? `| ${post.bookInput}` : ""}</strong>
            </p>

            <div class="post-actions">
              <button class="like-btn" onclick="handleLike(${post.id})"> ${isLiked ? "❤️" : "🤍"} ${post.likedBy.length}</button>
              <button class="comment-btn" onclick="toggleCommentBox(${post.id}); showComments(${post.id})">💬 ${post.comments.length}</button>
              ${post.author === currentUser ? `<button class="delete-btn" onclick="deletePost(${post.id})">X</button>` : ""}
            </div>

            <div id="comment-box-${post.id}" class="hidden">
              <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment...">
              <button class="comment-btn" onclick="addComment(${post.id})">Comment</button>
            </div>

            <div class="comments-section" id="comments-${post.id}" style="display:none;"></div>
        `;

    postList.appendChild(div);
  });
}

// Delete a Post (only by post owner)
function deletePost(postId) {
  const data = getData();
  data.posts = data.posts.filter((p) => p.id !== postId);

  saveData(data);
  loadUserPosts();
  loadGlobalFeed();
  updateProfileUI();
}


// ===============
// Profile Editing
// ===============

const editBtn = document.getElementById("edit-profile-btn");
const editForm = document.getElementById("edit-form-container");
const saveProfileBtn = document.getElementById("save-changes-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

if (editBtn) {
  editBtn.addEventListener("click", function () {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const user = data.users.find((u) => u.username === currentUser);

    if (!user) return;

    const photoInput = document.getElementById("input-photo");
    const nameInput = document.getElementById("input-name");
    const usernameInput = document.getElementById("input-username");
    const bioInput = document.getElementById("input-bio");

    if (photoInput) photoInput.value = user.photo || "";
    if (nameInput) nameInput.value = user.name || "";
    if (usernameInput) usernameInput.value = user.username || "";
    if (bioInput) bioInput.value = user.bio || "";

    editForm.classList.remove("hidden");
  });
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
    const data = getData();
    const currentUser = localStorage.getItem("currentUser");
    const userIndex = data.users.findIndex((u) => u.username === currentUser);

    if (userIndex === -1) return;

    const oldUsername = data.users[userIndex].username;
    const newUsername = document.getElementById("input-username").value.trim();

    data.users[userIndex].photo = document.getElementById("input-photo").value.trim();
    data.users[userIndex].name = document.getElementById("input-name").value.trim();
    data.users[userIndex].username = newUsername;
    data.users[userIndex].bio = document.getElementById("input-bio").value.trim();

    if (oldUsername !== newUsername) {
      data.posts.forEach((post) => {
        if (post.author === oldUsername) {
          post.author = newUsername;
        }

        if (Array.isArray(post.likedBy)) {
          post.likedBy = post.likedBy.map((name) =>
            name === oldUsername ? newUsername : name,
          );
        }

        post.comments.forEach((comment) => {
          if (comment.author === oldUsername) {
            comment.author = newUsername;
          }
        });
      });

      data.users.forEach((user) => {
        user.followers = user.followers.map((name) =>
          name === oldUsername ? newUsername : name,
        );
        user.following = user.following.map((name) =>
          name === oldUsername ? newUsername : name,
        );
      });
    }

    saveData(data);
    localStorage.setItem("currentUser", newUsername);
    location.reload();
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    editForm.classList.add("hidden");
  });
}


// =====================================================================
// Logout System (removes logged in user, and redirect it to login page)
// =====================================================================

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}


// =================
// Update Profile UI
// =================

function updateProfileUI() {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const viewedUser = localStorage.getItem("viewProfile") || currentUser;
  const user = data.users.find((u) => u.username === viewedUser);
  const isOwnProfile = viewedUser === currentUser;

  if (!user) return;

  const displayName = document.getElementById("display-name");
  const displayUsername = document.getElementById("display-username");
  const displayBio = document.getElementById("display-bio");
  const profilePic = document.getElementById("profile-pic");
  const postCount = document.getElementById("post-count");
  const followerCount = document.getElementById("follower-count");
  const followingCount = document.getElementById("following-count");

  if (displayName) displayName.textContent = user.name || user.username;
  if (displayUsername) displayUsername.textContent = `@${user.username}`;
  if (displayBio) displayBio.textContent = user.bio || "No bio yet...";
  if (profilePic && user.photo) profilePic.src = user.photo;

  const userPosts = data.posts.filter((p) => p.author === viewedUser);

  if (postCount) postCount.textContent = userPosts.length;
  if (followerCount) followerCount.textContent = user.followers.length;
  if (followingCount) followingCount.textContent = user.following.length;

  // hide actions if viewing another user's profile
  const editBtn = document.getElementById("edit-profile-btn");
  const createPostSection = document.getElementById("create-post-section");
  const togglePostBtn = document.getElementById("toggle-create-post-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (!isOwnProfile) {
    if (editBtn) editBtn.style.display = "none";
    if (createPostSection) createPostSection.style.display = "none";
    if (togglePostBtn) togglePostBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}


// ===========
// Global Feed
// ===========

// randomly shuffle an array (used for explore feed)
function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// updates active tab UI (following vs explore)
function updateFeedTabsUI() {
  const followingTab = document.getElementById("following-tab");
  const exploreTab = document.getElementById("explore-tab");

  if (!followingTab || !exploreTab) return;

  followingTab.classList.toggle("active", activeFeedTab === "following");
  exploreTab.classList.toggle("active", activeFeedTab === "explore");
}

// set up click events for feed tabs
function initializeFeedTabs() {
  const followingTab = document.getElementById("following-tab");
  const exploreTab = document.getElementById("explore-tab");

  if (!followingTab || !exploreTab) return;

  followingTab.addEventListener("click", () => {
    activeFeedTab = "following";
    loadGlobalFeed();
  });

  exploreTab.addEventListener("click", () => {
    activeFeedTab = "explore";
    loadGlobalFeed();
  });

  updateFeedTabsUI();
}


// ============
// Feed Loading
// ============

function loadGlobalFeed() {
  const feedPostsContainer = document.getElementById("feed-posts");
  if (!feedPostsContainer || window.location.pathname.includes("profile.html"))
    return;

  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const currentUserObj = data.users.find((u) => u.username === currentUser);

  feedPostsContainer.innerHTML = "";

  if (!currentUserObj) {
    feedPostsContainer.innerHTML =
      "<p class='empty-msg'>Please log in to view your feed.</p>";
    updateFeedTabsUI();
    return;
  }

  let postsToShow = [];

  if (activeFeedTab === "following") {
    postsToShow = data.posts.filter((post) =>
      currentUserObj.following.includes(post.author),
    );

    postsToShow.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    postsToShow = data.posts.filter(
      (post) =>
        post.author !== currentUser &&
        !currentUserObj.following.includes(post.author),
    );

    postsToShow = shuffleArray(postsToShow);
  }

  if (postsToShow.length === 0) {
    feedPostsContainer.innerHTML = `
            <p class="empty-msg">
                ${
                  activeFeedTab === "following"
                    ? "No posts from people you follow yet."
                    : "No explore posts available yet."
                }
            </p>
        `;
    updateFeedTabsUI();
    return;
  }

  postsToShow = postsToShow.filter((post) => {
    if (
      currentFilters.author &&
      (!post.authorInput ||
        !post.authorInput.toLowerCase().includes(currentFilters.author))
    ) {
      return false;
    }

    if (
      currentFilters.book &&
      (!post.bookInput ||
        !post.bookInput.toLowerCase().includes(currentFilters.book))
    ) {
      return false;
    }
    return true;
  });

  postsToShow.forEach((post) => {
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const authorUser = data.users.find((u) => u.username === post.author);
    const displayName = authorUser?.name || post.author;

    const isFollowing = currentUserObj.following.includes(post.author);
    const followText = isFollowing ? "Unfollow" : "Follow";

    const isLiked = post.likedBy.includes(currentUser);

    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    postDiv.innerHTML = `
            <div class="post-header">
                <div class="author-info">
                    <span class="author-name" onclick="goToProfile('${post.author}')">${displayName}</span>
                    ${post.author !== currentUser ? `<button class="follow-btn" onclick="toggleFollow('${post.author}')">${followText}</button>` : ""}
                </div>
                <span class="timestamp">${formatTimestamp(post.timestamp)}</span>
            </div>

            <div class="post-content">
                <p>
                  ${post.text}
                  <strong>- ${post.authorInput || "Unknown Author"}
                  ${post.bookInput ? ` | ${post.bookInput}` : ""}</strong>
                </p>
            </div>

            <div class="post-actions">
                <button class="like-btn" onclick="handleLike(${post.id})">${isLiked ? "❤️" : "🤍"} ${post.likedBy.length}</button>
                <button class="comment-btn" onclick="toggleCommentBox(${post.id})">💬 ${post.comments.length}</button>
            </div>

            <div id="comment-box-${post.id}" class="hidden">
                <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment...">
                <button class="comment-btn" onclick="addComment(${post.id})">Comment</button>
            </div>

            <div id="comments-${post.id}" class="comments-section">
              ${post.comments
                .map((c, index) => {
                  if (!Array.isArray(c.likedBy)) {
                    c.likedBy = [];
                  }

                  const commentUser = data.users.find(
                    (u) => u.username === c.author,
                  );
                  const commentName = commentUser?.name || c.author;

                  const isLiked = c.likedBy.includes(currentUser);
                  return `
                  <div class="comment-row">
                    <span>
                      <p><strong>${commentName}</strong>: ${c.text}</p>
                    </span>

                    <div class="comment-actions">
                      <button class="like-btn" onclick="toggleCommentLike(${post.id}, ${index})">${isLiked ? "❤️" : "🤍"} ${c.likedBy.length}</button>
                      ${c.author === currentUser ? `<button class="delete-btn" onclick="deleteComment(${post.id}, ${index})">X</button>` : ""}
                    </div>
                  </div>`;
                })
                .join("")}
            </div>`;
    feedPostsContainer.appendChild(postDiv);
  });
  updateFeedTabsUI();
}

// opens author profile from a post in feed
function goToProfile(username) {
  localStorage.setItem("viewProfile", username);
  window.location.href = "profile.html";
}

// goes back to user's own profile
function resetProfileView() {
  localStorage.removeItem("viewProfile");
}

// Delete a Comment (Only comment author can delete their comment)
function deleteComment(postId, commentIndex) {
  const data = getData();
  const post = data.posts.find((p) => p.id === postId);

  if (!post) return;

  post.comments.splice(commentIndex, 1);

  saveData(data);
  loadGlobalFeed();
  loadUserPosts();
  showComments(postId);
}

// ==============================================================================
// Filter Functionality for Sidebar (filters posts by author's name or book title)
// ==============================================================================

// Global State for Filters
let currentFilters = {
  author: "",
  book: "",
};

// Get's unique values (no duplicates) from posts for (book / author) suggestions
function getUniqueValues(key) {
  const data = getData();
  const values = data.posts
    .map((post) => post[key])
    .filter((v) => v && v.trim() !== "");

  return [...new Set(values)];
}

const authorFilter = document.getElementById("filter-author");
const bookFilter = document.getElementById("filter-book");
const clearBtn = document.getElementById("clear-filters-btn");

// Author filter
if (authorFilter) {
  authorFilter.addEventListener("input", () => {
    currentFilters.author = authorFilter.value.toLowerCase();
    loadGlobalFeed();
  });
}

// Book filter
if (bookFilter) {
  bookFilter.addEventListener("input", () => {
    currentFilters.book = bookFilter.value.toLowerCase();
    loadGlobalFeed();
  });
}

// Clear filters button (reset all filter values)
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    currentFilters.author = "";
    currentFilters.book = "";
    authorFilter.value = "";
    bookFilter.value = "";
    loadGlobalFeed();
  });
}

// Author Suggestions (Shows dropdown of author names based on input)
const authorInput = document.getElementById("filter-author");
const authorBox = document.getElementById("author-suggestions");

if (authorInput) {
  authorInput.addEventListener("input", () => {
    const value = authorInput.value.toLowerCase();
    authorBox.innerHTML = "";

    if (value === "") return;

    const authors = getUniqueValues("authorInput");

    authors.filter((a) => a.toLowerCase().includes(value)).forEach((a) => {
        const div = document.createElement("div");
        div.textContent = a;

        div.onclick = () => {
          authorInput.value = a;
          authorBox.innerHTML = "";
          currentFilters.author = a.toLowerCase();
          loadGlobalFeed();
        };

        authorBox.appendChild(div);
      });
  });
}

// Book Suggestions (Shows dropdown of book titles based on input)
const bookInput = document.getElementById("filter-book");
const bookBox = document.getElementById("book-suggestions");

if (bookInput) {
  bookInput.addEventListener("input", () => {
    const value = bookInput.value.toLowerCase();
    bookBox.innerHTML = "";

    if (value === "") return;

    const books = getUniqueValues("bookInput");

    books.filter((b) => b.toLowerCase().includes(value)).forEach((b) => {
        const div = document.createElement("div");
        div.textContent = b;

        div.onclick = () => {
          bookInput.value = b;
          bookBox.innerHTML = "";
          currentFilters.book = b.toLowerCase();
          loadGlobalFeed();
        };

        bookBox.appendChild(div);
      });
  });
}

// Close suggestions dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".filter-sidebar")) {
    document.getElementById("author-suggestions").innerHTML = "";
    document.getElementById("book-suggestions").innerHTML = "";
  }
});


// Like a Post (one like per user only: first click like, and second click unlike)
function handleLike(postId) {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");
  const post = data.posts.find((p) => p.id === postId);

  if (!post || !currentUser) return;

  if (!Array.isArray(post.likedBy)) {
    post.likedBy = [];
  }

  if (post.likedBy.includes(currentUser)) {
    post.likedBy = post.likedBy.filter((username) => username !== currentUser);
  } else {
    post.likedBy.push(currentUser);
  }

  saveData(data);
  loadUserPosts();
  loadGlobalFeed();
}

// Like a Comment (one like per user only: first click like, and second click unlike)
function toggleCommentLike(postId, commentIndex) {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");

  const post = data.posts.find((p) => p.id === postId);
  if (!post) return;

  const comment = post.comments[commentIndex];
  if (!comment) return;

  if (!Array.isArray(comment.likedBy)) {
    comment.likedBy = [];
  }

  if (comment.likedBy.includes(currentUser)) {
    comment.likedBy = comment.likedBy.filter((u) => u !== currentUser);
  } else {
    comment.likedBy.push(currentUser);
  }

  saveData(data);
  loadGlobalFeed();
  loadUserPosts();
}

// Post Timestamp Formatting (convert timestamp into readable time)
function formatTimestamp(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return minutes + " min ago";
  }

  if (hours < 24) {
    return hours + " hr ago";
  }

  if (days < 7) {
    return days + " day ago";
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

setInterval(() => {
  loadGlobalFeed();
}, 60000);


// ==============
// Comment System
// ==============

function toggleCommentBox(postId) {
  const box = document.getElementById(`comment-box-${postId}`);
  if (box) {
    box.classList.toggle("hidden");
  }
}

// Add a Comment to a post
function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;

  const text = input.value.trim();
  if (text === "") return;

  const data = getData();
  const post = data.posts.find((p) => p.id === postId);

  if (!post) return;

  post.comments.push({
    author: localStorage.getItem("currentUser"),
    text: text,
    likedBy: [],
  });

  saveData(data);
  input.value = "";

  loadGlobalFeed();
  loadUserPosts();
}

// Show / Toggle Comments (Profile page)
function showComments(postId) {
  const data = getData();
  const post = data.posts.find((p) => p.id === postId);

  if (!post) return;

  const commentsDiv = document.getElementById("comments-" + postId);

  if (!commentsDiv) return;

  commentsDiv.style.display =
    commentsDiv.style.display === "none" ? "block" : "none";
  commentsDiv.innerHTML = "";

  post.comments.forEach((comment, index) => {
    const commentUser = data.users.find((u) => u.username === comment.author);
    const commentName = commentUser?.name || comment.author;

    const currentUser = localStorage.getItem("currentUser");

    const div = document.createElement("div");
    div.classList.add("comment-row");

    div.innerHTML = `
      <span>
        <strong>${commentName}</strong>: ${comment.text}
      </span>
      
      <div class="comment-actions">
        ${
          comment.author === currentUser
            ? `<button class="delete-btn" onclick="deleteComment(${postId}, ${index})">X</button>`
            : ""
        }
      </div>
    `;
    commentsDiv.appendChild(div);
  });
}


// ========================
// Follow / Unfollow System
// ========================

function toggleFollow(author) {
  const data = getData();
  const currentUser = localStorage.getItem("currentUser");

  if (author === currentUser) return;

  const currentUserObj = data.users.find((u) => u.username === currentUser);
  const authorObj = data.users.find((u) => u.username === author);

  if (!currentUserObj || !authorObj) return;

  if (currentUserObj.following.includes(author)) {
    currentUserObj.following = currentUserObj.following.filter(
      (u) => u !== author,
    );
    authorObj.followers = authorObj.followers.filter((u) => u !== currentUser);
  } else {
    currentUserObj.following.push(author);
    authorObj.followers.push(currentUser);
  }

  saveData(data);
  loadGlobalFeed();
  updateProfileUI();
}

// Updates login button text (shows username if logged in)
function updateLoginButton() {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) return;

  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    loginBtn.textContent = currentUser;
    loginBtn.href = "profile.html";
  } else {
    loginBtn.textContent = "Log in";
    loginBtn.href = "login.html";
  }
}

// Show or hide sign link depending on login state
function updateAuthNav() {
  const signupGroup = document.getElementById("signup-group");
  const currentUser = localStorage.getItem("currentUser");

  if (signupGroup) {
    signupGroup.style.display = currentUser ? "none" : "flex";
  }
}


// ===================
// Page Initialization
// ===================

if (document.getElementById("user-posts-list")) {
  loadUserPosts();
}

if (document.getElementById("display-name")) {
  updateProfileUI();
}

if (document.getElementById("feed-posts")) {
  initializeFeedTabs();
  loadGlobalFeed();
}

const closeDetailBtn = document.getElementById("close-detail-btn");

if (closeDetailBtn) {
  closeDetailBtn.addEventListener("click", () => {
    const postDetail = document.getElementById("post-detail");
    if (postDetail) {
      postDetail.classList.add("hidden");
    }
  });
}

// ==========================//
function showToast(message, type = "info") {
  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function updateAuthNav() {
  const signupNavItem = document.getElementById("signup-nav-item");
  const currentUser = localStorage.getItem("currentUser");

  if (signupNavItem) {
    signupNavItem.style.display = currentUser ? "none" : "flex";
  }
}

updateLoginButton();
updateAuthNav();