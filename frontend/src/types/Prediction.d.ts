export type PredictionItem = {
  date: string;
  value: number;
};

export type PredictionData = {
  predictions: PredictionItem[];
};

export type PredictionResponse = {
  status: boolean;
  message: string;
  data: PredictionData[];
};

export type UsePredictionReturn = {
  predictions: PredictionItem[];
  allPredictions: PredictionItem[];
  rawJson: string | null;
  loading: boolean;
  error: string | null;
  showAllPredictions: boolean;
  showRawJson: boolean;
  fetchPrediction: (days: number) => Promise<void>;
  loadMore: () => void;
  toggleRawJson: () => void;
  hasMore: boolean;
  remainingCount: number;
};
