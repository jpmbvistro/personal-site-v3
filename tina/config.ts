import type { Config, TinaField } from 'tinacms';

const body: TinaField = {
  type: 'rich-text', name: 'body', label: 'Body', isBody: true, required: true,
  templates: [{
    name: 'MetricStrip', label: 'Metric strip',
    fields: [
      { type: 'string', name: 'caption', label: 'Caption' },
      {
        type: 'object', name: 'metrics', label: 'Metrics', list: true,
        ui: { itemProps: (item) => ({ label: item?.label || 'Metric' }) },
        fields: [
          { type: 'string', name: 'value', label: 'Value', required: true },
          { type: 'string', name: 'label', label: 'Label', required: true },
          { type: 'string', name: 'qualifier', label: 'Qualifier' },
        ],
      },
    ],
  }],
};

const entryFields: TinaField[] = [
  { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
  { type: 'boolean', name: 'draft', label: 'Draft (hidden from public pages)', required: true },
  { type: 'string', name: 'summary', label: 'Summary', ui: { component: 'textarea' } },
  body,
];

const links: TinaField = {
  type: 'object', name: 'links', label: 'Links', list: true,
  ui: { itemProps: (item) => ({ label: item?.label || 'Link' }) },
  fields: [
    { type: 'string', name: 'label', label: 'Label', required: true },
    { type: 'string', name: 'url', label: 'URL', required: true },
  ],
};

// Type-only configuration avoids loading Tina's entire browser runtime into the
// Node CLI. The CLI still validates the schema before indexing/building.
export default {
  branch: process.env.TINA_PUBLIC_BRANCH || 'main',
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { tina: { mediaRoot: 'uploads', publicFolder: 'public' } },
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'md',
        ui: {
          allowedActions: { create: false, delete: false },
          router: ({ document }) => document._sys.filename === 'home' ? '/' : `/${document._sys.filename}/`,
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'summary', label: 'Page description' },
          body,
          links,
          { type: 'string', name: 'resume', label: 'Résumé URL (optional)', description: 'A résumé page or public-safe file URL, such as /resume/ or /uploads/resume.pdf.' },
        ],
      },
      {
        name: 'work', label: 'Work', path: 'content/work', format: 'mdx',
        defaultItem: () => ({ draft: true }),
        // Tina's collection-list router receives _sys, not the draft field.
        // Local preview handles either state; hosted routing uses public paths.
        ui: { router: ({ document }) => process.env.TINA_PUBLIC_IS_LOCAL === 'true'
          ? `/preview/work/${document._sys.breadcrumbs.join('/')}/`
          : `/work/${document._sys.breadcrumbs.join('/')}/` },
        fields: [
          ...entryFields,
          { type: 'string', name: 'organizationLabel', label: 'Display organization' },
          { type: 'string', name: 'role', label: 'Role' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          links,
        ],
      },
      {
        name: 'project', label: 'Projects', path: 'content/projects', format: 'mdx',
        defaultItem: () => ({ draft: true }),
        ui: { router: ({ document }) => process.env.TINA_PUBLIC_IS_LOCAL === 'true'
          ? `/preview/projects/${document._sys.breadcrumbs.join('/')}/`
          : `/projects/${document._sys.breadcrumbs.join('/')}/` },
        fields: [
          ...entryFields,
          { type: 'string', name: 'status', label: 'Status (your wording)' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          links,
        ],
      },
    ],
  },
} satisfies Config;
