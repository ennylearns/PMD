# ADR 0002: Vercel Blob for Media Storage

## Status

Accepted

## Context

As part of the Admin Product Catalog (Issue 17), we need a way to upload and store product images. Since PMD is a Next.js application that will be deployed in a serverless environment (Vercel), uploading and storing files directly on the local server filesystem is an anti-pattern. Local files will be lost across serverless invocations and deployments.

We needed a managed cloud storage solution.

## Decision

We will use **Vercel Blob** (`@vercel/blob`) for all media storage.

## Reasons

- **Native Next.js Integration:** Vercel Blob provides excellent, official packages for Next.js, making client-side and server-side uploads straightforward.
- **No Third-Party Dashboards:** It eliminates the need to configure and manage external services (like AWS S3 or Cloudinary) for simple storage needs, keeping the infrastructure entirely within the Vercel ecosystem.
- **Fast Client Uploads:** It supports direct client-to-blob uploads, meaning we don't have to proxy large image files through our own API routes, saving bandwidth and preventing serverless function timeouts.

## Trade-offs Accepted

- **Vendor Lock-in:** This decision ties our media storage infrastructure directly to Vercel. Migrating away in the future would require migrating all blob objects and rewriting the upload implementation.
- **Limited Transformations:** Unlike Cloudinary, Vercel Blob is purely object storage. It does not provide on-the-fly cropping or complex transformations. We will rely on Next.js's native `<Image />` component for basic optimization and resizing.

## Consequences

- The Vercel Blob domains (e.g., `*.public.blob.vercel-storage.com`) must be whitelisted in the `remotePatterns` array of `next.config.ts` so the Next.js `<Image />` component can optimize them.
- We will use an "Immediate Upload" UX pattern in the Admin dashboard: selecting an image uploads it instantly to Vercel Blob and returns a URL. If an admin abandons the "Add Product" form, the uploaded image becomes an orphaned blob. We accept this small storage inefficiency for now.
