import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartDataPoint, ProcessedChartData } from '@/types/archive';

interface CommentsChartProps {
  data: ChartDataPoint[];
}

export const CommentsChart: React.FC<CommentsChartProps> = ({ data }) => {
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