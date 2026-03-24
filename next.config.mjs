/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/go/dm19',
        destination: '/lp?utm_source=email&utm_medium=dm&utm_campaign=19kai',
        permanent: false,
      },
      {
        source: '/go/fb',
        destination: 'https://sakuseikun.jp/?utm_source=facebook&utm_medium=social&utm_campaign=monitor',
        permanent: false,
      },
      {
        source: '/go/x',
        destination: 'https://sakuseikun.jp/?utm_source=twitter&utm_medium=social&utm_campaign=monitor',
        permanent: false,
      },
      {
        source: '/go/th',
        destination: 'https://sakuseikun.jp/?utm_source=threads&utm_medium=social&utm_campaign=monitor',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
