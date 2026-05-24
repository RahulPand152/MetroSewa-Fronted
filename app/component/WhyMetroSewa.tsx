"use client";

const features = [
  {
    number: "01",
    title: "Vetted Experts Only",
    description:
      "Every professional passes background checks, skill tests & identity verification before joining our platform.",
  },
  {
    number: "02",
    title: "Transparent Pricing",
    description:
      "No hidden charges. Know exactly what you pay — before the professional even arrives.",
  },
  {
    number: "03",
    title: "On-Time, Every Time",
    description:
      "Real-time tracking and punctuality guarantees so your schedule is never disrupted.",
  },
  {
    number: "04",
    title: "Satisfaction Guaranteed",
    description:
      "Not happy? We rebook at no cost. Your peace of mind is our priority, always.",
  },
];

export const WhyMetroSewa = () => {
  return (
    <section className="bg-background-secondary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Label */}
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
          Why Metro Sewa
        </p>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-14">
          Metro Sewa Has Your Back —<br className="hidden sm:block" /> Every Single Day.
        </h2>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-12">
          {features.map((f) => (
            <div
              key={f.number}
              className="border-l-2 border-primary pl-6"
            >
              {/* Number */}
              <p className="text-3xl font-bold text-primary/30 mb-2 leading-none">
                {f.number}
              </p>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
