import React from 'react';

const testimonials = [
    {
        text: "JustScan revolutionized our campus security. Checking IDs takes seconds now, and the logs are always accurate.",
        user: "– Sarah J., University Admin",
    },
    {
        text: "The real-time sync is faster than I expected. I can see student entries on the dashboard instantly.",
        user: "– Mike T., IT Director",
    },
    {
        text: "Finally, a digital ID solution that actually works in low light. The OCR is incredible.",
        user: "– Priya R., Event Coordinator",
    },
    {
        text: "Setting up our organization took less than 5 minutes. The interface is intuitive and clean.",
        user: "– David L., System Admin",
    },
    {
        text: "Peace of mind for parents and staff. Knowing exactly who is on campus is invaluable.",
        user: "– Dr. Emily C., Principal",
    },
    {
        text: "We replaced our expensive hardware scanners with JustScan. It's cheaper, faster, and easier.",
        user: "– Mark S., Operations Head",
    },
];

const Testimonials = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-12 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 font-display">
                        Trusted by Modern Campuses
                    </span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto text-lg">
                    Join hundreds of institutions securing their premises with JustScan.
                </p>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks for smooth fade out at edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#05020e] to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#05020e] to-transparent z-20 pointer-events-none"></div>

                <div className="flex w-max animate-scroll gap-6 hover:[animation-play-state:paused]">
                    {/* Duplicate list for infinite loop */}
                    {[...testimonials, ...testimonials].map((t, index) => (
                        <div
                            key={index}
                            className="glass-panel p-6 rounded-2xl w-[300px] md:w-[400px] flex-shrink-0 border border-white/10 hover:border-purple-500/30 transition-colors"
                        >
                            <p className="text-gray-300 italic text-lg leading-relaxed mb-4">
                                "{t.text}"
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                                <h4 className="font-semibold text-purple-400 text-sm">
                                    {t.user}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
