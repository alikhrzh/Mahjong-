import type { NextConfig } from "next";
import { patchNodeWebStorage } from "./scripts/patch-node-webstorage";

patchNodeWebStorage();

const nextConfig: NextConfig = {};

export default nextConfig;
