import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@participant-import": path.resolve(
        __dirname,
        "../../modules/participant-import/src"
      ),
    };
    return config;
  },
};

export default nextConfig;
