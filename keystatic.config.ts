/**
 * Keystatic CMS configuration — Phase 4, M2
 *
 * CONTENT FORMAT DECISION: MDX
 * We use `fields.mdx` (not markdoc) because:
 *   1. The Astro content collection `blog` already uses MDX (glob pattern `**\/*.mdx`,
 *      @astrojs/mdx integration). Changing to markdoc would require updating
 *      src/content.config.ts, renaming the three sample posts, and changing the
 *      render logic in all blog page routes.
 *   2. `fields.mdx` writes `.mdx` files whose frontmatter matches the Zod schema
 *      in src/content.config.ts exactly — the round-trip is transparent.
 *   3. Keystatic's `fields.mdx` is a first-class supported field; markdoc is the
 *      default in the docs only because it was added first.
 *
 * STORAGE STRATEGY
 *   - Local (dev): files are written directly to src/content/blog/ on disk.
 *   - GitHub (prod): edits create commits on the GitHub repo via the Keystatic
 *     GitHub App → Vercel webhook → rebuild. The app itself does NOT change; only
 *     the storage backend switches.
 *
 * LIVE EDITING SETUP (user action required — does NOT block the build)
 *   To enable the GitHub storage mode so clients can edit posts from the deployed
 *   /keystatic panel:
 *   1. Install the Keystatic GitHub App on the repo
 *      https://keystatic.com/docs/github-app
 *   2. Create a GitHub OAuth App (or use the one Keystatic creates) and add the
 *      credentials to Vercel env vars:
 *        KEYSTATIC_GITHUB_CLIENT_ID
 *        KEYSTATIC_GITHUB_CLIENT_SECRET
 *        KEYSTATIC_SECRET           (random 32+ char secret)
 *        PUBLIC_KEYSTATIC_GITHUB_APP_SLUG  (slug of your GitHub App)
 *   3. Invite the shared editorial GitHub account (somoscreated or the client's
 *      account) as a collaborator on SomosCreated/robotersys-site with write access.
 *   4. Open https://robotersys.com/keystatic — it will prompt for GitHub login.
 *      After authentication, the panel is fully operational for live editing.
 *
 * Until the GitHub App is connected, the panel works in local mode during `astro dev`
 * and the production /keystatic route will redirect to GitHub auth (which fails
 * gracefully if the env vars are absent — it shows a login screen).
 */

import { config, fields, collection } from '@keystatic/core';

// ---------------------------------------------------------------------------
// Repository reference (used in GitHub storage mode)
// ---------------------------------------------------------------------------
const REPO = 'SomosCreated/robotersys-site' as const;

// ---------------------------------------------------------------------------
// Schema — mirrors src/content.config.ts exactly
// Fields: title (slug), excerpt, language, category, author, coverImage,
//         publishedAt, draft, seoDescription, content (MDX body)
// ---------------------------------------------------------------------------
export default config({
  // GitHub storage in production. Locally it's disk-based (edits write straight to
  // src/content/blog) — EXCEPT when PUBLIC_KEYSTATIC_SETUP=true, which switches local
  // dev to GitHub mode so you can run the one-time "Create GitHub App" wizard on
  // localhost (it writes KEYSTATIC_GITHUB_* to .env). See deploy-runbook.
  storage:
    import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_SETUP === 'true'
      ? { kind: 'github', repo: REPO }
      : { kind: 'local' },

  ui: {
    brand: { name: 'RoboterSys Blog' },
  },

  collections: {
    posts: collection({
      label: 'Blog Posts',
      // Maps to the same directory as the Astro content collection loader
      // (glob({ pattern: '**/*.mdx', base: './src/content/blog' }))
      path: 'src/content/blog/*',
      // The MDX body is stored in the same .mdx file as the frontmatter
      format: { contentField: 'content' },
      // Slug is derived from the filename (no extra frontmatter key needed)
      slugField: 'title',
      entryLayout: 'content',
      columns: ['title', 'language', 'publishedAt', 'draft'],
      schema: {
        // --- Frontmatter fields (match Zod schema in src/content.config.ts) ---

        title: fields.slug({
          name: { label: 'Title' },
        }),

        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: true },
        }),

        language: fields.select({
          label: 'Language',
          options: [
            { label: 'Português', value: 'pt' },
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
            { label: 'Deutsch', value: 'de' },
          ],
          defaultValue: 'pt',
        }),

        category: fields.text({
          label: 'Category',
          validation: { isRequired: true },
        }),

        author: fields.text({
          label: 'Author',
          validation: { isRequired: true },
        }),

        // Optional cover image — stored in src/assets/blog/ alongside posts.
        // Astro's image() in content.config.ts reads the path and processes it
        // via astro:assets at build time.
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'src/assets/blog',
          publicPath: '/src/assets/blog/',
        }),

        // Keystatic date field stores ISO strings (YYYY-MM-DD).
        // Astro's z.date() coerces them to Date objects automatically.
        publishedAt: fields.date({
          label: 'Published At',
          validation: { isRequired: true },
        }),

        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
          description: 'Check to hide this post from the public site.',
        }),

        seoDescription: fields.text({
          label: 'SEO Description',
          multiline: true,
        }),

        // --- MDX body field ---
        // `fields.mdx` writes the body directly into the .mdx file.
        // The format.contentField: 'content' above tells Keystatic to treat
        // this field as the file body rather than a frontmatter key.
        content: fields.mdx({
          label: 'Content',
        }),
      },
    }),
  },
});
