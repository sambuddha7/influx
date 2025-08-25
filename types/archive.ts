export interface RedditPostData {
  id?: string;
  subreddit?: string;
  title?: string;
  selftext?: string;
  score?: number;
  num_comments?: number;
  permalink?: string;
  post_title?: string;
  comment_text?: string;
  upvotes?: number;
  comments?: number;
  created_utc?: number | string;
  date?: string;
  replies?: number | RedditPostData[];
  reply_count?: number;
  last_updated?: string;
}

export interface ArchivedPost {
  id: string;
  subreddit: string;
  title: string;
  content: string;
  suggestedReply: string;
  url: string;
  date_created: string;
  date_archived: string;
  roiData?: RedditPostData;
}

export interface GeneratedPost {
  id?: string;
  post_type: string;
  subreddit: string;
  title: string;
  body: string;
  content?: string;
  target_audience?: string;
  company_name?: string;
  status?: string;
  created_at?: string;
  saved_at?: string;
  roiData?: RedditPostData;
}

export interface ChartDataPoint {
  date: string;
  karma: number;
  comments: number;
}

export interface ProcessedChartData {
  date: Date | null;
  karma: number;
  comments: number;
}

export interface PostChartDataPoint {
  date: string;
  upvotes: number;
  comments: number;
}

export interface ProcessedPostChartData {
  date: Date | null;
  upvotes: number;
  comments: number;
}

export interface PostsMetrics {
  total_posts: number;
  total_upvotes: number;
  total_comments: number;
  avg_upvotes_per_post: number;
  avg_comments_per_post: number;
  engagement_rate: number;
  top_performing_subreddits: { [key: string]: number };
}

export interface ROIMetrics {
  total_comments: number;
  total_karma: number;
  avg_score_per_comment: number;
  total_replies_generated: number;
  engagement_rate: number;
  top_performing_subreddits: { [key: string]: number };
}