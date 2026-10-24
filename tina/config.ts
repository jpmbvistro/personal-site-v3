import type { Config, TinaField, Template } from 'tinacms';

const metricStrip: Template = {
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
};

const uxDiagram: Template = {
  name: 'UxEnablementDiagram', label: 'UX enablement figure',
  fields: [
    { type: 'string', name: 'composition', label: 'Composition', options: [
      { value: 'network', label: 'Distributed network (hero)' },
      { value: 'approach', label: 'Guidance to local ownership (approach)' },
    ] },
    { type: 'string', name: 'caption', label: 'Caption', required: true },
    { type: 'string', name: 'summary', label: 'Text explanation', required: true, ui: { component: 'textarea' } },
    { type: 'string', name: 'specialistsLabel', label: 'Specialists label', required: true },
    { type: 'string', name: 'resourcesLabel', label: 'Resources label', required: true },
    { type: 'string', name: 'participantsLabel', label: 'Participants label', required: true },
    { type: 'string', name: 'teamsLabel', label: 'Teams label', required: true },
  ],
};

const storySections: TinaField = {
  type: 'object', name: 'sections', label: 'Editorial sections', list: true,
  ui: { itemProps: (item) => ({ label: item?.title || 'Story section' }) },
  fields: [
    { type: 'string', name: 'eyebrow', label: 'Section label' },
    { type: 'string', name: 'title', label: 'Section heading', required: true },
    { type: 'string', name: 'layout', label: 'Layout', options: [
      { value: 'prose', label: 'Narrative / figure' },
      { value: 'decisions', label: 'Decision list' },
    ] },
    { type: 'rich-text', name: 'children', label: 'Section content', templates: [metricStrip, uxDiagram] },
  ],
};

const body: TinaField = {
  type: 'rich-text', name: 'body', label: 'Body', isBody: true, required: true,
  templates: [metricStrip, uxDiagram],
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
          { type: 'string', name: 'presentation', label: 'Presentation', options: [
            { value: 'standard', label: 'Simple narrative' },
            { value: 'editorial', label: 'Editorial with lead figure' },
          ] },
          storySections,
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
