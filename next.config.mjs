/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/go/dm19',
        destination: '/lp?utm_source=email&utm_medium=dm&utm_campaign=19kai',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
