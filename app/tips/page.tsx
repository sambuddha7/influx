// pages/tips.tsx
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

const TipsContent = () => {
  const tips = [
    {
      category: "Account to Use",
      description: "Selecting and setting up the right account for Reddit marketing",
      items: [
        "Use personal accounts with your real name and professional credentials",
        "Leverage founder or subject matter expert personas rather than company accounts",
        "Established accounts with history and karma perform better than new ones"
      ]
    },
    {
      category: "If Using a Brand New Account",
      description: "Proper approach for building credibility with fresh accounts",
      items: [
        "Do not immediately start promoting your startup or product",
        "Focus on engaging in relevant discussions to establish expertise",
        "Begin with 1-2 comments daily for the first few weeks",
        "Demonstrate industry knowledge through helpful, detailed responses",
        "Build trust by consistently providing value before any promotional activity"
      ]
    },
    {
      category: "Post Disclaimers",
      description: "Maintaining transparency while promoting your business",
      items: [
        "Always disclose your affiliation when mentioning your product",
        "Use disclaimers like 'I'm the founder of XYZ' at the end of helpful comments",
        "Share personal experiences and specific insights that helped you"
      ]
    },
    {
      category: "Don'ts",
      description: "Critical mistakes that lead to bans and poor results",
      items: [
        "Never create fake user accounts or pretend to be a customer",
        "Avoid making 100+ comments per day - limit to 10-20 maximum",
        "Never buy Reddit accounts - they typically get banned",
        "Keep direct hyperlinks to the minimum, links to blogs or resources are acceptable",
        "Do not use Reddit APIs for posting"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
      {/* Header Section */}
      <div className="text-center mb-20">
      <h1 className="text-5xl md:text-8xl font-bold leading-tight text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-red-500">
            Discussion Tips
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Master the art of Reddit marketing with proven strategies and best practices
        </p>
      </div>
      
      {/* Tips Grid */}
      <div className="grid gap-8 lg:gap-12">
        {tips.map((section, index) => (
          <div 
            key={index} 
            className="group relative"
          >
            {/* Card */}
            <div className="relative bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 lg:p-10 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700">
              {/* Category Header */}
              <div className="mb-8">
                <div className="flex items-center mb-3">
                  <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                    {section.category}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed ml-11">
                  {section.description}
                </p>
              </div>

              {/* Tips List */}
              <div className="space-y-4 ml-11">
                {section.items.map((tip, tipIndex) => (
                  <div 
                    key={tipIndex}
                    className="group/item flex items-start"
                  >
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-2.5 mr-4 group-hover/item:bg-orange-500 transition-colors duration-200" />
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors duration-200">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-20 pt-12 border-t border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Implement these strategies systematically to build authentic engagement and establish credibility within Reddit communities.
        </p>
      </div>
    </div>
  );
};

export default function Tips() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <TipsContent />
      <Footer />
    </div>
  );
}