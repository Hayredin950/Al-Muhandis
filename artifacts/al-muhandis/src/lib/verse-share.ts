export interface VerseShareOptions {
  arabicText: string;
  translation: string;
  surahName: string;
  ayahNumber: number;
  surahNumber: number;
  arabicFont?: string;
}

export async function generateVerseImage(opts: VerseShareOptions): Promise<Blob> {
  const {
    arabicText,
    translation,
    surahName,
    ayahNumber,
    surahNumber,
    arabicFont = "Amiri Quran",
  } = opts;

  const W = 1080;
  const H = 1080;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0f1117");
  grad.addColorStop(1, "#1a1f2e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(212,175,55,0.25)";
  ctx.lineWidth = 2;
  const margin = 40;
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 24);
  ctx.stroke();

  ctx.strokeStyle = "rgba(212,175,55,0.1)";
  ctx.lineWidth = 1;
  roundRect(ctx, margin + 12, margin + 12, W - (margin + 12) * 2, H - (margin + 12) * 2, 16);
  ctx.stroke();

  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, "#c8a84b");
  goldGrad.addColorStop(0.5, "#f0d080");
  goldGrad.addColorStop(1, "#c8a84b");
  ctx.fillStyle = goldGrad;
  ctx.font = "bold 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Al-Muhandis", W / 2, 100);

  ctx.fillStyle = "rgba(212,175,55,0.4)";
  ctx.fillRect(W / 2 - 120, 116, 240, 1);

  const arabicLines = wrapArabic(arabicText, W - 160);

  ctx.font = `bold 52px "${arabicFont}", serif`;
  ctx.textAlign = "right";
  ctx.direction = "rtl";
  ctx.fillStyle = "#f5f0e8";

  const lineHeight = 90;
  const totalArabicH = arabicLines.length * lineHeight;
  let arabicStartY = H / 2 - totalArabicH / 2 - 30;
  if (arabicStartY < 180) arabicStartY = 180;

  for (const line of arabicLines) {
    ctx.fillText(line, W - 80, arabicStartY);
    arabicStartY += lineHeight;
  }

  ctx.direction = "ltr";

  const translationLines = wrapText(ctx, `"${translation}"`, W - 160, "italic 22px Inter, sans-serif");
  ctx.font = "italic 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(200,190,170,0.85)";
  let ty = arabicStartY + 30;
  for (const line of translationLines) {
    ctx.fillText(line, W / 2, ty);
    ty += 34;
  }

  ctx.fillStyle = "rgba(212,175,55,0.4)";
  ctx.fillRect(W / 2 - 80, ty + 20, 160, 1);

  ctx.font = "600 20px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#d4af37";
  ctx.fillText(`${surahName}  ·  Verse ${ayahNumber}  (${surahNumber}:${ayahNumber})`, W / 2, ty + 54);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function shareVerse(opts: VerseShareOptions): Promise<void> {
  const blob = await generateVerseImage(opts);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `verse-${opts.surahNumber}-${opts.ayahNumber}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function copyVerseImage(opts: VerseShareOptions): Promise<void> {
  const blob = await generateVerseImage(opts);
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
  } catch {
    shareVerse(opts);
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrapArabic(text: string, _maxWidth: number): string[] {
  const words = text.split(" ");
  const chunkSize = Math.ceil(words.length / Math.ceil(words.length / 6));
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    lines.push(words.slice(i, i + chunkSize).join(" "));
  }
  return lines.slice(0, 4);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
