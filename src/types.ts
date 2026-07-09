export type CompendiumConfig = {
  specVersion: "0.1";
  site?: {
    title?: string;
    description?: string;
    locale?: string;
    baseUrl?: string;
    coverImage?: string;
    logo?: string;
  };
  theme?: { preset?: "midnight" | "parchment" | "ink"; accentColor?: string };
  navigation?: { typeOrder?: string[] };
  publication?: { statuses?: string[] };
  narrative?: { mode?: "scenes-and-relations" };
};

export type Entity = {
  id: string;
  type: string;
  name: string;
  status: string;
  tags: string[];
  aliases: string[];
  parentId?: string;
  childrenIds: string[];
  path: string;
  body: string;
  wikilinks: string[];
  backlinks: string[];
  route: string;
  html: string;
};

export type StoryEvent = {
  id: string;
  name: string;
  description?: string;
  text?: string;
  canonRefs: string[];
  route: string;
};
export type Story = {
  id: string;
  name: string;
  sequences: Array<{ id: string; name: string; events: StoryEvent[] }>;
  route: string;
};
export type SiteData = {
  vaultPath: string;
  config: CompendiumConfig;
  title: string;
  description: string;
  entities: Entity[];
  stories: Story[];
  warnings: string[];
};
