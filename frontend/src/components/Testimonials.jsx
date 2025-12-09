import React, { useState, useRef, useEffect } from "react";
import { User, Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Shikha Gupta",
    role: "Human Resources",
    company: "TechCorp",
    text: "This platform has changed the way I hire. Highly recommend!",
    rating: 5,
    image: null, // Add image URL here like: "https://example.com/photo.jpg"
  },
  {
    id: 2,
    name: "Heena H.",
    role: "Human Resources",
    company: "StartupHub",
    text: "A seamless experience from start to finish.",
    rating: 5,
    image: null,
  },
  {
    id: 3,
    name: "Piyush Patel",
    role: "UI/UX Designer",
    company: "DesignStudio",
    text: "Intuitive and simple. It saves me hours every week!",
    rating: 5,
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/049/174/246/small/a-smiling-young-indian-man-with-formal-shirts-outdoors-photo.jpg",
  },
  {
    id: 4,
    name: "Udit Jain",
    role: "Backend Engineer",
    company: "CloudSystems",
    text: "Amazing tool! Smooth workflows and excellent UI.",
    rating: 5,
    image: null,
  },
  {
    id: 5,
    name: "Sachin Kumar",
    role: "Recruiter",
    company: "TalentPro",
    text: "Finding the right talent is now effortless.",
    rating: 5,
    image: null,
  },
  {
    id: 6,
    name: "Rohit Sharma",
    role: "Team Lead",
    company: "Innovation Labs",
    text: "The automation here is a game changer for hiring.",
    rating: 5,
    image: null,
  },
  {
    id: 7,
    name: "Rohit Anand",
    role: "Project Manager",
    company: "BuildFast",
    text: "Streamlined our entire recruitment pipeline.",
    rating: 5,
    image: null,
  },
  {
    id: 8,
    name: "Rahul Kumar",
    role: "Co-founder",
    company: "NextGen",
    text: "I've tried many platforms, this one is the best!",
    rating: 5,
    image: null,
  },
  {
    id: 9,
    name: "Anshu Raj",
    role: "CEO",
    company: "ScaleUp",
    text: "Super clean design and works like magic.",
    rating: 5,
    image: null,
  },
  {
    id: 10,
    name: "Aman Sheoran",
    role: "CTO",
    company: "FutureTech",
    text: "Love how smooth the process is now.",
    rating: 5,
    image: null,
  },
];

const Testimonials = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    if (!isAutoScrolling || isDragging) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [isAutoScrolling, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoScrolling(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = (direction) => {
    setIsAutoScrolling(false);
    const scrollAmount = 360;
    if (direction === "left") {
      scrollRef.current.scrollLeft -= scrollAmount;
    } else {
      scrollRef.current.scrollLeft += scrollAmount;
    }
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={() => handleScroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => handleScroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-hidden py-4 cursor-grab active:cursor-grabbing"
        style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
      >
        <div className="flex gap-6 w-fit">
          {[...testimonials, ...testimonials].map((t, index) => (
            <div
              key={index}
              className="min-w-[340px] max-w-[340px] bg-gradient-to-r from-gray-200 to-white
 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 flex-shrink-0 border border-gray-300 hover:border-gray-400"
            >
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-gray-400 opacity-40" />
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-gray-800 text-gray-800"
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 text-base mb-6 leading-relaxed">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md overflow-hidden">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.role}</p>
                  <p className="text-xs text-gray-700 font-semibold">
                    {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced gradient overlays */}
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

export default Testimonials;
