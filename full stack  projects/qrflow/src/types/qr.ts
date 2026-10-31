export type QRStyle = {
  foreground: string;
  background: string;
  resolution: number;
};
export type QRCode = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  destination_url: string;
  status: "active" | "paused";
  style_config: QRStyle;
  created_at: string;
  updated_at: string;
};
export type DailyScans = { date: string; scans: number };
export type QRCodeSummary = QRCode & { recorded_scans: number };
export type ScanStats = {
  total: number;
  last7: number;
  last30: number;
  daily: DailyScans[];
};
