import { BlogPost, Comment, CreateBlogPostData, ApiResponse } from '../types';

// Mock data
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'my-job-search-journey',
    title: 'My Job Search Journey: From Burnout to Dream Job',
    content: `# My Job Search Journey: From Burnout to Dream Job

After working at my previous company for 3 years, I was completely burned out. The work had become repetitive, and I felt like I wasn't growing professionally anymore. That's when I decided it was time for a change.

## The Decision to Leave

Making the decision to leave a stable job wasn't easy. I had bills to pay and responsibilities to meet. But I knew that staying would only make things worse for my mental health and career growth.

## Planning My Exit

I spent about 2 months preparing for my job search:

- **Updated my resume** with all recent accomplishments
- **Built a portfolio** showcasing my best projects
- **Practiced coding challenges** on platforms like LeetCode
- **Networked** with former colleagues and industry contacts

## The Search Process

The job search took about 4 months in total. Here's what I learned:

### Applications vs. Responses

- **Applied to**: 150+ positions
- **Got responses**: ~20 companies
- **Phone screens**: 15 companies
- **Technical interviews**: 8 companies
- **Final rounds**: 3 companies
- **Offers**: 2 companies

### What Worked

1. **Customizing applications** for each role
2. **Following up** with hiring managers on LinkedIn
3. **Leveraging my network** for referrals
4. **Practicing system design** questions

### What Didn't Work

1. Applying through job boards without customization
2. Not following up after interviews
3. Underestimating the importance of behavioral questions

## The Happy Ending

I'm now working at an amazing company that values work-life balance, provides opportunities for growth, and has a fantastic team culture. The salary increase was 40%, and I genuinely look forward to Monday mornings.

## Key Takeaways

- **Don't settle** for a job that makes you miserable
- **Invest time** in proper preparation
- **Network authentically** - people want to help
- **Stay persistent** but know when to move on from opportunities
- **Trust the process** - the right opportunity will come

Remember, job searching is a marathon, not a sprint. Take care of yourself throughout the process!`,
    author: 'Demo User',
    authorAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-20',
    likes: 24,
    coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublic: true,
    comments: [
      {
        id: '1',
        author: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?w=50&h=50&fit=crop&crop=face',
        content: 'Thank you for sharing this! I\'m in a similar situation and this gives me hope.',
        createdAt: '2024-01-21',
        likes: 3,
        replies: [
          {
            id: '1-1',
            author: 'Demo User',
            avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=50&h=50&fit=crop&crop=face',
            content: 'You\'ve got this! Feel free to reach out if you need any advice.',
            createdAt: '2024-01-21',
            likes: 1,
            replies: []
          }
        ]
      },
      {
        id: '2',
        author: 'Mike Chen',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=50&h=50&fit=crop&crop=face',
        content: 'Great insights! The networking tip is so underrated.',
        createdAt: '2024-01-22',
        likes: 2,
        replies: []
      }
    ]
  },
  {
    id: '2',
    slug: 'technical-interview-tips',
    title: '10 Technical Interview Tips That Actually Work',
    content: `# 10 Technical Interview Tips That Actually Work

After going through numerous technical interviews, I've learned what really matters. Here are the tips that made the biggest difference in my success rate.

## 1. Think Out Loud

Interviewers want to see your thought process. Even if you're stuck, explain what you're thinking. This shows problem-solving skills and helps the interviewer guide you if needed.

## 2. Ask Clarifying Questions

Before jumping into coding, make sure you understand the problem completely. Ask about:
- Input constraints
- Expected output format  
- Edge cases
- Performance requirements

## 3. Start with a Brute Force Solution

It's better to have a working solution than a perfect one that doesn't work. Start simple, then optimize.

## 4. Test Your Code

Walk through your solution with the given examples. Catch bugs early and show attention to detail.

## 5. Know Your Time Complexities

Be able to analyze and explain the time and space complexity of your solutions. This is crucial for senior positions.

## More tips coming soon...`,
    author: 'Demo User',
    authorAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-18',
    likes: 18,
    coverImage: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublic: true,
    comments: []
  },
  {
    id: '3',
    slug: 'remote-work-setup',
    title: 'Building the Perfect Remote Work Setup',
    content: `# Building the Perfect Remote Work Setup

Working from home requires the right environment and tools. Here's how I built my ideal remote work setup.

## The Essentials

- **Ergonomic chair**: Invested in a Herman Miller - worth every penny
- **Standing desk**: Helps with posture and energy levels
- **Good lighting**: Ring light + natural light from windows
- **Noise-canceling headphones**: Essential for video calls

## My Current Setup

I'll add photos and more details soon!`,
    author: 'Demo User',
    authorAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-15',
    likes: 12,
    coverImage: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublic: false,
    comments: []
  }
];

let blogPosts = [...mockBlogPosts];

export async function getBlogPosts(publicOnly: boolean = false): Promise<ApiResponse<BlogPost[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredPosts = publicOnly 
        ? blogPosts.filter(post => post.isPublic)
        : blogPosts;
      
      resolve({
        data: filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      });
    }, 200);
  });
}

export async function getBlogPost(slug: string): Promise<ApiResponse<BlogPost>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = blogPosts.find(post => post.slug === slug);
      if (post) {
        resolve({ data: post });
      } else {
        reject(new Error('Blog post not found'));
      }
    }, 150);
  });
}

export async function createBlogPost(data: CreateBlogPostData): Promise<ApiResponse<BlogPost>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const newPost: BlogPost = {
        id: (blogPosts.length + 1).toString(),
        slug: slug + '-' + Date.now(),
        title: data.title,
        content: data.content,
        author: 'Demo User',
        authorAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date().toISOString().split('T')[0],
        likes: 0,
        coverImage: data.coverImage || 'https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=800',
        isPublic: data.isPublic,
        comments: []
      };
      
      blogPosts.push(newPost);
      resolve({ data: newPost });
    }, 800);
  });
}

export async function likeBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = blogPosts.findIndex(post => post.id === id);
      if (postIndex === -1) {
        reject(new Error('Blog post not found'));
        return;
      }

      blogPosts[postIndex].likes += 1;
      resolve({ data: blogPosts[postIndex] });
    }, 200);
  });
}

export async function addCommentToBlogPost(postId: string, content: string): Promise<ApiResponse<Comment>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = blogPosts.findIndex(post => post.id === postId);
      if (postIndex === -1) {
        reject(new Error('Blog post not found'));
        return;
      }

      const newComment: Comment = {
        id: Date.now().toString(),
        author: 'Demo User',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=50&h=50&fit=crop&crop=face',
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      };
      
      blogPosts[postIndex].comments.push(newComment);
      resolve({ data: newComment });
    }, 300);
  });
}