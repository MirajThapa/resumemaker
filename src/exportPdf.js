import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Turns one .sheet element into a multi-page A4 PDF.
// Pages are cut at row/section boundaries so text lines are not sliced in half.
export async function sheetToPdf(wrapper) {
  const el = wrapper.querySelector(".sheet");
  const scale = 2;
  const canvas = await html2canvas(el, { scale, backgroundColor: "#fff", useCORS: true });

  const pxPerMm = el.offsetWidth / 210;
  const box = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const top = parseFloat(cs.paddingTop);
  const bottom = el.offsetHeight - parseFloat(cs.paddingBottom);
  const marginMm = 12;
  const pageH = (297 - marginMm * 2) * pxPerMm;

  const breaks = [...el.querySelectorAll("tr, h4, .coh, .nm")]
    .map((n) => n.getBoundingClientRect().bottom - box.top)
    .filter((y) => y > top)
    .sort((a, b) => a - b);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = top;
  let first = true;
  while (y < bottom - 1) {
    let end = y + pageH;
    if (end >= bottom) end = bottom;
    else {
      const fit = breaks.filter((b) => b > y + pageH * 0.3 && b <= end);
      if (fit.length) end = fit[fit.length - 1];
    }
    const sliceH = Math.round((end - y) * scale);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceH;
    slice.getContext("2d").drawImage(canvas, 0, Math.round(y * scale), canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    if (!first) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, marginMm, 210, (end - y) / pxPerMm);
    first = false;
    y = end;
  }
  return pdf.output("blob");
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
