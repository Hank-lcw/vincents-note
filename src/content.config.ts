import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const TOPICS = ['指數投資與資產配置', '學術研究解讀', '個人理財與退休'] as const;

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    urlname: z.string().optional(),
    date: z.coerce.date(),
    topic: z.enum(TOPICS),
    grade: z.enum(['A', 'B', 'C']),
    excerpt: z.string(),
    summary: z.array(z.string()).default([]),
    references: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
