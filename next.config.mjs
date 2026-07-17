const staticExport = process.env.STATIC_EXPORT === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(staticExport
    ? { output: "export", trailingSlash: true }
    : {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${process.env.API_BASE_URL || "http://localhost:8080"}/api/:path*`,
            },
          ];
        },
      }),
};

export default nextConfig;
