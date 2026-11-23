// Appendix G as a one-page companion note, in the styles of the Appendix D to F builder: a title, a deck line,
// justified body paragraphs, the code and the address as a live link. Usage: node build_note.js <content.js> <out.docx> <footer>
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, HeadingLevel, Footer, PageNumber,
  ExternalHyperlink } = require("docx");

const BODY = "Cambria", MONO = "Consolas";

// inline text: *italic*
function runs(text, opts = {}) {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map(part => {
    const it = part.length > 2 && part.startsWith("*") && part.endsWith("*");
    return new TextRun({ text: it ? part.slice(1, -1) : part, ...(it ? { italics: true } : {}), ...opts });
  });
}

function block(b) {
  if (b.h1) return [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(b.h1)] })];
  if (b.sub) return [new Paragraph({ spacing: { after: 240 }, children: runs(b.sub, { italics: true, size: 22, color: "444444" }) })];
  if (b.p) return [new Paragraph({ spacing: { after: 160, line: 300 }, alignment: AlignmentType.JUSTIFIED, children: runs(b.p) })];
  if (b.code) {
    const side = Math.round((b.w || 1.6) * 96);
    return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 280, after: 160 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: fs.readFileSync(b.code), transformation: { width: side, height: side },
        altText: { title: b.alt, description: b.alt, name: "address code" } })] })];
  }
  if (b.address) return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new ExternalHyperlink({ link: b.link,
      children: [new TextRun({ text: b.address, font: MONO, size: 26, color: "1E5A86" })] })] })];
  throw new Error("unknown block " + JSON.stringify(b).slice(0, 80));
}

function build(content, out, footerText) {
  const doc = new Document({
    creator: "AI HIVE Publications editorial desk", title: content.title,
    styles: {
      default: { document: { run: { font: BODY, size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: BODY, size: 32, bold: true, color: "1A2230" },
          paragraph: { spacing: { before: 120, after: 160 }, keepNext: true, outlineLevel: 0 } },
        // the footer's size and color sit in a paragraph style as well, so the page-number field takes them in every word processor
        { id: "FooterLine", name: "Footer Line", basedOn: "Normal", run: { font: BODY, size: 16, color: "777777" } }] },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      footers: { default: new Footer({ children: [new Paragraph({ style: "FooterLine", alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: footerText + "  ·  ", size: 16, color: "777777" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "777777" })] })] }) },
      children: content.blocks.flatMap(block) }] });
  return Packer.toBuffer(doc).then(buf => fs.writeFileSync(out, buf));
}

const [, , contentFile, out, footer] = process.argv;
build(require(require("path").resolve(contentFile)), out, footer).then(() => console.log("wrote", out));
