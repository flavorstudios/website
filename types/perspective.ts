export interface PerspectiveAttributeScore {
  summaryScore: {
    value: number;
  };
}

export interface PerspectiveResponse {
  attributeScores?: {
    TOXICITY?: PerspectiveAttributeScore;
    INSULT?: PerspectiveAttributeScore;
    THREAT?: PerspectiveAttributeScore;
    [key: string]: PerspectiveAttributeScore | undefined;
  };
  [key: string]: unknown;
}