import QRCode from "qrcode";
import { getLanIp } from "./lanIp";

export async function buildJoinInfo(port: number): Promise<{ url: string; qrDataUrl: string }> {
  const url = `http://${getLanIp()}:${port}/controller`;
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 });
  return { url, qrDataUrl };
}
