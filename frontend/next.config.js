/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '.',
      };
      return config;
    },
    images: {
      domains: ['images.unsplash.com'],
    },
  };
  
  module.exports = nextConfig; 