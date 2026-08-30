const paintAttributes = ["fill", "stroke", "stop-color"] as const;
const paintProperties: Record<(typeof paintAttributes)[number], string> = {
  fill: "fill",
  stroke: "stroke",
  "stop-color": "stop-color",
};

function usesVariable(value: string | null): boolean {
  return Boolean(value && value.includes("var("));
}

function resolvePaint(source: Element, target: Element): void {
  const computed = window.getComputedStyle(source);
  for (const attribute of paintAttributes) {
    if (usesVariable(target.getAttribute(attribute))) {
      target.setAttribute(attribute, computed.getPropertyValue(paintProperties[attribute]));
    }
  }
  if (usesVariable(target.getAttribute("font-family"))) {
    target.setAttribute("font-family", computed.fontFamily);
  }
  const inlineStyle = target.getAttribute("style");
  if (usesVariable(inlineStyle)) {
    target.setAttribute(
      "style",
      `fill:${computed.fill};stroke:${computed.stroke};font-family:${computed.fontFamily};font-size:${computed.fontSize};`,
    );
  }
  if (target instanceof SVGElement && usesVariable(target.style.fontFamily)) {
    target.style.fontFamily = computed.fontFamily;
  }
}

export function serializeSvg(svg: SVGSVGElement, background: string): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const sourceNodes = svg.querySelectorAll("*");
  const cloneNodes = clone.querySelectorAll("*");
  sourceNodes.forEach((node, index) => resolvePaint(node, cloneNodes[index]));
  const width = svg.clientWidth || Number(svg.getAttribute("width")) || 800;
  const height = svg.clientHeight || Number(svg.getAttribute("height")) || 400;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.style.fontFamily = window.getComputedStyle(svg).fontFamily;
  const backdrop = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  backdrop.setAttribute("width", "100%");
  backdrop.setAttribute("height", "100%");
  backdrop.setAttribute("fill", background);
  clone.insertBefore(backdrop, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function svgTextToPng(svgText: string, width: number, height: number, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const source = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(source);
        reject(new Error("The picture could not be drawn."));
        return;
      }
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(source);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The picture could not be saved."))), "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("The picture could not be drawn."));
    };
    image.src = source;
  });
}

export function safeFileName(text: string): string {
  return text.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "plot";
}
