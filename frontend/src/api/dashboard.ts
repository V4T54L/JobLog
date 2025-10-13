import { DashboardStats, ApiResponse } from '../types';
import { getApplications } from './applications';
import { getBlogPosts } from './blog';

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      try {
        const [applicationsResponse, blogPostsResponse] = await Promise.all([
          getApplications(),
          getBlogPosts()
        ]);

        const applications = applicationsResponse.data;
        const blogPosts = blogPostsResponse.data;

        const statusBreakdown = applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {} as DashboardStats['statusBreakdown']);

        const stats: DashboardStats = {
          totalApplications: applications.length,
          interviewing: applications.filter(app => app.status === 'Interviewing').length,
          offers: applications.filter(app => app.status === 'Offer').length,
          recentApplications: applications.slice(0, 5),
          recentBlogPosts: blogPosts.slice(0, 3),
          statusBreakdown
        };

        resolve({ data: stats });
      } catch (error) {
        resolve({
          data: {
            totalApplications: 0,
            interviewing: 0,
            offers: 0,
            recentApplications: [],
            recentBlogPosts: [],
            statusBreakdown: {
              Applied: 0,
              Interviewing: 0,
              Offer: 0,
              Rejected: 0,
              Archived: 0
            }
          }
        });
      }
    }, 400);
  });
}