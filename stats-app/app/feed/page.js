"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";


// ============================
// Timestamp Helper
// ============================

function formatTimestamp(timestamp) {
  const now  = Date.now();
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

// ============================
// Shuffle Posts (explore tab)
// ============================

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


export default function FeedPage() {
  const router = useRouter();
  const params = useSearchParams();

  // (takes the user from the url to identify who is logged in)
  const username = params.get("user");

  // (all posts and users fetched from the database)
  const [allPosts, setAllPosts] = useState([]);
  const [users, setUsers] = useState([]);

  // (takes the logged in user full data)
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("following");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);

  // (side bar filters)
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterBook, setFilterBook] = useState("");
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userSuggestions, setUserSuggestions] = useState([]);

  // (tracks which post have their comment box open)
  const [openCommentBoxes, setOpenCommentBoxes] = useState({});

  // (stores comments for each post)
  const [commentInputs, setCommentInputs] = useState({});

  // (re-render timestamp every 60s)
  const [tick, setTick] = useState(0);

  // (detect clicks outside the sidebar)
  const filterSidebarRef = useRef(null);


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
  // Authantication + Data Loa
  // ============================

  // (fetches all users and posts from api)
  async function loadData() {
    const [usersRes, postsRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/posts"),
    ]);

    const allUsers = await usersRes.json();
    const posts = await postsRes.json();

    setUsers(allUsers);
    setAllPosts(posts);

    const user = allUsers.find(u => u.username === username);
    setCurrentUser(user || null);
  }

  // (if no user logged in, redirect to login page)
  useEffect(() => {
    if (!username) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterSidebarRef.current && !filterSidebarRef.current.contains(e.target)) {
        setAuthorSuggestions([]);
        setBookSuggestions([]);
        setUserSuggestions([]);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  // ============================
  // Filter
  // ============================

  // (gets all unique authors or books from posts)
  function getUniqueValues(key) {
    return [...new Set(
      allPosts.map(p => p[key]).filter(v => v && v.trim() !== "")
    )];
  }

  // (updates author filter and shows matching suggestions)
  function handleAuthorFilterChange(value) {
    setFilterAuthor(value);
    if (value === "") { setAuthorSuggestions([]); return; }
    setAuthorSuggestions(
      getUniqueValues("authorInput").filter(a => a.toLowerCase().includes(value.toLowerCase()))
    );
  }

  // (updates book filter and shows matching suggestions)
  function handleBookFilterChange(value) {
    setFilterBook(value);
    if (value === "") { setBookSuggestions([]); return; }
    setBookSuggestions(
      getUniqueValues("bookInput").filter(b => b.toLowerCase().includes(value.toLowerCase()))
    );
  }

  // (clears all active filters and resets suggestion dropdowns)
  function clearFilters() {
    setFilterAuthor("");
    setFilterBook("");
    setAuthorSuggestions([]);
    setBookSuggestions([]);
  }

  // (shows user suggestions as the search input changes)
  function handleUserSearchChange(value) {
    setUserSearch(value);
    if (value === "") {
      setUserSuggestions([]);
      return;
    }

    const term = value.toLowerCase();
    setUserSuggestions(
      users
        .filter(u =>
          u.username.toLowerCase().includes(term) ||
          (u.name || "").toLowerCase().includes(term)
        )
        .slice(0, 6)
    );
  }

  // (navigates to a matched user profile or shows an error if user not found)
  function searchUser() {
    const term = userSearch.trim().toLowerCase();
    if (!term) return;

    const found = users.find(u =>
      u.username.toLowerCase() === term ||
      (u.name || "").toLowerCase() === term
    );

    if (found) {
      setUserSuggestions([]);
      goToProfile(found.username);
    } else {
      showToast("User not found", "error");
    }
  }

  // (following tab: posts from followed users sorted by newest first)
  // (explore tab: posts from unfollowed users in random order)
  const filteredPosts = (() => {
    if (!currentUser) return [];

    const following = currentUser.following || [];
    let base = [];

    if (activeTab === "following") {
      base = allPosts.filter(p => following.includes(p.author)).sort((a, b) => b.timestamp - a.timestamp);
    } else {
      base = shuffleArray(
        allPosts.filter(p => p.author !== currentUser.username && !following.includes(p.author))
      );
    }

    // (author and book title filters)
    if (filterAuthor) {
      base = base.filter(p => p.authorInput && p.authorInput.toLowerCase().includes(filterAuthor.toLowerCase()));
    }
    if (filterBook) {
      base = base.filter(p => p.bookInput && p.bookInput.toLowerCase().includes(filterBook.toLowerCase()));
    }

    return base;
  })();


  // ============================
  // Like / Unlike a Post
  // ============================

  async function handleLike(postId) {
    if (!currentUser) return;

    const post = allPosts.find(p => p.id === postId);
    const likedBy = post?.likedBy || [];
    const alreadyLiked = likedBy.includes(currentUser.username);

    const updatedLikedBy = alreadyLiked ? likedBy.filter(u => u !== currentUser.username) : [...likedBy, currentUser.username];

    setAllPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, likedBy: updatedLikedBy } : p)
    );

    await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username }),
    });
  }


  // ============================
  // Comment System
  // ============================

  function toggleCommentBox(postId) {
    setOpenCommentBoxes(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  async function addComment(postId) {
    const text = (commentInputs[postId] || "").trim();
    if (!text || !currentUser) return;

    const newComment = { author: currentUser.username, text, likedBy: [] };

    setAllPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
      )
    );
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    await fetch(`/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: currentUser.username, text }),
    });
  }

  async function deleteComment(postId, commentIndex) {
    setAllPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const updated = [...p.comments];
        updated.splice(commentIndex, 1);
        return { ...p, comments: updated };
      })
    );

    await fetch(`/api/posts/${postId}/comment/${commentIndex}`, {
      method:"DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username }),
    });
  }

  async function toggleCommentLike(postId, commentIndex) {
    if (!currentUser) return;

    setAllPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const updatedComments = p.comments.map((c, i) => {
          if (i !== commentIndex) return c;
          const likedBy = c.likedBy || [];
          const alreadyLiked = likedBy.includes(currentUser.username);
          return {
            ...c, likedBy: alreadyLiked ? likedBy.filter(u => u !== currentUser.username) : [...likedBy, currentUser.username],
          };
        });
        return { ...p, comments: updatedComments };
      })
    );

    await fetch(`/api/posts/${postId}/comment/${commentIndex}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username }),
    });
  }


  // ============================
  // Delete Post
  // ============================

  async function deletePost(postId) {
    setAllPosts(prev => prev.filter(p => p.id !== postId));

    await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username }),
    });
  }


  // ============================
  // Follow / Unfollow
  // ============================

  // (updates both logged in user following list and target user followers list)
  async function toggleFollow(authorUsername) {
    if (!currentUser || authorUsername === currentUser.username) return;

    const isFollowing = (currentUser.following || []).includes(authorUsername);
    const updatedFollowing = isFollowing ? currentUser.following.filter(u => u !== authorUsername) : [...(currentUser.following || []), authorUsername];

    setCurrentUser(prev => ({ ...prev, following: updatedFollowing }));

    setUsers(prev =>
      prev.map(u => {
        if (u.username === currentUser.username) return { ...u, following: updatedFollowing };
        if (u.username === authorUsername) {
          const followers = u.followers || [];
          return {
            ...u, followers: isFollowing ? followers.filter(f => f !== currentUser.username) : [...followers, currentUser.username],
          };
        }
        return u;
      })
    );

    await fetch(`/api/users/${currentUser.username}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: authorUsername }),
    });
  }


  // ============================
  // Go to Profile
  // ============================

  // (navigates to a user profile while keeping the logged in user)
  function goToProfile(authorUsername) {
    window.location.href = `/profile?user=${username}&view=${authorUsername}`;
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
              <li><a href={`/feed?user=${username}`}>Feed</a></li>
              <li className="divider">|</li>
              <li><a href="/login">Switch Account</a></li>
              <li className="divider">|</li>
              <li>
                <a href={`/profile?user=${username}`} id="login-btn">{currentUser ? currentUser.username : username}</a>
              </li>
              <li className="divider">|</li>
              <li>
                <button id="dark-mode-toggle" onClick={toggleDarkMode}>{darkMode ? "☀️" : "🌙"}</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="feed-layout">

        <aside className="filter-sidebar" ref={filterSidebarRef}>
          <h3>Find User🔎</h3>

          <input type="text" id="search-user" placeholder="Search user..." value={userSearch}
            onChange={e => handleUserSearchChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") searchUser(); }} />
          <div id="user-suggestions" className="suggestions-box">
            {userSuggestions.map((u, i) => (
              <div key={i} onClick={() => { setUserSearch(u.username); setUserSuggestions([]); goToProfile(u.username); }}>
                {u.username}{u.name ? ` (${u.name})` : ""}
              </div>
            ))}
          </div>
          <button id="search-user-btn" type="button" onClick={searchUser}>Search</button>

          <h3>Filter Posts🔍</h3>

          <input type="text" id="filter-author" placeholder="Search by author.."
            value={filterAuthor} onChange={e => handleAuthorFilterChange(e.target.value)}/>
          <div id="author-suggestions" className="suggestions-box">
            {authorSuggestions.map((a, i) => (
              <div key={i} onClick={() => { setFilterAuthor(a); setAuthorSuggestions([]); }}>{a}</div>
            ))}
          </div>

          <input type="text" id="filter-book" placeholder="Search by book.."
            value={filterBook} onChange={e => handleBookFilterChange(e.target.value)}/>
          <div id="book-suggestions" className="suggestions-box">
            {bookSuggestions.map((b, i) => (
              <div key={i} onClick={() => { setFilterBook(b); setBookSuggestions([]); }}>{b}</div>
            ))}
          </div>

          <button id="clear-filters-btn" onClick={clearFilters}>Clear</button>
        </aside>

        <section className="feed">

          <div className="feed-tabs">
            <button type="button" id="following-tab"
              className={`feed-tab ${activeTab === "following" ? "active" : ""}`}
              onClick={() => setActiveTab("following")}>Following👥</button>
            <button type="button" id="explore-tab"
              className={`feed-tab ${activeTab === "explore" ? "active" : ""}`}
              onClick={() => setActiveTab("explore")}>Explore🔥</button>
          </div>

          <div id="feed-posts">

            {currentUser && filteredPosts.length === 0 && (
              <p className="empty-msg">
                {activeTab === "following" ? "No posts from people you follow yet." : "No explore posts available yet."}
              </p>
            )}

            {currentUser && filteredPosts.map(post => {
              const authorUser = users.find(u => u.username === post.author);
              const displayName = authorUser?.name || post.author;
              const likedBy = post.likedBy || [];
              const isLiked = likedBy.includes(currentUser.username);
              const isFollowing = (currentUser.following || []).includes(post.author);
              const isOwnPost = post.author === currentUser.username;
              const comments = post.comments || [];

              return (
                <div key={post.id} className="post">

                  <div className="post-header">
                    <div className="author-info">
                      <span className="author-name" onClick={() => goToProfile(post.author)}
                        style={{ cursor: "pointer" }}>{displayName}</span>
                      {!isOwnPost && (
                        <button className="follow-btn" onClick={() => toggleFollow(post.author)}>{isFollowing ? "Unfollow" : "Follow"}</button>
                      )}
                    </div>
                    <span className="timestamp">{formatTimestamp(post.timestamp)}</span>
                  </div>

                  <div className="post-content">
                    <p>
                      {post.text}
                      <strong>
                        {" "}- {post.authorInput || "Unknown Author"}
                        {post.bookInput ? ` | ${post.bookInput}` : ""}
                      </strong>
                    </p>
                  </div>

                  <div className="post-actions">
                    <button className="like-btn" onClick={() => handleLike(post.id)}>{isLiked ? "❤️" : "🤍"} {likedBy.length}</button>
                    <button className="comment-btn" onClick={() => toggleCommentBox(post.id)}> 💬 {comments.length}</button>
                    {isOwnPost && (
                      <button className="delete-btn" onClick={() => deletePost(post.id)}>X</button>
                    )}
                  </div>

                  {openCommentBoxes[post.id] && (
                    <div id={`comment-box-${post.id}`}>
                      <input type="text" className="comment-input" placeholder="Write a comment..." value={commentInputs[post.id] || ""}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") addComment(post.id); }} />
                      <button className="comment-btn" onClick={() => addComment(post.id)}>Comment</button>
                    </div>
                  )}

                  <div id={`comments-${post.id}`} className="comments-section">
                    {comments.map((c, index) => {
                      const commentLikedBy = c.likedBy || [];
                      const commentIsLiked = commentLikedBy.includes(currentUser.username);
                      const commentUser = users.find(u => u.username === c.author);
                      const commentName = commentUser?.name || c.author;
                      const isOwnComment = c.author === currentUser.username;

                      return (
                        <div key={index} className="comment-row">
                          <span>
                            <p><strong>{commentName}</strong>: {c.text}</p>
                          </span>
                          <div className="comment-actions">
                            <button className="like-btn" onClick={() => toggleCommentLike(post.id, index)}>
                              {commentIsLiked ? "❤️" : "🤍"} {commentLikedBy.length}
                            </button>
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
            })}
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Bookworms. All rights reserved.</p>
      </footer>
    </>
  );
}