import { MangaPage, TranslationBlock } from '@/store/useMangaStore';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs';

const formatBlockTxt = (block: TranslationBlock): string => {
  switch (block.type) {
    case 'rect': return `[RET] ${block.text}`;
    case 'outside': return `{FORA} ${block.text}`;
    case 'thought': return `(PEN) ${block.text}`;
    case 'double': return `//DBL// ${block.text}`;
    default: return `      ${block.text}`;
  }
};

const generateTxtContent = (pages: MangaPage[]) => {
  const header = `==========================================================
MANG-AI TRANSLATOR - EXPORTAÇÃO DE CAPÍTULO (TXT)
Data: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}
----------------------------------------------------------
LEGENDA DE SINAIS:
[RET]   - Balão Retangular / Caixa de Texto
{FORA}  - Texto fora de balão (onomatopeia, notas)
(PEN)   - Pensamento
//DBL// - Balão Duplo (fala contínua)
        - Fala Padrão
==========================================================\n\n`;

  const content = pages.map((page, index) => {
    const pageNum = (index + 1).toString().padStart(3, '0');
    const pageTitle = `>>> PÁGINA ${pageNum} [${page.name}] <<<`;
    
    let pageBody = "";
    if (page.blocks && page.blocks.length > 0) {
      pageBody = page.blocks.map(formatBlockTxt).join('\n');
    } else if (page.status === 'completed' && !page.blocks?.length) {
      pageBody = "(Página marcada como sem texto)";
    } else {
      pageBody = "(Tradução pendente ou rascunho não revisado)";
    }

    return `${pageTitle}\n\n${pageBody}\n\n`;
  }).join('----------------------------------------------------------\n\n');

  return header + content;
};

const generateDocxBlob = async (pages: MangaPage[]) => {
  const children: any[] = [
    new Paragraph({
      text: "MANG-AI TRANSLATOR - EXPORTAÇÃO",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Data: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({ text: "LEGENDA DE SINAIS:", bold: true, size: 20 }),
      ],
    }),
    new Paragraph({ text: "[RET] - Balão Retangular / Caixa de Texto" }),
    new Paragraph({ text: "{FORA} - Texto fora de balão (onomatopeia, notas)" }),
    new Paragraph({ text: "(PEN) - Pensamento" }),
    new Paragraph({ text: "//DBL// - Balão Duplo (fala contínua)" }),
    new Paragraph({ text: "" }),
    new Paragraph({ text: "==========================================================", alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "" }),
  ];

  pages.forEach((page, index) => {
    const pageNum = (index + 1).toString().padStart(3, '0');
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `>>> PÁGINA ${pageNum} [${page.name}] <<<`, bold: true, size: 24, color: "2D2D2D" }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );

    if (page.blocks && page.blocks.length > 0) {
      page.blocks.forEach(block => {
        let prefix = "";
        let color = "000000";
        switch (block.type) {
          case 'rect': prefix = "[RET] "; color = "2E7D32"; break;
          case 'outside': prefix = "{FORA} "; color = "1565C0"; break;
          case 'thought': prefix = "(PEN) "; color = "7B1FA2"; break;
          case 'double': prefix = "//DBL// "; color = "C62828"; break;
          default: prefix = "      ";
        }
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: prefix, bold: true, color }),
              new TextRun({ text: block.text }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "(Página sem texto)", italics: true, color: "999999" }),
          ],
        })
      );
    }

    if (index < pages.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBuffer(doc);
};

export const exportProject = async (pages: MangaPage[], format: 'txt' | 'docx'): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultPath = `traducao_manga_${timestamp}.${format}`;

    const filePath = await save({
      filters: [{
        name: format === 'txt' ? 'Arquivo de Texto' : 'Documento Word',
        extensions: [format]
      }],
      defaultPath: defaultPath,
      title: 'Salvar Tradução'
    });

    if (!filePath) return false;

    if (format === 'txt') {
      const content = generateTxtContent(pages);
      await writeTextFile(filePath, content);
    } else {
      const content = await generateDocxBlob(pages);
      await writeFile(filePath, content);
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
    throw error;
  }
};
