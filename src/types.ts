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

/** A vault file already read into memory (from Node fs or the Tauri backend). */
export type SourceFile = {
  relativePath: string;
  content: string;
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
  /** Entity ids this entity's wikilinks resolve to. */
  linkedIds: string[];
  backlinks: string[];
  route: string;
  html: string;
  /** Optional timeline convention: a single date or a start/end range. */
  date?: string;
  start?: string;
  end?: string;
  /** Optional map-pin convention: id of a Map entity plus 0-100 percent coordinates. */
  map?: string;
  mapX?: number;
  mapY?: number;
};

export type StoryEvent = {
  id: string;
  name: string;
  description?: string;
  text?: string;
  canonRefs: string[];
  route: string;
  html: string;
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
