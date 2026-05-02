import {
  getTotalPosts,
  getTotalUsers,
  getMostActiveUsers,
  getPostsPerUser,
  getLatestPost,
  getInactiveUsers,
  getNewestUser,
} from "@/lib/repository";

export async function GET() {
  const [
    totalPosts,
    totalUsers,
    mostActiveUsers,
    postsPerUser,
    latestPost,
    inactiveUsers,
    newestUser,
  ] = await Promise.all([
    getTotalPosts(),
    getTotalUsers(),
    getMostActiveUsers(),
    getPostsPerUser(),
    getLatestPost(),
    getInactiveUsers(),
    getNewestUser(),
  ]);

  const totalPostsNum = Number(totalPosts);
  const totalUsersNum = Number(totalUsers);

  const avgPostsPerUser = totalUsersNum === 0 ? 0 : (totalPostsNum / totalUsersNum).toFixed(2);

  return Response.json({
    totalPosts: totalPostsNum,
    totalUsers: totalUsersNum,
    avgPostsPerUser,
    mostActiveUsers,
    postsPerUser,
    latestPost,
    inactiveUsers,
    newestUser,
  });
}