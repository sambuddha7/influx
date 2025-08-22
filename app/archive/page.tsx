'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, deleteDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";
import { ArrowUpRight, Copy, FileText, MessageSquare, BarChart3, TrendingUp, Eye, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import * as d3 from 'd3';

interface RedditPostData {
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

interface ArchivedPost {
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

interface GeneratedPost {
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

interface ChartDataPoint {
  date: string;
  karma: number;
  comments: number;
}

interface ProcessedChartData {
  date: Date | null;
  karma: number;
  comments: number;
}

const D3CommentsChart = ({ data }: { data: ChartDataPoint[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const processedData = data.map((d: ChartDataPoint): ProcessedChartData => ({
      ...d,
      date: parseDate(d.date)
    })).filter((d: ProcessedChartData): d is ProcessedChartData & { date: Date } => d.date !== null);

    if (processedData.length === 0) return;

    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, (d: ProcessedChartData & { date: Date }) => d.date) as [Date, Date])
      .range([0, width]);

    const yScaleKarma = d3.scaleLinear()
      .domain([0, d3.max(processedData, (d: ProcessedChartData & { date: Date }) => d.karma) || 0])
      .range([height, 0]);

    const yScaleComments = d3.scaleLinear()
      .domain([0, d3.max(processedData, (d: ProcessedChartData & { date: Date }) => d.comments) || 0])
      .range([height, 0]);

    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(() => ""))
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScaleKarma).tickSize(-width).tickFormat(() => ""))
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(() => "").tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", "12px")
      .attr("dy", "1.5em");

    g.append("g")
      .call(d3.axisLeft(yScaleKarma).tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", "12px")
      .attr("dx", "-0.5em");

    // Create lines
    const karmaLine = d3.line<ProcessedChartData & { date: Date }>()
      .x((d: ProcessedChartData & { date: Date }) => xScale(d.date))
      .y((d: ProcessedChartData & { date: Date }) => yScaleKarma(d.karma))
      .curve(d3.curveMonotoneX);

    const commentsLine = d3.line<ProcessedChartData & { date: Date }>()
      .x((d: ProcessedChartData & { date: Date }) => xScale(d.date))
      .y((d: ProcessedChartData & { date: Date }) => yScaleComments(d.comments))
      .curve(d3.curveMonotoneX);

    // Add karma area with gradient
    const karmaGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "karma-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    karmaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 0.1);

    karmaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 0.6);

    const karmaArea = d3.area<ProcessedChartData & { date: Date }>()
      .x((d: ProcessedChartData & { date: Date }) => xScale(d.date))
      .y0(height)
      .y1((d: ProcessedChartData & { date: Date }) => yScaleKarma(d.karma))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(processedData)
      .attr("fill", "url(#karma-gradient)")
      .attr("d", karmaArea);

    // Add lines
    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3)
      .attr("d", karmaLine);

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3)
      .attr("d", commentsLine);

    // Add tooltip
    const tooltip = d3.select("body")
      .selectAll(".d3-tooltip-comments")
      .data([null])
      .join("div")
      .attr("class", "d3-tooltip-comments")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#1F2937")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("border", "1px solid #374151")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Add interactive dots
    g.selectAll(".karma-dot")
      .data(processedData)
      .join("circle")
      .attr("class", "karma-dot")
      .attr("cx", (d: ProcessedChartData & { date: Date }) => xScale(d.date))
      .attr("cy", (d: ProcessedChartData & { date: Date }) => yScaleKarma(d.karma))
      .attr("r", 4)
      .attr("fill", "#F59E0B")
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(this: SVGCircleElement | d3.BaseType, event: MouseEvent, d: ProcessedChartData & { date: Date }) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d3.timeFormat("%m/%d/%Y")(d.date)}<br/>Karma: ${d.karma}<br/>Comments: ${d.comments}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        d3.select(this as SVGCircleElement).attr("r", 6);
      })
      .on("mouseout", function(this: SVGCircleElement | d3.BaseType) {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(this as SVGCircleElement).attr("r", 4);
      });

    g.selectAll(".comments-dot")
      .data(processedData)
      .join("circle")
      .attr("class", "comments-dot")
      .attr("cx", (d: ProcessedChartData & { date: Date }) => xScale(d.date))
      .attr("cy", (d: ProcessedChartData & { date: Date }) => yScaleComments(d.comments))
      .attr("r", 4)
      .attr("fill", "#3B82F6")
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(this: SVGCircleElement | d3.BaseType, event: MouseEvent, d: ProcessedChartData & { date: Date }) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d3.timeFormat("%m/%d/%Y")(d.date)}<br/>Karma: ${d.karma}<br/>Comments: ${d.comments}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        d3.select(this as SVGCircleElement).attr("r", 6);
      })
      .on("mouseout", function(this: SVGCircleElement | d3.BaseType) {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(this as SVGCircleElement).attr("r", 4);
      });

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 150}, 20)`);

    legend.append("line")
      .attr("x1", 0).attr("x2", 20).attr("y1", 0).attr("y2", 0)
      .attr("stroke", "#F59E0B").attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 25).attr("y", 0).attr("dy", "0.35em")
      .style("fill", "#9CA3AF").style("font-size", "12px")
      .text("Karma");

    legend.append("line")
      .attr("x1", 0).attr("x2", 20).attr("y1", 20).attr("y2", 20)
      .attr("stroke", "#3B82F6").attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 25).attr("y", 20).attr("dy", "0.35em")
      .style("fill", "#9CA3AF").style("font-size", "12px")
      .text("Comments");

    // Cleanup
    return () => {
      d3.selectAll(".d3-tooltip-comments").remove();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

interface PostChartDataPoint {
  date: string;
  upvotes: number;
  comments: number;
}

interface ProcessedPostChartData {
  date: Date | null;
  upvotes: number;
  comments: number;
}

interface PostsMetrics {
  total_posts: number;
  total_upvotes: number;
  total_comments: number;
  avg_upvotes_per_post: number;
  avg_comments_per_post: number;
  engagement_rate: number;
  top_performing_subreddits: { [key: string]: number };
}

// D3 Posts Chart Component
const D3PostsChart = ({ data }: { data: PostChartDataPoint[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 550 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const processedData = data.map((d: PostChartDataPoint): ProcessedPostChartData => ({
      ...d,
      date: parseDate(d.date)
    })).filter((d: ProcessedPostChartData): d is ProcessedPostChartData & { date: Date } => d.date !== null);

    if (processedData.length === 0) return;

    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, (d: ProcessedPostChartData & { date: Date }) => d.date) as [Date, Date])
      .range([0, width]);

    const yScaleUpvotes = d3.scaleLinear()
      .domain([0, d3.max(processedData, (d: ProcessedPostChartData & { date: Date }) => d.upvotes) || 0])
      .range([height, 0]);

    const yScaleComments = d3.scaleLinear()
      .domain([0, d3.max(processedData, (d: ProcessedPostChartData & { date: Date }) => d.comments) || 0])
      .range([height, 0]);

    // Add grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(() => ""))
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScaleUpvotes).tickSize(-width).tickFormat(() => ""))
      .style("stroke", "#374151")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d: d3.NumberValue | Date) => d3.timeFormat("%m/%d")(d as Date)).tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", "12px")
      .attr("dy", "2.5em");

    g.append("g")
      .call(d3.axisLeft(yScaleUpvotes).tickSize(0))
      .selectAll("text")
      .style("fill", "#9CA3AF")
      .style("font-size", "12px")
      .attr("dx", "-0.5em");

    // Create lines
    const upvotesLine = d3.line<ProcessedPostChartData & { date: Date }>()
      .x((d: ProcessedPostChartData & { date: Date }) => xScale(d.date))
      .y((d: ProcessedPostChartData & { date: Date }) => yScaleUpvotes(d.upvotes))
      .curve(d3.curveMonotoneX);

    const commentsLine = d3.line<ProcessedPostChartData & { date: Date }>()
      .x((d: ProcessedPostChartData & { date: Date }) => xScale(d.date))
      .y((d: ProcessedPostChartData & { date: Date }) => yScaleComments(d.comments))
      .curve(d3.curveMonotoneX);

    // Add upvotes area with gradient
    const upvotesGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "upvotes-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    upvotesGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10B981")
      .attr("stop-opacity", 0.1);

    upvotesGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10B981")
      .attr("stop-opacity", 0.6);

    const upvotesArea = d3.area<ProcessedPostChartData & { date: Date }>()
      .x((d: ProcessedPostChartData & { date: Date }) => xScale(d.date))
      .y0(height)
      .y1((d: ProcessedPostChartData & { date: Date }) => yScaleUpvotes(d.upvotes))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(processedData)
      .attr("fill", "url(#upvotes-gradient)")
      .attr("d", upvotesArea);

    // Add lines
    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 3)
      .attr("d", upvotesLine);

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3)
      .attr("d", commentsLine);

    // Add tooltip
    const tooltip = d3.select("body")
      .selectAll(".d3-tooltip-posts")
      .data([null])
      .join("div")
      .attr("class", "d3-tooltip-posts")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#1F2937")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("border", "1px solid #374151")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Add interactive dots
    g.selectAll(".upvotes-dot")
      .data(processedData)
      .join("circle")
      .attr("class", "upvotes-dot")
      .attr("cx", (d: ProcessedPostChartData & { date: Date }) => xScale(d.date))
      .attr("cy", (d: ProcessedPostChartData & { date: Date }) => yScaleUpvotes(d.upvotes))
      .attr("r", 4)
      .attr("fill", "#F59E0B")
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(this: SVGCircleElement | d3.BaseType, event: MouseEvent, d: ProcessedPostChartData & { date: Date }) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d3.timeFormat("%m/%d/%Y")(d.date)}<br/>Upvotes: ${d.upvotes}<br/>Comments: ${d.comments}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        d3.select(this as SVGCircleElement).attr("r", 6);
      })
      .on("mouseout", function(this: SVGCircleElement | d3.BaseType) {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(this as SVGCircleElement).attr("r", 4);
      });

    g.selectAll(".comments-dot")
      .data(processedData)
      .join("circle")
      .attr("class", "comments-dot")
      .attr("cx", (d: ProcessedPostChartData & { date: Date }) => xScale(d.date))
      .attr("cy", (d: ProcessedPostChartData & { date: Date }) => yScaleComments(d.comments))
      .attr("r", 4)
      .attr("fill", "#3B82F6")
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(this: SVGCircleElement | d3.BaseType, event: MouseEvent, d: ProcessedPostChartData & { date: Date }) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d3.timeFormat("%m/%d/%Y")(d.date)}<br/>Upvotes: ${d.upvotes}<br/>Comments: ${d.comments}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
        d3.select(this as SVGCircleElement).attr("r", 6);
      })
      .on("mouseout", function(this: SVGCircleElement | d3.BaseType) {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(this as SVGCircleElement).attr("r", 4);
      });

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 150}, 20)`);

    legend.append("line")
      .attr("x1", 0).attr("x2", 20).attr("y1", 0).attr("y2", 0)
      .attr("stroke", "#F59E0B").attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 25).attr("y", 0).attr("dy", "0.35em")
      .style("fill", "#9CA3AF").style("font-size", "12px")
      .text("Upvotes");

    legend.append("line")
      .attr("x1", 0).attr("x2", 20).attr("y1", 20).attr("y2", 20)
      .attr("stroke", "#3B82F6").attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 25).attr("y", 20).attr("dy", "0.35em")
      .style("fill", "#9CA3AF").style("font-size", "12px")
      .text("Comments");

    // Cleanup
    return () => {
      d3.selectAll(".d3-tooltip-posts").remove();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default function ArchivePage() {
  const router = useRouter();
  const [archivedPosts, setArchivedPosts] = useState<ArchivedPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<ArchivedPost[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [displayedGeneratedPosts, setDisplayedGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreGeneratedPosts, setHasMoreGeneratedPosts] = useState(true);
  const [user, loading] = useAuthState(auth);
  const [isLoading2, setIsLoading2] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'posts'>('comments');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // ROI-related states
  const [redditUsername, setRedditUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [hasUsername, setHasUsername] = useState(false);
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(false);
  const [roiComments, setRoiComments] = useState<Array<{id: string; score: number; replies: number; created_utc: string; subreddit: string; permalink: string; post_title: string; comment_text: string; last_updated?: string}>>([]);
  const [roiMetrics, setRoiMetrics] = useState<{total_comments: number; total_karma: number; avg_score_per_comment: number; total_replies_generated: number; engagement_rate: number; top_performing_subreddits: {[key: string]: number}} | null>(null);
  const [isUpdatingRoi, setIsUpdatingRoi] = useState(false);
  const [lastRoiUpdate, setLastRoiUpdate] = useState<string>('');
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  // Posts Analytics states
  const [isPostsAnalyticsMode, setIsPostsAnalyticsMode] = useState(false);
  const [postsMetrics, setPostsMetrics] = useState<PostsMetrics | null>(null);
  const [userRedditPosts, setUserRedditPosts] = useState<RedditPostData[]>([]);
  const [isLoadingPostsAnalytics, setIsLoadingPostsAnalytics] = useState(false);
  // Matched content states
  const [matchedComments, setMatchedComments] = useState<ArchivedPost[]>([]);
  const [matchedPosts, setMatchedPosts] = useState<GeneratedPost[]>([]);

  const [displayedMatchedComments, setDisplayedMatchedComments] = useState<ArchivedPost[]>([]);
  const [displayedMatchedPosts, setDisplayedMatchedPosts] = useState<GeneratedPost[]>([]);
  const [hasMoreMatchedComments, setHasMoreMatchedComments] = useState(false);
  const [hasMoreMatchedPosts, setHasMoreMatchedPosts] = useState(false);
  const [isLoadingMoreAnalytics, setIsLoadingMoreAnalytics] = useState(false);
  const ANALYTICS_ITEMS_PER_PAGE = 5;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const POSTS_PER_PAGE = 6;


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'posts') {
      setActiveTab('posts');
    }
  }, []);

  // Reactive analytics loading - triggers when archive data becomes available
useEffect(() => {
  if (!hasUsername || !redditUsername) return;
  
  // For comments: load analytics when archived posts become available
  if (activeTab === 'comments' && isAnalyticsMode && archivedPosts.length > 0 && roiComments.length === 0) {
    loadROIData(redditUsername);
  }
  
  // For posts: load analytics when generated posts become available  
  if (activeTab === 'posts' && isPostsAnalyticsMode && generatedPosts.length > 0 && userRedditPosts.length === 0) {
    loadPostsAnalytics(redditUsername);
  }
}, [hasUsername, redditUsername, activeTab, isAnalyticsMode, isPostsAnalyticsMode, archivedPosts.length, generatedPosts.length, roiComments.length, userRedditPosts.length]);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.push('/onboarding');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking user in Firestore:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      checkUser();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch archived comments
  useEffect(() => {
    if (!user || activeTab !== 'comments') return;
    
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, "archived-posts", user.uid, "posts");
        const postsQuery = query(postsCollectionRef, orderBy("archivedAt", "asc"));
        const postsSnapshot = await getDocs(postsQuery);

        if (!postsSnapshot.empty) {
          console.log('Posts found in Firestore');
          const firestorePosts = postsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.data().id,
            subreddit: doc.data().subreddit,
            title: doc.data().title,
            content: doc.data().content,
            suggestedReply: doc.data().suggestedReply,
            url: doc.data().url,
            date_created: doc.data().date_created,
            date_archived: doc.data().date_archived || new Date(),
          }));
          setArchivedPosts(firestorePosts);
          setDisplayedPosts(firestorePosts.slice(0, POSTS_PER_PAGE));
          setIsLoading2(false);
          setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
          
          // Match with existing profile data if available
          if (roiComments.length > 0) {
            const matched = matchArchivedWithProfile(firestorePosts, roiComments);
            setMatchedComments(matched);
            setDisplayedMatchedComments(matched.slice(0, ANALYTICS_ITEMS_PER_PAGE));
            setHasMoreMatchedComments(matched.length > ANALYTICS_ITEMS_PER_PAGE);
            
            // Only recalculate metrics with matched data if in analytics mode
            if (isAnalyticsMode) {
              const matchedRoiComments = roiComments.filter(comment => 
                matched.some(archivedItem => {
                  // Match by URL if available
                  if (archivedItem.url && comment.permalink) {
                    const archivedPostId = archivedItem.url.split('/')[6]?.split('?')[0];
                    const profilePostId = comment.permalink.split('/')[4];
                    return archivedPostId === profilePostId;
                  }
                  
                  // Fallback matching
                  return (
                    archivedItem.title.toLowerCase().includes(comment.post_title?.toLowerCase() || '') ||
                    comment.post_title?.toLowerCase().includes(archivedItem.title.toLowerCase() || '') ||
                    (archivedItem.subreddit === comment.subreddit && 
                     comment.comment_text?.toLowerCase().includes(archivedItem.suggestedReply.toLowerCase().substring(0, 50) || ''))
                  );
                })
              );
              
              calculateROIMetrics(matchedRoiComments);
            }
          }
        } else {
          console.log('No archived posts found');
          setArchivedPosts([]);
          setDisplayedPosts([]);
          setHasMorePosts(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsLoading2(false);
      }
    };

    if (user && activeTab === 'comments') {
      fetchPosts();
    }
  }, [user, activeTab]);

  // Fetch generated posts
  useEffect(() => {
    if (!user || activeTab !== 'posts') return;

    const fetchGeneratedPosts = async () => {
      setIsLoading2(true);
      try {
        const response = await fetch(`${apiUrl}/reddit-posts/post-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user.uid,
            limit: 50
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data.posts;
          console.log('All posts received:', posts);
          setGeneratedPosts(posts);
          setDisplayedGeneratedPosts(posts.slice(0, POSTS_PER_PAGE));
          setHasMoreGeneratedPosts(posts.length > POSTS_PER_PAGE);
        }
      } catch (err) {
        console.error('Failed to fetch generated posts:', err);
        setGeneratedPosts([]);
        setDisplayedGeneratedPosts([]);
        setHasMoreGeneratedPosts(false);
      } finally {
        setIsLoading2(false);
      }
    };

    if (user && activeTab === 'posts') {
      fetchGeneratedPosts();
    }
  }, [user, activeTab]);

  // ROI-related functions
  // Function to match archived content with Reddit profile content
  const matchArchivedWithProfile = useCallback((archivedData: ArchivedPost[], profileData: RedditPostData[]) => {
    const matched: (ArchivedPost & { roiData?: RedditPostData })[] = [];
    
    archivedData.forEach(archivedItem => {
      // For comments: match by URL or title + subreddit combination
      const foundProfile = profileData.find(profileItem => {
        // Try to match by URL if available
        if (archivedItem.url && profileItem.permalink) {
          const archivedPostId = archivedItem.url.split('/')[6]?.split('?')[0];
          const profilePostId = profileItem.permalink.split('/')[4];
          return archivedPostId === profilePostId;
        }
        
        // Fallback: match by title and subreddit
        return (
          archivedItem.title.toLowerCase().includes(profileItem.post_title?.toLowerCase() || '') ||
          profileItem.post_title?.toLowerCase().includes(archivedItem.title.toLowerCase() || '') ||
          (archivedItem.subreddit === profileItem.subreddit && 
           profileItem.comment_text?.toLowerCase().includes(archivedItem.suggestedReply.toLowerCase().substring(0, 50) || ''))
        );
      });
      
      if (foundProfile) {
        matched.push({
          ...archivedItem,
          roiData: foundProfile // Attach the ROI data for scoring
        });
      }
    });
    
    return matched;
  }, []);

  // Function to match generated posts with Reddit profile posts
  const matchGeneratedWithProfile = useCallback((generatedData: GeneratedPost[], profileData: RedditPostData[]) => {
    const matched: (GeneratedPost & { roiData?: RedditPostData })[] = [];
    
    generatedData.forEach(generatedItem => {
      const foundProfile = profileData.find(profileItem => {
        // Match by title similarity and subreddit
        return (
          generatedItem.subreddit === profileItem.subreddit &&
          (generatedItem.title.toLowerCase().includes(profileItem.title?.toLowerCase() || '') ||
           profileItem.title?.toLowerCase().includes(generatedItem.title.toLowerCase() || '') ||
           (generatedItem.body || generatedItem.content || '').toLowerCase().includes(profileItem.selftext?.toLowerCase().substring(0, 100) || ''))
        );
      });
      
      if (foundProfile) {
        matched.push({
          ...generatedItem,
          roiData: foundProfile // Attach the ROI data for scoring
        });
      }
    });
    
    return matched;
  }, []);

  const loadMoreMatchedComments = () => {
    setIsLoadingMoreAnalytics(true);
    const currentLength = displayedMatchedComments.length;
    const nextComments = matchedComments.slice(
      currentLength,
      currentLength + ANALYTICS_ITEMS_PER_PAGE
    );
    
    setDisplayedMatchedComments(prev => [...prev, ...nextComments]);
    setHasMoreMatchedComments(currentLength + ANALYTICS_ITEMS_PER_PAGE < matchedComments.length);
    setIsLoadingMoreAnalytics(false);
  };
  
  const loadMoreMatchedPosts = () => {
    setIsLoadingMoreAnalytics(true);
    const currentLength = displayedMatchedPosts.length;
    const nextPosts = matchedPosts.slice(
      currentLength,
      currentLength + ANALYTICS_ITEMS_PER_PAGE
    );
    
    setDisplayedMatchedPosts(prev => [...prev, ...nextPosts]);
    setHasMoreMatchedPosts(currentLength + ANALYTICS_ITEMS_PER_PAGE < matchedPosts.length);
    setIsLoadingMoreAnalytics(false);
  };

  const calculateROIMetrics = useCallback((commentsData: Array<{score: number; replies: number; subreddit: string}>) => {
    if (commentsData.length === 0) {
      setRoiMetrics(null);
      return;
    }

    const totalComments = commentsData.length;
    const totalKarma = commentsData.reduce((sum, comment) => sum + comment.score, 0);
    const totalReplies = commentsData.reduce((sum, comment) => sum + comment.replies, 0);
    const avgScore = totalKarma / totalComments;
    const engagementRate = (totalKarma + totalReplies) / totalComments;

    const subredditPerformance: { [key: string]: number } = {};
    commentsData.forEach(comment => {
      if (!subredditPerformance[comment.subreddit]) {
        subredditPerformance[comment.subreddit] = 0;
      }
      subredditPerformance[comment.subreddit] += comment.score + comment.replies;
    });

    setRoiMetrics({
      total_comments: totalComments,
      total_karma: totalKarma,
      avg_score_per_comment: Math.round(avgScore * 100) / 100,
      total_replies_generated: totalReplies,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      top_performing_subreddits: subredditPerformance
    });
  }, []);

  const loadROIData = useCallback(async (username: string) => {
    if (!user) return;
    try {
      const commentsRef = collection(db, 'reddit-comments', user.uid, 'comments');
      const commentsQuery = query(commentsRef, orderBy('created_utc', 'desc'));
      const commentsSnap = await getDocs(commentsQuery);
      
      if (!commentsSnap.empty) {
        const commentsData = commentsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            score: data.score || 0,
            replies: data.replies || 0,
            subreddit: data.subreddit || '',
            created_utc: data.created_utc || '',
            permalink: data.permalink || '',
            post_title: data.post_title || '',
            comment_text: data.comment_text || '',
            last_updated: data.last_updated
          };
        });
        
        setRoiComments(commentsData);
        
        // Always match if we have archived posts, regardless of order
        // ONLY calculate metrics if we have archived posts to match against
      if (archivedPosts.length > 0) {
        const matched = matchArchivedWithProfile(archivedPosts, commentsData);
        setMatchedComments(matched);
        setDisplayedMatchedComments(matched.slice(0, ANALYTICS_ITEMS_PER_PAGE));
        setHasMoreMatchedComments(matched.length > ANALYTICS_ITEMS_PER_PAGE);

        
        // Get the ROI comments that match the archived comments
        const matchedRoiComments = commentsData.filter(comment => 
          matched.some(archivedItem => {
            if (archivedItem.url && comment.permalink) {
              const archivedPostId = archivedItem.url.split('/')[6]?.split('?')[0];
              const profilePostId = comment.permalink.split('/')[4];
              return archivedPostId === profilePostId;
            }
            
            return (
              archivedItem.title.toLowerCase().includes(comment.post_title?.toLowerCase() || '') ||
              comment.post_title?.toLowerCase().includes(archivedItem.title.toLowerCase() || '') ||
              (archivedItem.subreddit === comment.subreddit && 
              comment.comment_text?.toLowerCase().includes(archivedItem.suggestedReply.toLowerCase().substring(0, 50) || ''))
            );
          })
        );
        
        // ALWAYS calculate metrics only from matched data in analytics mode
        if (isAnalyticsMode) {
          calculateROIMetrics(matchedRoiComments);
        }
      }
// Remove the else clause - don't calculate metrics without archived data
        
        const lastDoc = commentsSnap.docs[0];
        setLastRoiUpdate(lastDoc.data().last_updated || '');
      }
    } catch (error) {
      console.error('Error loading ROI data:', error);
    }
  }, [user, calculateROIMetrics]);

  // Check for Reddit username
// Check for Reddit username
useEffect(() => {
  if (!user) return;
  
  const checkRedditUsername = async () => {
    try {
      const usernameRef = doc(db, 'reddit-username', user.uid);
      const usernameSnap = await getDoc(usernameRef);
      
      if (usernameSnap.exists()) {
        const username = usernameSnap.data().username;
        setRedditUsername(username);
        setHasUsername(true);
        
        // Load saved view preferences
        const savedCommentsView = localStorage.getItem('archive-comments-view-preference');
        const savedPostsView = localStorage.getItem('archive-posts-view-preference');
        
        // 🔄 CHANGED: Default to 'archive' instead of 'analytics'
        if (savedCommentsView === 'analytics') {
          setIsAnalyticsMode(true);
        } else {
          setIsAnalyticsMode(false); // Default to archive view
        }
        
        if (savedPostsView === 'analytics') {
          setIsPostsAnalyticsMode(true);
        } else {
          setIsPostsAnalyticsMode(false); // Default to archive view for posts too
        } 
      }
        else {
          // No username found, default to archive mode
          setIsAnalyticsMode(false);
          setIsPostsAnalyticsMode(false);
        }
    } catch (error) {
      console.error('Error checking Reddit username:', error);
      setIsAnalyticsMode(false);
      setIsPostsAnalyticsMode(false);
    }
  };
  
  checkRedditUsername();
}, [user, activeTab]);
  const loadMorePosts = () => {
    setIsLoadingMore(true);
    const currentLength = displayedPosts.length;
    const nextPosts = archivedPosts.slice(
      currentLength,
      currentLength + POSTS_PER_PAGE
    );
    
    setDisplayedPosts(prev => [...prev, ...nextPosts]);
    setHasMorePosts(currentLength + POSTS_PER_PAGE < archivedPosts.length);
    setIsLoadingMore(false);
  };

  const loadMoreGeneratedPosts = () => {
    setIsLoadingMore(true);
    const currentLength = displayedGeneratedPosts.length;
    const nextPosts = generatedPosts.slice(
      currentLength,
      currentLength + POSTS_PER_PAGE
    );
    
    setDisplayedGeneratedPosts(prev => [...prev, ...nextPosts]);
    setHasMoreGeneratedPosts(currentLength + POSTS_PER_PAGE < generatedPosts.length);
    setIsLoadingMore(false);
  };


  const handleSetupUsername = async () => {
    if (!inputUsername.trim() || !user) return;

    setIsSetupLoading(true);
    try {
      await setDoc(doc(db, 'reddit-username', user.uid), {
        username: inputUsername.trim(),
        created_at: new Date().toISOString(),
        user_id: user.uid
      });

      setRedditUsername(inputUsername.trim());
      setHasUsername(true);
      setInputUsername('');
      setIsAnalyticsMode(true);
      
      await handleUpdateROI();
    } catch (error) {
      console.error('Error setting up Reddit username:', error);
    } finally {
      setIsSetupLoading(false);
    }
  };

  const handleUpdateROI = async () => {
    if (!user || !redditUsername) return;

    setIsUpdatingRoi(true);
    try {
      const response = await fetch(`${apiUrl}/update-reddit-roi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: redditUsername,
          user_id: user.uid
        }),
      });

      if (response.ok) {
        await loadROIData(redditUsername);
      }
    } catch (error) {
      console.error('Error updating ROI data:', error);
    } finally {
      setIsUpdatingRoi(false);
    }
  };

  // Add this function to load archived comments specifically for analytics
const loadArchivedCommentsForAnalytics = async () => {
  if (!user) return;
  try {
    const postsCollectionRef = collection(db, "archived-posts", user.uid, "posts");
    const postsQuery = query(postsCollectionRef, orderBy("archivedAt", "asc"));
    const postsSnapshot = await getDocs(postsQuery);

    if (!postsSnapshot.empty) {
      const firestorePosts = postsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.data().id,
        subreddit: doc.data().subreddit,
        title: doc.data().title,
        content: doc.data().content,
        suggestedReply: doc.data().suggestedReply,
        url: doc.data().url,
        date_created: doc.data().date_created,
        date_archived: doc.data().date_archived || new Date(),
      }));
      setArchivedPosts(firestorePosts);
    }
  } catch (error) {
    console.error('Error loading archived comments for analytics:', error);
  }
};

// Add this function to load generated posts specifically for analytics
const loadGeneratedPostsForAnalytics = async () => {
  if (!user) return;
  try {
    const response = await fetch(`${apiUrl}/reddit-posts/post-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: user.uid,
        limit: 50
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const posts = data.data.posts;
      setGeneratedPosts(posts);
    }
  } catch (err) {
    console.error('Failed to load generated posts for analytics:', err);
  }
};

  const toggleView = (viewMode: 'analytics' | 'archive') => {
    setIsAnalyticsMode(viewMode === 'analytics');
    localStorage.setItem('archive-view-preference', viewMode);
    
    if (viewMode === 'analytics' && hasUsername) {
      loadROIData(redditUsername);
    }
  };

  const getROIChartData = () => {
    if (!roiComments.length) return [];
  
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
    const last30Days = roiComments
      .filter(comment => {
        if (!comment.created_utc) return false;
        
        try {
          let commentDate: Date;
          if (comment.created_utc.includes('T') || comment.created_utc.includes('Z')) {
            commentDate = new Date(comment.created_utc);
          } else {
            commentDate = new Date(comment.created_utc + 'Z');
          }
          
          return !isNaN(commentDate.getTime()) && commentDate >= thirtyDaysAgo;
        } catch (error) {
          return false;
        }
      })
      // CHANGED: Sort by date in DESCENDING order (newest first)
      .sort((a, b) => {
        const dateA = new Date(a.created_utc.includes('Z') ? a.created_utc : a.created_utc + 'Z');
        const dateB = new Date(b.created_utc.includes('Z') ? b.created_utc : b.created_utc + 'Z');
        return dateB.getTime() - dateA.getTime(); // CHANGED: dateB - dateA for descending order
      });
  
    const groupedByDate: { [key: string]: { karma: number; comments: number } } = {};
    
    last30Days.forEach(comment => {
      try {
        let commentDate: Date;
        if (comment.created_utc.includes('T') || comment.created_utc.includes('Z')) {
          commentDate = new Date(comment.created_utc);
        } else {
          commentDate = new Date(comment.created_utc + 'Z');
        }
        
        const date = commentDate.toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = { karma: 0, comments: 0 };
        }
        groupedByDate[date].karma += comment.score || 0;
        groupedByDate[date].comments += 1;
      } catch (error) {
        console.log('Error processing comment for chart:', comment.id, error);
      }
    });
  
    // CHANGED: Sort the final data by date in ASCENDING order (oldest to newest for chart display)
    return Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // This ensures oldest to newest on x-axis
      .map(([date, data]) => ({
        date,
        karma: data.karma,
        comments: data.comments,
        engagement: data.karma + data.comments
      }));
  };


  // Posts Analytics Functions
  const loadPostsAnalytics = async (username: string) => {
    console.log('Loading posts analytics for:', username);
    setIsLoadingPostsAnalytics(true);
    try {
      // First fetch/update posts data from Reddit
      console.log('Fetching Reddit posts...');
      const fetchResponse = await fetch(`${apiUrl}/fetch-reddit-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          user_id: user!.uid 
        })
      });
  
      if (!fetchResponse.ok) {
        console.error('Failed to fetch Reddit posts:', await fetchResponse.text());
      } else {
        console.log('Successfully fetched Reddit posts');
      }
  
      // Then load from Firestore
      console.log('Loading from Firestore...');
      const postsRef = collection(db, 'reddit-posts-analytics', user!.uid, 'posts');
      const postsQuery = query(postsRef, orderBy('created_utc', 'desc'));
      const postsSnap = await getDocs(postsQuery);
      
      console.log('Firestore posts found:', postsSnap.size);
      
      if (!postsSnap.empty) {
        const postsData = postsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Posts data:', postsData);
        setUserRedditPosts(postsData);
        
        // Match generated posts with profile posts first
        // ONLY calculate metrics if we have generated posts to match against
      if (generatedPosts.length > 0) {
        const matched = matchGeneratedWithProfile(generatedPosts, postsData);
        setMatchedPosts(matched);
        setDisplayedMatchedPosts(matched.slice(0, ANALYTICS_ITEMS_PER_PAGE));
        setHasMoreMatchedPosts(matched.length > ANALYTICS_ITEMS_PER_PAGE);

        
        // Get the Reddit posts that match the generated posts
        const matchedRedditPosts = postsData.filter((redditPost: RedditPostData) => 
          matched.some(generatedItem => {
            return (
              generatedItem.subreddit === (redditPost.subreddit || '') &&
              ((generatedItem.title || '').toLowerCase().includes((redditPost.title || '').toLowerCase()) ||
              (redditPost.title || '').toLowerCase().includes((generatedItem.title || '').toLowerCase()) ||
              (generatedItem.body || generatedItem.content || '').toLowerCase().includes((redditPost.selftext || '').toLowerCase().substring(0, 100)))
            );
          })
        );
        
        // ALWAYS calculate metrics only from matched data in analytics mode
        if (isPostsAnalyticsMode) {
          calculatePostsMetrics(matchedRedditPosts);
        }
      }
      // Remove the else clause - don't calculate metrics without generated data
      } else {
        console.log('No posts found in Firestore');
        setUserRedditPosts([]);
        setPostsMetrics(null);
      }
    } catch (error) {
      console.error('Error loading posts analytics:', error);
    } finally {
      setIsLoadingPostsAnalytics(false);
    }
  };

const calculatePostsMetrics = (postsData: RedditPostData[]) => {
  if (postsData.length === 0) {
    setPostsMetrics(null);
    return;
  }

  const totalPosts = postsData.length;
  const totalUpvotes = postsData.reduce((sum, post) => sum + (post.score || 0), 0);
  const totalComments = postsData.reduce((sum, post) => sum + (post.num_comments || 0), 0);
  const avgUpvotes = totalUpvotes / totalPosts;
  const avgComments = totalComments / totalPosts;

  // Subreddit performance
  const subredditPerformance: { [key: string]: number } = {};
  postsData.forEach(post => {
    const subreddit = post.subreddit || 'unknown';
    if (!subredditPerformance[subreddit]) {
      subredditPerformance[subreddit] = 0;
    }
    subredditPerformance[subreddit] += (post.score || 0) + (post.num_comments || 0);
  });

  setPostsMetrics({
    total_posts: totalPosts,
    total_upvotes: totalUpvotes,
    total_comments: totalComments,
    avg_upvotes_per_post: Math.round(avgUpvotes * 100) / 100,
    avg_comments_per_post: Math.round(avgComments * 100) / 100,
    engagement_rate: Math.round(((totalUpvotes + totalComments) / totalPosts) * 100) / 100,
    top_performing_subreddits: subredditPerformance
  });
};

const getPostsChartData = () => {
  if (!userRedditPosts.length) return [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const last30Days = userRedditPosts
    .filter(post => {
      if (!post.created_utc) return false;
      
      try {
        let postDate: Date;
        // Handle both string ISO dates and Unix timestamps
        if (typeof post.created_utc === 'string') {
          if (post.created_utc.includes('T') || post.created_utc.includes('Z')) {
            postDate = new Date(post.created_utc);
          } else {
            postDate = new Date(post.created_utc + 'Z');
          }
        } else {
          // Unix timestamp
          postDate = new Date(post.created_utc * 1000);
        }
        
        return !isNaN(postDate.getTime()) && postDate >= thirtyDaysAgo;
      } catch (error) {
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = typeof a.created_utc === 'string' 
        ? new Date(a.created_utc.includes('Z') ? a.created_utc : a.created_utc + 'Z').getTime()
        : (a.created_utc || 0) * 1000;
      const dateB = typeof b.created_utc === 'string'
        ? new Date(b.created_utc.includes('Z') ? b.created_utc : b.created_utc + 'Z').getTime()
        : (b.created_utc || 0) * 1000;
      return dateA - dateB;
    });

  const groupedByDate: { [key: string]: { upvotes: number; posts: number; comments: number } } = {};
  
  last30Days.forEach(post => {
    try {
      let postDate: Date;
      if (typeof post.created_utc === 'string') {
        if (post.created_utc.includes('T') || post.created_utc.includes('Z')) {
          postDate = new Date(post.created_utc);
        } else {
          postDate = new Date(post.created_utc + 'Z');
        }
      } else {
        postDate = new Date((post.created_utc || 0) * 1000);
      }
      
      const date = postDate.toISOString().split('T')[0];
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = { upvotes: 0, posts: 0, comments: 0 };
      }
      groupedByDate[date].upvotes += post.score || 0;
      groupedByDate[date].posts += 1;
      groupedByDate[date].comments += post.num_comments || 0;
    } catch (error) {
      console.log('Error processing post for chart:', post.id, error);
    }
  });

  return Object.entries(groupedByDate).map(([date, data]) => ({
    date,
    upvotes: data.upvotes,
    posts: data.posts,
    comments: data.comments,
    engagement: data.upvotes + data.comments
  }));
};

const togglePostsView = (viewMode: 'analytics' | 'archive') => {
  setIsPostsAnalyticsMode(viewMode === 'analytics');
  localStorage.setItem('archive-posts-view-preference', viewMode);
  
  if (viewMode === 'analytics' && hasUsername) {
    loadPostsAnalytics(redditUsername);
  }
};

const toggleCommentsView = (viewMode: 'analytics' | 'archive') => {
  setIsAnalyticsMode(viewMode === 'analytics');
  localStorage.setItem('archive-comments-view-preference', viewMode);
  // Recalculate metrics based on view mode if we already have data
  if (roiComments.length > 0 && archivedPosts.length > 0) {
    if (viewMode === 'analytics') {
      // Calculate metrics only for matched comments
      const matchedRoiComments = roiComments.filter(comment => 
        matchedComments.some(archivedItem => {
          if (archivedItem.url && comment.permalink) {
            const archivedPostId = archivedItem.url.split('/')[6]?.split('?')[0];
            const profilePostId = comment.permalink.split('/')[4];
            return archivedPostId === profilePostId;
          }
          
          return (
            archivedItem.title.toLowerCase().includes(comment.post_title?.toLowerCase() || '') ||
            comment.post_title?.toLowerCase().includes(archivedItem.title.toLowerCase() || '') ||
            (archivedItem.subreddit === comment.subreddit && 
             comment.comment_text?.toLowerCase().includes(archivedItem.suggestedReply.toLowerCase().substring(0, 50) || ''))
          );
        })
      );
      calculateROIMetrics(matchedRoiComments);
    } 
  } else if (viewMode === 'analytics' && hasUsername && roiComments.length === 0) {
    // Only load data if we don't have it yet
    loadROIData(redditUsername);
  }
};

  const copyToClipboard = (post: GeneratedPost) => {
    const textToCopy = `${post.title}\n\n${post.body || post.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(post.id || null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1 p-6 space-y-6">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {/* Tab Switcher with View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'comments' 
                  ? 'bg-white dark:bg-gray-900 text-orange-500 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Comments</span>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'posts' 
                  ? 'bg-white dark:bg-gray-900 text-orange-500 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Posts</span>
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex space-x-2">
            {/* Comments View Toggle - Only show for comments tab when username exists */}
            {activeTab === 'comments' && hasUsername && (
              <>
                <button
                  onClick={() => toggleCommentsView('analytics')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    isAnalyticsMode
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Analytics View
                </button>
                <button
                  onClick={() => toggleCommentsView('archive')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    !isAnalyticsMode
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Archive View
                </button>
              </>
            )}

            {/* Posts View Toggle - Only show for posts tab when username exists */}
            {activeTab === 'posts' && hasUsername && (
              <>
                <button
                  onClick={() => togglePostsView('analytics')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    isPostsAnalyticsMode
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Analytics View
                </button>
                <button
                  onClick={() => togglePostsView('archive')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    !isPostsAnalyticsMode
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Archive View
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reddit Analytics Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          {!hasUsername ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">Connect Reddit for Analytics</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Track your comment performance and engagement</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Reddit username"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="px-3 py-2 rounded-md border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSetupUsername()}
                />
                <button
                  onClick={handleSetupUsername}
                  disabled={!inputUsername.trim() || isSetupLoading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSetupLoading ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{redditUsername.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">u/{redditUsername}</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {lastRoiUpdate ? `Last updated ${formatDistanceToNow(new Date(lastRoiUpdate))} ago` : 'Analytics connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpdateROI}
                disabled={isUpdatingRoi}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdatingRoi ? 'animate-spin' : ''}`} />
                <span>{isUpdatingRoi ? 'Updating...' : 'Refresh'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Comments Tab Content */}
        {activeTab === 'comments' && (
          <>
            {/* Analytics Mode */}
            {isAnalyticsMode && hasUsername ? (
              <>
                {/* ROI Metrics Cards */}
                {roiMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <MessageSquare size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Comments</p>
                          <p className="text-white text-2xl font-bold">{roiMetrics.total_comments}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <TrendingUp size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Karma</p>
                          <p className="text-white text-2xl font-bold">{roiMetrics.total_karma}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Eye size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Avg Score/Comment</p>
                          <p className="text-white text-2xl font-bold">{roiMetrics.avg_score_per_comment}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <BarChart3 size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Replies</p>
                          <p className="text-white text-2xl font-bold">{roiMetrics.total_replies_generated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Charts */}
                {roiComments.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Engagement Over Time */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <h3 className="text-white text-lg font-medium mb-4">Engagement Over Time (30 Days)</h3>
                      <div className="w-full h-80 flex items-center justify-center">
                        <D3CommentsChart data={getROIChartData()} />
                      </div>
                    </div>

                                    {/* Top Subreddits */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-white text-lg font-medium mb-4">Top Performing Subreddits</h3>
                  {roiMetrics && (
                    <div className="space-y-3">
                      {Object.entries(roiMetrics.top_performing_subreddits)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 8)
                        .map(([subreddit, score], index) => (
                          <div key={subreddit} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="text-gray-300">r/{subreddit}</span>
                            </div>
                            <span className="text-orange-500 font-medium">{score} pts</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

                {/* Recent Comments from ROI - Only show matched comments */}
                {isAnalyticsMode && displayedMatchedComments.length > 0 && (
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <h3 className="text-white text-lg font-medium mb-4">Posted Comments ({matchedComments.length})</h3>
                    <div className="space-y-4">
                      {displayedMatchedComments.map((comment) => (
                        <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-500 text-sm font-medium">
                                r/{comment.subreddit}
                              </span>
                              {/* Display scores */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-md">
                                  <TrendingUp size={12} className="text-orange-400" />
                                  <span className="text-orange-300 text-xs font-medium">{comment.roiData?.score || 0} karma</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-md">
                                  <MessageSquare size={12} className="text-orange-400" />
                                  <span className="text-orange-300 text-xs font-medium">{comment.roiData?.reply_count || 0} replies</span>
                                </div>
                              </div>
                            </div>
                            <a
                              href={comment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-orange-500 transition-colors"
                            >
                              <ArrowUpRight size={16} />
                            </a>
                          </div>
                          <h4 className="text-white font-medium mb-2 text-sm">
                            {comment.title}
                          </h4>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {comment.suggestedReply}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Posted: {formatDistanceToNow(new Date(comment.date_created), { addSuffix: true })}</span>
                            {(comment.roiData?.reply_count || 0) > 0 && (
                              <button 
                                onClick={() => window.open(`https://reddit.com${comment.roiData?.permalink}`, '_blank')}
                                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-300 hover:bg-blue-500/30 transition-colors text-xs"
                              >
                                View Replies ({comment.roiData?.reply_count})
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Load More Button for Comments */}
                    {hasMoreMatchedComments && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={loadMoreMatchedComments}
                          disabled={isLoadingMoreAnalytics}
                          className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoadingMoreAnalytics ? 'Loading...' : 'Load More Comments'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* No Matched Comments State */}
                {isAnalyticsMode && hasUsername && matchedComments.length === 0 && archivedPosts.length > 0 && (
                  <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                    <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No Posted Comments Found</h3>
                    <p className="text-gray-400 mb-4">
                      None of your archived comments appear to have been posted to Reddit yet.
                    </p>
                  </div>
                )}

                {/* No ROI Data State */}
                {isAnalyticsMode && hasUsername && roiComments.length === 0 && (
                  <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                    <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No Comments Found</h3>
                    <p className="text-gray-400 mb-4">
                      We couldn&apos;t find any recent comments for your Reddit account. 
                      Try updating your data or make sure you&apos;re actively commenting.
                    </p>
                    <button
                      onClick={handleUpdateROI}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                    >
                      Refresh Data
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Archive Mode - Original archived comments */}
                {displayedPosts.map((post) => (
                  <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                      <div className="mb-4">
                        <div className="text-sm text-blue-500 dark:text-blue-400">{post.subreddit}</div>
                        <h2 className="card-title dark:text-white">{post.title}</h2>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created {formatDistanceToNow(new Date(post.date_created), { addSuffix: true })}
                        </div>
                        <a 
                          href={`${post.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="absolute top-2 right-2 flex items-center text-blue-500 dark:text-blue-400 hover:underline m-2"
                        >
                          <ArrowUpRight className="w-5 h-5 mr-1" />
                          <span className="text-sm font-medium">Go to discussion</span>
                        </a>

                        <ReactMarkdown className="mt-2 dark:text-gray-300">
                          {post.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 dark:text-white">Submitted Reply</h3>
                        <div 
                          className="w-full p-2 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                        >
                          {post.suggestedReply}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center py-4">
                  {hasMorePosts ? (
                    <button 
                      className="btn btn-neutral"
                      onClick={loadMorePosts}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? <Loading /> : 'Load More Comments'}
                    </button>
                  ) : displayedPosts.length > 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <p>End of archived comments!</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <p>No archived comments yet.</p>
                      <p className="text-sm mt-1">Approved comments will appear here.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <>
            {/* Posts Analytics Mode */}
            {isPostsAnalyticsMode && hasUsername ? (
              <>
                {isLoadingPostsAnalytics ? (
                  <div className="flex justify-center py-12">
                    <Loading />
                  </div>
                ) : (
                  <>
                    {/* Posts Metrics Cards */}
                    {postsMetrics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <FileText size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Posts</p>
                              <p className="text-white text-2xl font-bold">{postsMetrics.total_posts}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                              <TrendingUp size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Upvotes</p>
                              <p className="text-white text-2xl font-bold">{postsMetrics.total_upvotes}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <MessageSquare size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Comments</p>
                              <p className="text-white text-2xl font-bold">{postsMetrics.total_comments}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                              <BarChart3 size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Engagement Rate</p>
                              <p className="text-white text-2xl font-bold">{postsMetrics.engagement_rate}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posts Charts */}
                    {userRedditPosts.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Posts Performance Over Time */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <h3 className="text-white text-lg font-medium mb-4">Posts Performance (30 Days)</h3>
                          <div className="w-full h-80 flex items-center justify-center">
                            <D3PostsChart data={getPostsChartData()} />
                          </div>
                        </div>

                        {/* Top Performing Subreddits */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <h3 className="text-white text-lg font-medium mb-4">Top Performing Subreddits</h3>
                          {postsMetrics && (
                            <div className="space-y-3">
                              {Object.entries(postsMetrics.top_performing_subreddits)
                                .sort(([,a], [,b]) => (b as number) - (a as number))
                                .slice(0, 8)
                                .map(([subreddit, score], index) => (
                                  <div key={subreddit} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {index + 1}
                                      </div>
                                      <span className="text-gray-300">r/{subreddit}</span>
                                    </div>
                                    <span className="text-orange-500 font-medium">{score as number} pts</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Posts from Reddit - Only show matched posts */}
                    {isPostsAnalyticsMode && displayedMatchedPosts.length > 0 && (
                      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 className="text-white text-lg font-medium mb-4">Posted Content ({matchedPosts.length})</h3>
                        <div className="space-y-4">
                          {displayedMatchedPosts.map((post) => (
                            <div key={post.id} className="bg-gray-800 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-orange-500 text-sm font-medium">
                                    r/{post.subreddit}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                                    {post.post_type?.replace('_', ' ')}
                                  </span>
                                  {/* Display scores */}
                                  <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <TrendingUp size={12} />
                                      <span>{post.roiData?.score || 0} upvotes</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MessageSquare size={12} />
                                      <span>{post.roiData?.num_comments || 0} comments</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <h4 className="text-white font-medium mb-2 text-sm">
                                {post.title}
                              </h4>
                              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                {post.body || post.content}
                              </p>
                              <div className="flex gap-4 text-xs text-gray-400">
                              <span>Created: {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Unknown'}</span>

                                {post.target_audience && <span>Target: {post.target_audience}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Load More Button for Posts */}
                        {hasMoreMatchedPosts && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={loadMoreMatchedPosts}
                              disabled={isLoadingMoreAnalytics}
                              className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isLoadingMoreAnalytics ? 'Loading...' : 'Load More Posts'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Matched Posts State */}
                    {isPostsAnalyticsMode && hasUsername && matchedPosts.length === 0 && generatedPosts.length > 0 && (
                      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                        <FileText size={64} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">No Posted Content Found</h3>
                        <p className="text-gray-400 mb-4">
                          None of your generated posts appear to have been posted to Reddit yet.
                        </p>
                      </div>
                    )}

                    {/* No Posts Data State */}
                    {isPostsAnalyticsMode && hasUsername && userRedditPosts.length === 0 && (
                      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                        <FileText size={64} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">No Posts Found</h3>
                        <p className="text-gray-400 mb-4">
                          We couldn't find any posts from your Reddit account. 
                          Try refreshing the data or make sure you've posted on Reddit recently.
                        </p>
                        <button
                          onClick={() => loadPostsAnalytics(redditUsername)}
                          className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                        >
                          Refresh Posts Data
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Archive Mode - Original generated posts */}
                {isLoading2 ? (
                  <div className="flex justify-center py-12">
                    <Loading />
                  </div>
                ) : displayedGeneratedPosts.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No saved posts yet</p>
                    <p className="text-sm mt-1">Generate and save posts to see them here.</p>
                  </div>
                ) : (
                  <>
                    {displayedGeneratedPosts.map((post) => (
                      <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="card-body">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-sm text-blue-500 dark:text-blue-400">r/{post.subreddit}</span>
                                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                                  {post.post_type?.replace('_', ' ')}
                                </span>
                                {post.status === 'archived' && (
                                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                    Saved
                                  </span>
                                )}
                              </div>
                              <h2 className="card-title dark:text-white text-lg">{post.title}</h2>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {post.created_at && (
                                  <>Created {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</>
                                )}
                                {post.target_audience && (
                                  <span className="ml-3">Target: {post.target_audience}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(post)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                                copiedId === post.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              <Copy className="w-4 h-4" />
                              <span>{copiedId === post.id ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                              {post.body || post.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-center py-4">
                      {hasMoreGeneratedPosts ? (
                        <button 
                          className="btn btn-neutral"
                          onClick={loadMoreGeneratedPosts}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? <Loading /> : 'Load More Posts'}
                        </button>
                      ) : displayedGeneratedPosts.length > 0 ? (
                        <div className="text-center text-gray-600 dark:text-gray-400">
                          <p>End of saved posts!</p>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}