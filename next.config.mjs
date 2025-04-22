/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT_MODE === 'true'

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  distDir: 'dist',
  basePath: isExport ? '' : process.env.BASEPATH || '',
  ...(isExport
    ? {
        output: 'export'
      }
    : {
        redirects: async () => [
          {
            source: '/',
            destination: '/dashboards',
            permanent: true
          }
        ],
        rewrites: async () => [
          {
            source: '/bapi/:path*',
            destination: '/api/bapi/:path*'
          }
        ]
      })
}

export default nextConfig
