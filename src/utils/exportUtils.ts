import { MangaPage, TranslationBlock, BlockType } from '@/store/useMangaStore';

const formatBlock = (block: TranslationBlock): string => {
  switch (block.type) {
    case 'rect': return `[] ${block.text}`;
    case 'outside': return `{ ${block.text} }`;
    case 'thought': return `( ${block.text} )`;
    case 'double': return `// ${block.text}`;
    default: return block.text;
  }
};

export const exportToTxt = (pages: MangaPage[]) => {
  const content = pages.map((page, index) => {
    const pageNum = (index + 1).toString().padStart(2, '0');
    const pageText = page.blocks.length > 0 
      ? page.blocks.map(formatBlock).join('\n')
      : (page.translation || '(Sem tradução)');

    return `=== PÁGINA ${pageNum} (${page.name}) ===\n\n${pageText}\n\n`;
  }).join('---\n\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `traducao_capitulo_${new Date().getTime()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};