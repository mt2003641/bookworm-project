import {
  getTotalPosts,
  getTotalUsers,
  getMostActiveUsers,
  getPostsPerUser,
  getLatestPost,
  getInactiveUsers,
  getNewestUser,
} from "@/lib/repository";

// (fetches all stats from the database)
export default async function StatisticsPage() {
  const totalPosts = await getTotalPosts();
  const totalUsers = await getTotalUsers();
  const mostActiveUsers = await getMostActiveUsers();
  const postsPerUser = await getPostsPerUser();
  const latestPost = await getLatestPost();
  const inactiveUsers = await getInactiveUsers();
  const newestUser = await getNewestUser();

  const avgPostsPerUser = Number(totalUsers) === 0 ? 0 : Math.floor(Number(totalPosts) / Number(totalUsers));

  return (
    <main className="statistics-page">

      <h1>Bookworms Statistics</h1>

      <div className="post">
        <div className="post-header"><strong>Total Posts:</strong></div>
        <div className="post-content">
          <p>{totalPosts} posts shared on Bookworms</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Total Users:</strong></div>
        <div className="post-content">
          <p>{totalUsers} registered users</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Average Posts Per User:</strong></div>
        <div className="post-content">
          <p>{avgPostsPerUser} posts per user on average</p>
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Most Active Users (Top 5):</strong></div>
        <div className="post-content">
          {mostActiveUsers?.length > 0 ? (mostActiveUsers.map((u, i) => (
              <p key={i}>{i + 1}. @{u.author} ({u._count.author} posts)</p>
            )) ) : (
            <p>No data yet!</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Posts Per User:</strong></div>
        <div className="post-content">
          {postsPerUser?.length > 0 ? (postsPerUser.map((u, i) => (
              <p key={i}>@{u.author}: {u._count.author} posts</p>
            )) ) : (
            <p>No data yet!</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Latest Post:</strong></div>
        <div className="post-content">
          {latestPost ? (
            <>
              <p>"{latestPost.text}" - by @{latestPost.author}</p>
            </>
          ) : (
            <p>No posts yet!</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Users With No Posts:</strong></div>
        <div className="post-content">
          {inactiveUsers?.length > 0 ? (inactiveUsers.map((u, i) => (
              <p key={i}>@{u.username}</p>
            )) ) : (
            <p>All users have posted at least once!</p>
          )}
        </div>
      </div>

      <div className="post">
        <div className="post-header"><strong>Newest Member:</strong></div>
        <div className="post-content">
          {newestUser ? (
            <p>@{newestUser.username}</p> ) : (
            <p>No users yet.</p>
          )}
        </div>
      </div>

    </main>
  );
}