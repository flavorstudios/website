export interface AtomLinkNode {
  $: {
    href: string;
    rel?: string;
    type?: string;
  };
}

export interface EnclosureNode {
  $: {
    url: string;
    type?: string;
    length?: string;
  };
}

export type CategoryNode = string | string[];

export interface GuidNode {
  _?: string;
  $?: Record<string, string>;
}

export interface RssItemNode {
  title: string;
  description: string;
  link: string;
  guid: string | GuidNode;
  pubDate: string;
  "dc:creator"?: string;
  "content:encoded"?: string;
  category?: CategoryNode;
  enclosure?: EnclosureNode;
}

export interface RssChannelNode {
  title: string;
  description: string;
  link: string;
  language: string;
  lastBuildDate: string;
  pubDate: string;
  docs: string;
  generator: string;
  "atom:link": AtomLinkNode;
  item?: RssItemNode | RssItemNode[];
}

export interface RssXmlDocument {
  rss: {
    channel: RssChannelNode;
  };
}