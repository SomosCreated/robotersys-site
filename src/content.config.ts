import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      language: z.enum(['pt', 'en', 'es', 'de']),
      category: z.string(),
      author: z.string(),
      coverImage: image().optional(),
      publishedAt: z.date(),
      updatedAt: z.date().optional(),
      draft: z.boolean().default(false),
      seoDescription: z.string().optional(),
    }),
});

export const collections = { blog };
