import Database from "@tauri-apps/plugin-sql";
import { MangaPage } from "@/store/useMangaStore";

const DB_PATH = "sqlite:mangai.db";

export interface DBProject {
  id: string;
  name: string;
  chapter: string;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  progress?: number;
}

export const dbService = {
  async getDb() {
    return await Database.load(DB_PATH);
  },

  async createProject(name: string, chapter: string): Promise<string> {
    const db = await this.getDb();
    const id = Math.random().toString(36).substring(7);
    await db.execute(
      "INSERT INTO projects (id, name, chapter, status) VALUES ($1, $2, $3, $4)",
      [id, name, chapter, 'in_progress']
    );
    return id;
  },

  async getProjects(): Promise<DBProject[]> {
    const db = await this.getDb();
    const projects = await db.select<any[]>(`
      SELECT p.*, 
      (SELECT COUNT(*) FROM pages WHERE project_id = p.id AND status = 'completed') as completed_pages,
      (SELECT COUNT(*) FROM pages WHERE project_id = p.id) as total_pages
      FROM projects p
      ORDER BY updated_at DESC
    `);
    
    return projects.map(p => ({
      ...p,
      progress: p.total_pages > 0 ? (p.completed_pages / p.total_pages) * 100 : 0
    }));
  },

  async getProjectPages(projectId: string): Promise<MangaPage[]> {
    const db = await this.getDb();
    const pages = await db.select<any[]>(
      "SELECT * FROM pages WHERE project_id = $1 ORDER BY order_index ASC",
      [projectId]
    );

    const fullPages: MangaPage[] = [];
    for (const page of pages) {
      const blocks = await db.select<any[]>(
        "SELECT * FROM blocks WHERE page_id = $1 ORDER BY order_index ASC",
        [page.id]
      );
      fullPages.push({
        ...page,
        url: page.path, // O path salvo é o caminho do cache
        blocks: blocks.map(b => ({ id: b.id, text: b.text, type: b.type }))
      });
    }
    return fullPages;
  },

  async savePage(projectId: string, page: MangaPage, orderIndex: number) {
    const db = await this.getDb();
    await db.execute(
      "INSERT OR REPLACE INTO pages (id, project_id, path, name, status, order_index) VALUES ($1, $2, $3, $4, $5, $6)",
      [page.id, projectId, page.url, page.name, page.status, orderIndex]
    );

    // Remove blocos antigos para evitar lixo
    await db.execute("DELETE FROM blocks WHERE page_id = $1", [page.id]);

    if (page.blocks) {
      for (let i = 0; i < page.blocks.length; i++) {
        const block = page.blocks[i];
        await db.execute(
          "INSERT INTO blocks (id, page_id, text, type, order_index) VALUES ($1, $2, $3, $4, $5)",
          [block.id, page.id, block.text, block.type, i]
        );
      }
    }
  }
};