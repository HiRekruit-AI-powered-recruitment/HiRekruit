import React, { useState, useEffect } from "react";
import { Star, Quote, TrendingUp, Users, Clock, Award } from "lucide-react";

// Testimonials Component (embedded)
const TestimonialsSlider = () => {
  const scrollRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Shikha Gupta",
      role: "Human Resources",
      company: "StackCart",
      text: "HiRekruit has completely transformed our recruitment process. We've reduced our time-to-hire by 60% and the quality of candidates has significantly improved.",
      rating: 5,
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQGXfMpfklh_jg/profile-displayphoto-shrink_800_800/B56ZZPzFlfHoAc-/0/1745095515416?e=1767225600&v=beta&t=fazu2E0IVxamTE_-dxlsgugXBleoJSD4z05KCJomYck",
    },
    {
      id: 2,
      name: "Kavita Verma",
      role: "Human Resources",
      company: "HiRekruit",
      text: "The bulk upload feature alone has saved us countless hours. What used to take our team days now happens in minutes. The analytics dashboard gives us insights we never had before.",
      rating: 5,
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQHRD3f6o5EysQ/profile-displayphoto-crop_800_800/B56ZsXcnSRJwAI-/0/1765624940935?e=1767225600&v=beta&t=pJFj6mk4LHxBSN9ok4b-z3EvXVH4IWavL8P3K98EAvA",
    },
  ];

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

  return (
    <div className="relative">
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
          {[...testimonials, ...testimonials, ...testimonials].map(
            (t, index) => (
              <div
                key={index}
                className="min-w-[340px] max-w-[340px] bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 flex-shrink-0 border border-gray-300 hover:border-gray-400"
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
                      <Users className="w-6 h-6 text-white" />
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
            )
          )}
        </div>
      </div>

      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

// Client Logos Component
const ClientLogos = () => {
  const clients = [
    {
      id: 1,
      name: "Google",
      logo: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
    },
    {
      id: 2,
      name: "Microsoft",
      logo: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31",
    },
    {
      id: 3,
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      id: 4,
      name: "Meta",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    },
    {
      id: 5,
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    },
    {
      id: 6,
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      id: 7,
      name: "Tesla",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
    },
    {
      id: 8,
      name: "Spotify",
      logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png",
    },
    {
      id: 9,
      name: "Adobe",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg",
    },
    {
      id: 10,
      name: "Intel",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg",
    },
  ];

  return (
    <div className="relative overflow-hidden py-8">
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex gap-16 items-center animate-scroll-left">
        {[...clients, ...clients, ...clients].map((client, index) => (
          <div
            key={index}
            className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
          >
            <img
              src={client.logo}
              alt={client.name}
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = `<div class="h-12 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-600 font-bold text-sm">${client.name}</div>`;
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

const Clients = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
              Leading Companies
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover how organizations worldwide are transforming their hiring
            processes with HiRekruit's AI-powered recruitment solutions.
          </p>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powering Recruitment for Industry Leaders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join 500+ companies who trust HiRekruit for their hiring needs
            </p>
          </div>
          <ClientLogos />

          {/* Stats Section */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-black text-gray-800 mb-2">500+</p>
              <p className="text-gray-600 text-sm font-medium">Companies</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gray-800 mb-2">50K+</p>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gray-800 mb-2">98%</p>
              <p className="text-gray-600 text-sm font-medium">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-gray-800 mb-2">24/7</p>
              <p className="text-gray-600 text-sm font-medium">Support</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of companies transforming their hiring process
            </p>
          </div>
          <TestimonialsSlider />
        </div>
      </section>

      {/* Industry Focus */}
      <section className="py-16 px-6 bg-gradient-to-r from-black to-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Industries We Serve
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              "Technology",
              "Healthcare",
              "Finance",
              "Manufacturing",
              "Retail",
              "Consulting",
            ].map((industry, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm shadow-lg text-center hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <p className="text-black font-semibold">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Clients;
