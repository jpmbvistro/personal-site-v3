import type { Config, TinaField, Template } from 'tinacms';

const icon: TinaField = { type: 'string', name: 'icon', label: 'Illustration', options: [
  { value: 'teams', label: 'People / teams' },
  { value: 'capacity', label: 'Capacity / focus' },
  { value: 'constraints', label: 'Constraints / tradeoffs' },
  { value: 'research', label: 'Research / evidence' },
  { value: 'system', label: 'Design system' },
  { value: 'learning', label: 'Learning / guidance' },
  { value: 'ux-distributed', label: 'UX artwork — distributed ownership' },
  { value: 'ux-capacity', label: 'UX artwork — limited specialist capacity' },
  { value: 'ux-skepticism', label: 'UX artwork — skepticism / user value' },
  { value: 'ux-research', label: 'UX artwork — research artifacts' },
  { value: 'ux-integration', label: 'UX artwork — integration / upgrade path' },
  { value: 'ux-partnership', label: 'UX artwork — specialist partnership' },
] };

const calloutFields: TinaField[] = [
  icon,
  { type: 'string', name: 'title', label: 'Heading', required: true },
  { type: 'string', name: 'text', label: 'Explanation', ui: { component: 'textarea' } },
];

const editorialCallouts: Template = {
  name: 'EditorialCallouts', label: 'Illustrated callouts',
  fields: [
    { type: 'string', name: 'label', label: 'Group label' },
    { type: 'object', name: 'items', label: 'Callouts', list: true,
      ui: { itemProps: (item) => ({ label: item?.title || 'Callout' }) }, fields: calloutFields },
  ],
};

const metricStrip: Template = {
  name: 'MetricStrip', label: 'Metric strip',
  fields: [
    { type: 'string', name: 'caption', label: 'Caption' },
    { type: 'boolean', name: 'topRule', label: 'Show top rule', description: 'Shown by default when unset.', ui: { defaultValue: true } },
    { type: 'boolean', name: 'bottomRule', label: 'Show bottom rule', description: 'Shown by default when unset.', ui: { defaultValue: true } },
    {
      type: 'object', name: 'metrics', label: 'Metrics', list: true,
      ui: { itemProps: (item) => ({ label: item?.label || 'Metric' }) },
      fields: [
        icon,
        { type: 'string', name: 'value', label: 'Value', required: true },
        { type: 'string', name: 'label', label: 'Label', required: true },
        { type: 'string', name: 'qualifier', label: 'Qualifier' },
      ],
    },
  ],
};

const diagramLabels: TinaField[] = [
    { type: 'string', name: 'caption', label: 'Caption', required: true },
    { type: 'string', name: 'summary', label: 'Text explanation', required: true, ui: { component: 'textarea' } },
    { type: 'string', name: 'specialistsLabel', label: 'Specialists label', required: true },
    { type: 'string', name: 'resourcesLabel', label: 'Resources label', required: true },
    { type: 'string', name: 'participantsLabel', label: 'Participants label', required: true },
    { type: 'string', name: 'teamsLabel', label: 'Teams label', required: true },
];

const localOwnership: Template = {
  name: 'LocalOwnershipDiagram', label: 'Guidance to local ownership',
  fields: [
    ...diagramLabels,
    { type: 'object', name: 'stages', label: 'Approach stages', list: true,
      ui: { itemProps: (item) => ({ label: item?.title || 'Stage' }) },
      fields: [
        { type: 'string', name: 'title', label: 'Heading', required: true },
        { type: 'string', name: 'text', label: 'Explanation' },
      ] },
  ],
};

const distributedNetwork: Template = {
  name: 'DistributedUxNetwork', label: 'Distributed UX network',
  fields: [
    ...diagramLabels,
    { type: 'string', name: 'calloutsLabel', label: 'Hero callout group label' },
    { type: 'object', name: 'callouts', label: 'Hero callouts (outside network)', list: true,
      ui: { itemProps: (item) => ({ label: item?.title || 'Callout' }) }, fields: calloutFields },
  ],
};

const blockQuote: Template = {
  name: 'BlockQuote', label: 'Block quote',
  fields: [
    { type: 'string', name: 'label', label: 'Label (optional)' },
    { type: 'boolean', name: 'originalThought', label: 'Original thought (not a quotation)', description: 'Preserves the editorial treatment without quotation semantics or attribution.' },
    { type: 'string', name: 'quote', label: 'Quote', required: true, ui: { component: 'textarea' } },
    { type: 'string', name: 'attribution', label: 'Attribution (optional)' },
  ],
};

// Fixed, story-specific labels: content is editable, geometry is not a graph editor.
const labelFields = (labels: Record<string, string>): TinaField[] => Object.entries(labels).map(([name, label]) => ({ type: 'string', name, label, required: true, ...(name === 'summary' ? { ui: { component: 'textarea' } } : {}) }));
const apiPreview: Template = {
  name: 'ApiMigrationPreview', label: 'API migration — hero preview',
  fields: [
    ...labelFields({ caption: 'Caption', summary: 'Text explanation', necessity: 'Scope question', correctness: 'Behavior question' }),
    { type: 'string', name: 'scopeSteps', label: 'Scope motif labels', list: true },
    { type: 'string', name: 'behaviorSteps', label: 'Behavior motif labels', list: true },
  ],
};
const apiDecisionDiagram: Template = {
  name: 'ApiMigrationDecisionDiagram', label: 'API migration — complementary investigations',
  fields: [
    ...labelFields({ caption: 'Caption', summary: 'Text explanation' }),
    { type: 'object', name: 'scope', label: 'A — scope reduction', required: true, fields: labelFields({
      label: 'Investigation label', title: 'Heading', summary: 'Investigation narrative', backlog: 'Inherited backlog', traffic: 'Traffic evidence', consumers: 'Supported consumers', criteria: 'Agreed retirement criteria', question: 'Decision question', no: 'Remove branch', removedValue: 'Removed count (display string)', removedLabel: 'Removed finding label', yes: 'Retain branch', retained: 'Retained-work label (not a link to B)',
    }) },
    { type: 'object', name: 'behavior', label: 'B — behavioral correctness', required: true, fields: labelFields({
      label: 'Investigation label', title: 'Heading', summary: 'Investigation narrative and endpoint context', superseded: 'Deprioritized assumption label', typedClient: 'Rejected abstraction', rejectedReason: 'Reason for deprioritizing', legacy: 'Legacy input', proxy: 'Proxy input', comparison: 'Live comparison', investigation: 'Discrepancy investigation', source: 'Source-level investigation', branches: 'Missed-branches finding', correction: 'Corrective prioritization', rerun: 'Revalidation loop label', ci: 'CI outcome', ciDetail: 'CI explanation',
    }) },
  ],
};
const agenticPreview: Template = {
  name: 'AgenticDeliveryPreview', label: 'Agentic delivery — hero preview',
  fields: [
    ...labelFields({ caption: 'Caption', summary: 'Text explanation', backlog: 'Backlog label', harness: 'Harness label', review: 'PR label', recovery: 'Recovery label' }),
    { type: 'string', name: 'tickets', label: 'Representative ticket labels', list: true, required: true },
  ],
};
const agenticDiagram: Template = {
  name: 'AgenticDeliveryHarnessDiagram', label: 'Agentic delivery — isolation, validation and recovery',
  fields: [
    ...labelFields({ caption: 'Caption', summary: 'Text explanation', intakeTitle: 'Intake heading', intakeText: 'Intake description', reviewTitle: 'PR handoff heading', reviewText: 'Review / oversight description' }),
    { type: 'string', name: 'intakeItems', label: 'Intake requirements (optional list replaces description)', list: true },
    { type: 'object', name: 'proof', label: 'Sequential proof', required: true, fields: labelFields({ title: 'Heading', text: 'Explanation' }) },
    { type: 'object', name: 'scale', label: 'Parallel scaling', required: true, fields: labelFields({ title: 'Heading', text: 'Explanation' }) },
    { type: 'object', name: 'execution', label: 'Per-ticket isolation', required: true, fields: [
      ...labelFields({ title: 'Heading', note: 'Illustrative-lane qualifier', worktree: 'Worktree label', agent: 'Implementation label', tests: 'Test isolation label', checks: 'Required checks label' }),
      { type: 'string', name: 'tickets', label: 'Representative ticket labels', list: true, required: true },
    ] },
    { type: 'object', name: 'validation', label: 'Required validation', required: true, fields: labelFields({ title: 'Heading', commands: 'Deterministic commands', tests: 'Test requirements', shadowDiff: 'Behavioral validation', failure: 'Failure blocks completion' }) },
    { type: 'object', name: 'recovery', label: 'Failure and recovery', required: true, fields: labelFields({ title: 'Heading', failure: 'Failure', retry: 'Bounded retry', persistent: 'Persistent failure', human: 'Human handoff', note: 'Retry / human-assistance explanation' }) },
    { type: 'object', name: 'observability', label: 'Evidence and improvement', required: true, fields: labelFields({ title: 'Heading', traces: 'Diagnostic evidence', investigation: 'Debugging-agent investigation', fixes: 'Targeted improvements', note: 'Evidence / uncertainty qualifier' }) },
  ],
};
const crmTransformation: Template = {
  name: 'CrmDecisionTransformation', label: 'CRM — decision transformation',
  fields: [
    ...labelFields({ caption: 'Caption', summary: 'Text explanation', initialLabel: 'Initial-choice label', monthly: 'Shared monthly-fee context' }),
    ...['platformA', 'platformB'].map((name): TinaField => ({ type: 'object', name, label: name === 'platformA' ? 'Initial Platform A' : 'Initial Platform B', required: true,
      fields: labelFields({ title: 'Platform label', fee: 'Fee structure', capability: 'Required functionality', constraint: 'Tradeoff' }) })),
    { type: 'object', name: 'intervention', label: 'Modeling and engagement', required: true, fields: labelFields({ label: 'Stage label', title: 'Heading', modeling: 'Financial modeling', requirement: 'Functional requirement', partnership: 'Vendor engagement' }) },
    { type: 'object', name: 'outcome', label: 'Negotiated Platform A', required: true, fields: labelFields({ label: 'Stage label', title: 'Heading', continuity: 'Same-vendor explanation', fee: 'Retained economics', feature: 'Feature accommodation', fit: 'Functional fit' }) },
  ],
};
const donorCostModel: Template = {
  name: 'DonorCostModelFigure', label: 'CRM — donor-pyramid financial model',
  fields: [
    ...labelFields({ caption: 'Caption', summary: 'Text explanation' }),
    { type: 'object', name: 'pyramid', label: 'Conceptual donor pyramid', required: true, fields: [
      ...labelFields({ title: 'Heading', note: 'Configurable-shares explanation', qualifier: 'Illustrative-category qualifier' }),
      { type: 'string', name: 'tiers', label: 'Illustrative giving levels (top to bottom)', list: true, required: true },
    ] },
    { type: 'object', name: 'assumptions', label: 'Growth assumptions', required: true, fields: labelFields({ title: 'Heading', volume: 'Donor-volume label', volumeText: 'Donor-volume explanation', distribution: 'Giving-distribution label', distributionText: 'Giving-distribution explanation', fees: 'Fee-structure label', feesText: 'Fee-structure explanation' }) },
    { type: 'object', name: 'model', label: 'Scenario model', required: true, fields: labelFields({ title: 'Heading', note: 'Model explanation' }) },
    { type: 'object', name: 'comparison', label: 'Conceptual fee comparison', required: true, fields: labelFields({ title: 'Heading', qualifier: 'Illustrative / not-to-scale qualifier', platformA: 'Platform A label', platformAText: 'Platform A fee structure', platformB: 'Platform B label', platformBText: 'Platform B fee structure', note: 'Comparison explanation' }) },
  ],
};
const visualBlocks = [metricStrip, distributedNetwork, localOwnership, editorialCallouts, blockQuote, apiPreview, apiDecisionDiagram, agenticPreview, agenticDiagram, crmTransformation, donorCostModel];

const storySections: TinaField = {
  type: 'object', name: 'sections', label: 'Editorial sections', list: true,
  ui: { itemProps: (item) => ({ label: item?.eyebrow || 'Story section' }) },
  fields: [
    { type: 'string', name: 'eyebrow', label: 'Section label' },
    { type: 'string', name: 'title', label: 'Section heading', required: true },
    { type: 'string', name: 'layout', label: 'Layout', options: [
      { value: 'prose', label: 'Narrative / figure' },
      { value: 'decisions', label: 'Decision list' },
      { value: 'wide', label: 'Full-width figure / content' },
    ] },
    { type: 'rich-text', name: 'intro', label: 'Introduction (under heading)' },
    { type: 'rich-text', name: 'children', label: 'Section content (right column)', templates: visualBlocks },
    { type: 'rich-text', name: 'aside', label: 'Side content (optional third column)', description: 'Sits beside the right-column content on wide screens, below it on smaller screens.', templates: [metricStrip, blockQuote] },
  ],
};

const body: TinaField = {
  type: 'rich-text', name: 'body', label: 'Body', isBody: true, required: true,
  templates: visualBlocks,
};

const entryFields: TinaField[] = [
  { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
  { type: 'boolean', name: 'draft', label: 'Draft (hidden from public pages)', required: true },
  { type: 'string', name: 'summary', label: 'Summary', ui: { component: 'textarea' } },
  { type: 'string', name: 'cardTitle', label: 'Card title (optional)', description: 'Uses the story title when omitted.' },
  { type: 'string', name: 'cardCategory', label: 'Card category (optional)' },
  { type: 'image', name: 'cardImage', label: 'Card artwork / public project artifact (optional)' },
  { type: 'string', name: 'cardImageAlt', label: 'Card image description', description: 'Describe genuine project artifacts. Leave empty for decorative Work artwork already explained by the card.' },
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

// One fixed homepage composition, not a page builder. Slugs resolve only against
// published records; missing, duplicate and draft selections never create links.
const homepage: TinaField = {
  type: 'object', name: 'homepage', label: 'Homepage content (Home only)',
  fields: [
    { type: 'string', name: 'eyebrow', label: 'Hero eyebrow' },
    { type: 'object', name: 'primaryAction', label: 'Hero primary action', fields: [
      { type: 'string', name: 'label', label: 'Label' },
      { type: 'string', name: 'url', label: 'Destination' },
    ] },
    { type: 'string', name: 'resumeLabel', label: 'Résumé action label', description: 'Uses the Résumé URL on Contact; falls back to Get in touch if unset or unsafe.' },
    { type: 'object', name: 'capabilities', label: 'Capability transition', list: true,
      ui: { itemProps: (item) => ({ label: item?.title || 'Capability' }) },
      fields: [
        { type: 'string', name: 'title', label: 'Heading' },
        { type: 'string', name: 'text', label: 'Description', ui: { component: 'textarea' } },
      ] },
    { type: 'string', name: 'featuredWork', label: 'Featured Work slugs (in order)', list: true, description: 'Filename without .mdx; drafts and missing entries are omitted. No automatic selection.' },
    { type: 'string', name: 'featuredProjects', label: 'Featured Project slugs (in order)', list: true, description: 'Only explicitly published entries appear. No automatic selection.' },
    ...['work', 'projects'].map((name): TinaField => ({ type: 'object', name, label: name === 'work' ? 'Selected Work introduction' : 'Asterism introduction', fields: [
      { type: 'string', name: 'eyebrow', label: 'Eyebrow' },
      { type: 'string', name: 'title', label: 'Heading' },
      { type: 'string', name: 'text', label: 'Introduction', ui: { component: 'textarea' } },
      ...(name === 'projects' ? [{ type: 'string', name: 'emptyText', label: 'When no selected projects are published', ui: { component: 'textarea' } } satisfies TinaField] : []),
    ] })),
    { type: 'object', name: 'perspective', label: 'Leadership perspective', fields: [
      { type: 'string', name: 'eyebrow', label: 'Eyebrow' },
      { type: 'string', name: 'text', label: 'Original positioning statement', ui: { component: 'textarea' } },
      { type: 'object', name: 'principles', label: 'Supporting descriptors', list: true, fields: [
        { type: 'string', name: 'title', label: 'Heading' },
        { type: 'string', name: 'text', label: 'Description' },
      ] },
      { type: 'string', name: 'linkLabel', label: 'About link label' },
    ] },
    { type: 'object', name: 'contact', label: 'Contact and closing', fields: [
      { type: 'string', name: 'title', label: 'Heading' },
      { type: 'string', name: 'text', label: 'Invitation', ui: { component: 'textarea' } },
      { type: 'string', name: 'label', label: 'Action label' },
      { type: 'string', name: 'url', label: 'Action destination' },
    ] },
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
          homepage,
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
