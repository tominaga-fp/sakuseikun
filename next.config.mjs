import { withSentryConfig } from '@sentry/nextjs';
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
        source: '/go/dm19_2',
        destination: '/lp?utm_source=email&utm_medium=dm&utm_campaign=dm19_2',
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
      {
        source: '/go/li',
        destination: 'https://sakuseikun.jp/?utm_source=linkedin&utm_medium=social&utm_campaign=monitor',
        permanent: false,
      },
      {
        source: '/go/nt',
        destination: 'https://sakuseikun.jp/?utm_source=note&utm_medium=article&utm_campaign=note_regular',
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "tominaga-fp",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
