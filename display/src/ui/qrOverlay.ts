export async function mountQrOverlay(container: HTMLElement): Promise<void> {
  const res = await fetch("/api/join-info");
  const { url, qrDataUrl } = await res.json();

  container.innerHTML = `
    <img src="${qrDataUrl}" alt="QR code to join" width="140" height="140" />
    <div class="qr-url">${url}</div>
  `;
}
