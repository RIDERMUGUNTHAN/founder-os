/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Standalone output (required by Dockerfile). File tracing is disabled only on Windows
  // to avoid junction point issues.
  ...(process.platform === 'win32'
    ? { outputFileTracing: false }
    : { output: 'standalone' }),
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['better-sqlite3', 'node-ical', 'nodemailer'],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { isServer, webpack }) => {
    // Ignore Windows junction points that cause EPERM errors
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/Application Data/**',
        '**/C:/Users/Admin/Application Data/**',
        '**/C:\\Users\\Admin\\Application Data/**',
        '**/Cookies/**',
        '**/C:/Users/Admin/Cookies/**',
        '**/C:\\Users\\Admin\\Cookies/**',
      ],
    };

    // Disable symlink resolution to avoid following junction points
    config.resolve.symlinks = false;

    // Use IgnorePlugin to exclude the problematic directory from webpack operations
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /Application Data/,
        contextRegExp: /.*/,
      })
    );

    return config;
  },
};

export default nextConfig;
