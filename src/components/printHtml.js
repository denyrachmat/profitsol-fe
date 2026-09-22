// Prints an HTML fragment through a hidden iframe so it works inside the SPA
// without popups (popup blockers) and without navigating away from the page.
export function printHtml({ title = "", body = "", styles = "" }) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });

  const baseStyles = `
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
    .print-title { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
    .print-meta { color: #555; font-size: 12px; margin-bottom: 16px; }
    @page { margin: 16mm; }
  `;

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8">` +
      `<title>${escapeHtml(title)}</title>` +
      `<style>${baseStyles}${styles}</style>` +
      `</head><body>${body}</body></html>`
  );
  doc.close();

  let done = false;
  const trigger = () => {
    if (done) return;
    done = true;
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1000);
    }
  };

  // Give written content (especially images) a moment to load before printing.
  if (iframe.contentWindow.document.readyState === "complete") {
    setTimeout(trigger, 200);
  } else {
    iframe.addEventListener("load", () => setTimeout(trigger, 200), {
      once: true,
    });
    // Safety net: if `load` never fires (e.g. a blocked image), still print.
    setTimeout(trigger, 2000);
  }
}

export function escapeHtml(str) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
