/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure allowed file reading paths
  serverRuntimeConfig: {
    // Will only be available on the server side
    dataDirectories: {
      customer: '/path/to/customer/data',
      sales: '/path/to/sales/data',
      support: '/path/to/support/data',
    },
  },
};

module.exports = nextConfig;
