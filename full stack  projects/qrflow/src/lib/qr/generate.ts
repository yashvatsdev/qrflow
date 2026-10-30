import QRCode from "qrcode";
import type { QRStyle } from "@/types/qr";
export const qrOptions = (style: QRStyle) => ({
  errorCorrectionLevel: "M" as const,
  margin: 4,
  width: style.resolution,
  color: { dark: style.foreground, light: style.background },
});
export async function qrSvg(url: string, style: QRStyle) {
  return QRCode.toString(url, { ...qrOptions(style), type: "svg" });
}
