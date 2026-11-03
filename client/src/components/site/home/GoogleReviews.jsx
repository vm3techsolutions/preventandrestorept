"use client";

import Script from "next/script";

export default function GoogleReviews() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-8">
          What Our Clients Say
        </h2>

        <Script
          src="https://static.elfsight.com/platform/platform.js"
          strategy="lazyOnload"
        />

        <div
          className="elfsight-app-a17be0e3-7e0c-46ef-90c3-f9ba3e6b9a95"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  );
}