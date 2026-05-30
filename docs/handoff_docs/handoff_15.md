# Handoff: Integrating 16:9 Promotional Video on Homepage

## Session Overview
In this conversation, we finalized the remaining static pages for **Issue 11** (`.scratch/pmd-ecommerce/issues/11-static-pages.md`). The FAQ page has now been completed, alongside the previously finalized About and Contact pages. However, the user now wants to revisit the Homepage to properly add the 16:9 promotional video, as originally requested in the acceptance criteria.

## Next Agent Instructions
Your primary focus for the next session is to **add the 16:9 promotional video to the PMD Homepage (`/`)**.

### Specific Tasks:
1. **Locate the Video Assets:** Review the `PMD Website Content & Asset Upload Form.csv` to find the Google Drive link to the brand videos uploaded by the client.
2. **Review Storage Strategy:** Check `docs/adr/0002-vercel-blob-for-media-storage.md` or the `package.json` to see how media is supposed to be handled/hosted (e.g., Vercel Blob). You may need to download the video and upload it to the correct hosting provider or place it in the `/public` directory if it's small enough.
3. **Update `src/app/page.tsx`:** Integrate the video into the hero section of the homepage. Ensure it maintains a strict `16:9` aspect ratio and fits perfectly within the bold, dark, and premium streetwear aesthetic of the PMD brand. It should ideally autoplay, loop, and be muted (standard for promotional background hero videos), but you should confirm this behavior with the user.

## Suggested Skills
- `[/grill-with-docs]` or `[/grill-me]` if you need to clarify with the user where the video should be hosted permanently or if there are specific loading performance constraints.
- `[/triage]` to manage any follow-up tasks on the issue tracker if integrating the video requires additional work (like setting up a Vercel Blob bucket).
