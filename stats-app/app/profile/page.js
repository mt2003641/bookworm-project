"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";


// ============================
// Timestamp Helper
// ============================

function formatTimestamp(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} day ago`;

  return new Date(timestamp).toLocaleDateString();
}


export default function ProfilePage() {
  const params = useSearchParams();
  const router = useRouter();

  const loggedInUsername = params.get("user");
  const viewUsername = params.get("view") || loggedInUsername;
  const isOwnProfile = viewUsername === loggedInUsername;

  // (all posts and users fetched from the database)
  const [allPosts, setAllPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const [viewedUser, setViewedUser]   = useState(null);

  // (takes the logged in user full data)
  const [loggedInUser, setLoggedInUser] = useState(null);

  // (controls new post form visibility)
  const [showPost, setShowPost] = useState(false);

  // (controls edit profile form visibility)
  const [showEdit, setShowEdit] = useState(false);

  // (tracks dark mode on/off state)
  const [darkMode, setDarkMode] = useState(false);

  const [toast, setToast] = useState(null);

  // (new post form fields)
  const [newPost, setNewPost] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newBook, setNewBook] = useState("");

  // (edit profile form fields, it's pre filled when the form opens)
  const [editPhoto, setEditPhoto] = useState("");
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  // (tracks which post have their comment box open)
  const [openCommentBoxes, setOpenCommentBoxes] = useState({});

  // (stores comments for each post)
  const [commentInputs, setCommentInputs] = useState({});


  // ============================
  // Dark Mode
  // ============================

  // (checks if the user had dark mode on when the user revisit this page)
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "enabled") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // (toggles dark mode on/off and saves preference to localStorage)
  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("darkMode", next ? "enabled" : "disabled");
}


  // ============================
  // Toast
  // ============================

  // (displays temporary notification message)
  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }


  // ============================
  // Initial Data Load
  // ============================

  // (fetches all users and posts from api)
  async function loadData() {
    if (!loggedInUsername) {
      router.push("/login");
      return;
    }

    const [usersRes, postsRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/posts"),
    ]);

    const allUsers = await usersRes.json();
    const posts = await postsRes.json();

    setUsers(allUsers);
    setAllPosts(posts);

    const viewed = allUsers.find(u => u.username === viewUsername) || null;
    const loggedIn = allUsers.find(u => u.username === loggedInUsername) || null;

    setViewedUser(viewed);
    setLoggedInUser(loggedIn);
  }

  useEffect(() => {
    loadData();
  }, []);


  // ===============================
  // Posts belonging to viewed user
  // ===============================

  const userPosts = [...allPosts].filter(p => p.author === viewUsername).reverse();


  // ============================
  // Create a Post
  // ============================

  // (creates a new post and adds it to the database)
  async function handlePost() {
    if (!newPost.trim()) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: newPost.trim(),
        author: loggedInUsername,
        authorInput: newAuthor.trim(),
        bookInput: newBook.trim(),
        likedBy: [],
        comments: [],
        timestamp: Date.now(),
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setAllPosts(prev => [...prev, created]);
      setNewPost("");
      setNewAuthor("");
      setNewBook("");
      setShowPost(false);
    } else {
      showToast("Failed to create post.", "error");
    }
  }


  // ============================
  // Delete a Post (owned posts only)
  // ============================

  // (deletes a post from the database)
  async function deletePost(postId) {
    setAllPosts(prev => prev.filter(p => p.id !== postId));

    await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUsername }),
    });
  }


  // ============================
  // Like / Unlike a Post
  // ============================

  async function handleLike(postId) {
    if (!loggedInUser) return;

    const post = allPosts.find(p => p.id === postId);
    const likedBy = post?.likedBy || [];
    const alreadyLiked = likedBy.includes(loggedInUsername);

    const updatedLikedBy = alreadyLiked ? likedBy.filter(u => u !== loggedInUsername) : [...likedBy, loggedInUsername];

    setAllPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, likedBy: updatedLikedBy } : p)
    );

    await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUsername }),
    });
  }


  // ============================
  // Comment System
  // ============================

  // (shows or hides the comment input box for a post)
  function toggleCommentBox(postId) {
    setOpenCommentBoxes(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  // (adds a new comment to a post and saves it to the database)
  async function addComment(postId) {
    const text = (commentInputs[postId] || "").trim();
    if (!text || !loggedInUser) return;

    const newComment = { author: loggedInUsername, text, likedBy: [] };

    setAllPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
      )
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    await fetch(`/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: loggedInUsername, text }),
    });
  }

  // (removes a comment by index)
  async function deleteComment(postId, commentIndex) {
    setAllPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const updated = [...p.comments];
        updated.splice(commentIndex, 1);
        return { ...p, comments: updated };
      })
    );

    await fetch(`/api/posts/${postId}/comment/${commentIndex}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUsername }),
    });
  }

  // (toggles a like on a specific comment and saves it to the database)
  async function toggleCommentLike(postId, commentIndex) {
    if (!loggedInUser) return;

    setAllPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const updatedComments = p.comments.map((c, i) => {
          if (i !== commentIndex) return c;
          const likedBy = c.likedBy || [];
          const alreadyLiked = likedBy.includes(loggedInUsername);
          return {
            ...c, likedBy: alreadyLiked ? likedBy.filter(u => u !== loggedInUsername) : [...likedBy, loggedInUsername],
          };
        });
        return { ...p, comments: updatedComments };
      })
    );

    await fetch(`/api/posts/${postId}/comment/${commentIndex}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUsername }),
    });
  }


  // ============================
  // Edit Profile
  // ============================

  // (pre fills edit form with the current profile values)
  function openEditForm() {
    if (!viewedUser) return;
    setEditPhoto(viewedUser.photo || "");
    setEditName(viewedUser.name || "");
    setEditUsername(viewedUser.username || "");
    setEditBio(viewedUser.bio || "");
    setShowEdit(true);
  }

  // (saves the updated profile to the database)
  async function handleSaveProfile() {
    const trimmedUsername = editUsername.trim();

    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUsername: loggedInUsername,
        name: editName.trim(),
        username: editUsername.trim(),
        bio: editBio.trim(),
        photo: editPhoto.trim(),
  }),
});

    if (res.ok) {
      setShowEdit(false);
      if (trimmedUsername !== loggedInUsername) {
        router.push(`/profile?user=${trimmedUsername}`);
      } else {
        await loadData();
      }
    } else {
      showToast("Failed to save profile", "error");
    }
  }


  // ============================
  // Logout
  // ============================

  // (redirects the user to the log in page)
  function handleLogout() {
    router.push("/login");
  }


  // ============================
  // Render
  // ============================

  return (
    <>
      {toast && (
        <div className={`custom-toast ${toast.type} show`}>
          {toast.message}
        </div>
      )}

      <header>
        <div className="nav-container">
          <div className="logo-section">
            <img src="/logo.png" className="logo" alt="Logo"/>
            <h1 className="site-name">Bookworms</h1>
          </div>

          <nav className="nav">
            <ul className="nav-links">
              <li className="divider">|</li>
              <li><a href={`/feed?user=${loggedInUsername}`}>Feed</a></li>
              <li className="divider">|</li>
              <li><a href="/login">Switch Account</a></li>
              <li className="divider">|</li>
              <li><a href={`/profile?user=${loggedInUsername}`} id="login-btn">{loggedInUsername || "Log In"}</a></li>
              <li className="divider">|</li>
              <li>
                <button id="dark-mode-toggle" onClick={toggleDarkMode}>{darkMode ? "☀️" : "🌙"}</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="profile-container">

        <section className="profile-header-top">
          <div className="photo-name-row">
            <img src={viewedUser?.photo || "/profile_photo.png"} alt="Profile Photo" className="profile-photo-large" id="profile-pic" width="150px"/>
            <h2 id="display-name" className="account-name">{viewedUser?.name || viewedUser?.username || "name"}</h2>
          </div>

          <div className="username-row">
            <p id="display-username">@{viewedUser?.username || "username"}</p>
          </div>

          <div className="bio-section">
            <p id="display-bio">{viewedUser?.bio || "No bio yet..."}</p>
          </div>

          <div className="stats-inline-row">
            <span className="stat-item">
              <strong id="post-count">{userPosts.length}</strong> posts </span>
            <span className="stat-item">
              <strong id="follower-count">{viewedUser?.followers?.length ?? 0}</strong> followers </span>
            <span className="stat-item">
              <strong id="following-count">{viewedUser?.following?.length ?? 0}</strong> following </span>
          </div>

          {isOwnProfile && (
            <div className="profile-btn-row">
              <button type="button" id="edit-profile-btn" onClick={openEditForm}>Edit</button>
              <button type="button" id="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </section>

        {showEdit && isOwnProfile && (
          <section id="edit-form-container">
            <h3>Edit Profile</h3>

            <label htmlFor="input-photo">Photo URL:</label><br />
            <input type="text" id="input-photo" placeholder="paste image link here" value={editPhoto} onChange={e => setEditPhoto(e.target.value)}/><br />

            <label htmlFor="input-name">Name:</label><br />
            <input type="text" id="input-name" value={editName} onChange={e => setEditName(e.target.value)}/><br />

            <label htmlFor="input-username">Username:</label><br />
            <input type="text" id="input-username" value={editUsername} onChange={e => setEditUsername(e.target.value)}/><br />

            <label htmlFor="input-bio">Bio:</label><br />
            <textarea id="input-bio" rows="4" placeholder="write something about your reading journey..." value={editBio} onChange={e => setEditBio(e.target.value)}/><br />

            <button type="button" id="save-changes-btn" onClick={handleSaveProfile}>Save Changes</button>
            <button type="button" id="cancel-edit-btn" onClick={() => setShowEdit(false)}>Cancel</button>
          </section>
        )}

        <div className="posts-section">

          {isOwnProfile && (
            <button id="toggle-create-post-btn" onClick={() => setShowPost(prev => !prev)}>+ New Post</button>
          )}

          {showPost && isOwnProfile && (
            <section className="create-post-section" id="create-post-section">
              <h3>Create a Post</h3>
              <textarea id="post-input" placeholder="Share a book quote or thought..." rows="3" value={newPost}
                onChange={e => setNewPost(e.target.value)}/>
              <input type="text" id="author-input" placeholder="Add the author name" value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}/>
              <input type="text" id="book-input" placeholder="Add the book title (optional)" value={newBook}
                onChange={e => setNewBook(e.target.value)}/>
              <br/><br/>
              <button id="post-btn" onClick={handlePost}>Post</button>
            </section>
          )}

          <section className="profile-main-feed" id="content-area">
            <div id="user-posts-list">

              {userPosts.length === 0 ? (
                <p className="empty-msg"> No posts yet. Start sharing your favorite quotes!</p> ) : (
                userPosts.map(post => {
                  const likedBy = post.likedBy || [];
                  const isLiked = likedBy.includes(loggedInUsername);
                  const comments = post.comments || [];
                  const isPostOwner = post.author === loggedInUsername;

                  return (
                    <div key={post.id} className="post">

                      <p>
                        {post.text}
                        <strong>
                          {" "}- {post.authorInput || "Unknown Author"}
                          {post.bookInput ? ` | ${post.bookInput}` : ""}
                        </strong>
                      </p>

                      <div className="post-actions">
                        <button className="like-btn" onClick={() => handleLike(post.id)}>{isLiked ? "❤️" : "🤍"} {likedBy.length}</button>
                        <button className="comment-btn" onClick={() => toggleCommentBox(post.id)}> 💬 {comments.length}</button>
                        {isPostOwner && (
                          <button className="delete-btn"onClick={() => deletePost(post.id)}>X</button>
                        )}
                      </div>

                      {openCommentBoxes[post.id] && (
                        <div id={`comment-box-${post.id}`}>
                          <input type="text" className="comment-input" id={`comment-input-${post.id}`} placeholder="write a comment..." value={commentInputs[post.id] || ""} onChange={e =>
                              setCommentInputs(prev => ({
                                ...prev, [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={e => {
                              if (e.key === "Enter") addComment(post.id);
                            }}/>
                          <button className="comment-btn" onClick={() => addComment(post.id)}>Comment</button>
                        </div>
                      )}

                      <div className="comments-section" id={`comments-${post.id}`}>
                        {comments.map((c, index) => {
                          const commentLikedBy = c.likedBy || [];
                          const commentIsLiked = commentLikedBy.includes(loggedInUsername);
                          const commentUser = users.find(u => u.username === c.author);
                          const commentName = commentUser?.name || c.author;
                          const isOwnComment = c.author === loggedInUsername;

                          return (
                            <div key={index} className="comment-row">
                              <span><strong>{commentName}</strong>: {c.text}</span>
                              <div className="comment-actions">
                                <button className="like-btn" onClick={() => toggleCommentLike(post.id, index)}>{commentIsLiked ? "❤️" : "🤍"} {commentLikedBy.length}</button>
                                {isOwnComment && (
                                  <button className="delete-btn" onClick={() => deleteComment(post.id, index)}>X</button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      <footer>
        <p>&copy; 2026 Bookworms. All rights reserved.</p>
      </footer>
    </>
  );
}