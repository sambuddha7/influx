"use client";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Brands on reddit.
      </h2>
      <Carousel items={cards} />
    </div>
  );
}
interface ContentProps {
  text: string;
}

const Content: React.FC<ContentProps>  = ({ text }) => {
  return (
    <>
      {[...new Array(1).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              {text}
            </p>
          </div>
        );
      })}
    </>
  );
};

const data = [
  {
    category: "",
    title: "Nissan",
    src: "https://images.unsplash.com/photo-1611088135647-aa5eb1b5f390?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmlzc2FufGVufDB8fDB8fHww",
    content: <Content text="Nissan's 2015 AMA on Reddit demonstrated the power of direct, personal engagement in building customer loyalty. By having their CEO answer a mix of product-related and personal questions, Nissan humanized the brand and built trust with the Reddit community. This strategy not only generated interest in their products but also fostered stronger connections with potential customers." />,
  },
  {
    category: "",
    title: "Washington Post",
    src: "https://media.gettyimages.com/id/2158941400/photo/the-washington-post-office-in-washington-dc-us-on-thursday-june-27-2024-the-british.jpg?s=612x612&w=0&k=20&c=EK2pQBx8pgoSIWb4PhkuLcjy5WNhxahkbtBOpV5JVB4=",
    content: <Content text="In 2017, The Washington Post became the first national news publisher to launch a Reddit profile, and seven years later, it continues to thrive. By engaging in posts, comments, and AMA sessions within relevant communities, it drives highly engaged audiences to its stories. With its vast range of original reporting, u/washingtonpost seamlessly adds value to Reddit discussions, establishing a strong presence. " />,
  },
  {
    category: "",
    title: "SpaceX",
    src: "https://images.unsplash.com/photo-1711919380671-296a67491cc2?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <Content text="To promote the launch of its BFR rocket, SpaceX leveraged a Reddit AMA with CEO Elon Musk, a renowned tech-industry leader. Instead of targeting just SpaceX fans, they hosted the AMA on the broad r/space subreddit, reaching a wider audience of space enthusiasts. This strategy allowed SpaceX to engage with people who might not have been familiar with the company but were interested in Musk's expertise and the space industry. Even without a celebrity figure like Musk, brands can replicate this approach by posting engaging content in relevant, broad subreddits, building awareness and connecting with potential customers in an authentic way." />,
  },

  {
    category: "",
    title: "Spotify",
    src: "https://media.gettyimages.com/id/1461363374/photo/new-york-new-york-the-spotify-company-logo-is-diaplayed-as-traders-work-on-the-floor-of-the.jpg?s=612x612&w=0&k=20&c=eVcOhAMuXF6aeusCFd-X3_S3KgwKsyDUj8aTQGmTTUw=",
    content: <Content text="Spotify's use of Reddit to promote its Discover Weekly playlist showcases a strategic approach to engaging users through targeted, community-driven content. By tapping into Reddit’s passionate music communities, Spotify leveraged discussions, user-generated content, and organic sharing to amplify awareness of Discover Weekly. The playlist, which curates personalized music selections for each user, became a powerful tool for fostering deeper engagement and musical discovery. As a result, Spotify saw significantly higher engagement rates from Discover Weekly users, who streamed music for over twice as long as non-users" />,
  },
];
