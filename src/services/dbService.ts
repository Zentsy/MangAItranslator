import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { MangaPage } from "@/store/useMangaStore";

const DB_PATH = "sqlite:mangai.db";
const ASSET_PROTOCOL_PATTERN = /^(asset:|https?:\/\/asset\.localhost)/i;

const normalizeStoredPath = (path: string) => path.replace(/\\/g, "/");

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) {
    return null;
  }

  if (ASSET_PROTOCOL_PATTERN.test(path)) {
    return path;
  }

  return convertFileSrc(normalizeStoredPath(path));
};

export interface DBProject {
  id: string;
  name: string;
  chapter: string;
  status: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  progress?: number;
  thumbnail_path?: string | null;
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
      [id, name, chapter, "in_progress"]
    );
    return id;
  },

  async getProjects(): Promise<DBProject[]> {
    const db = await this.getDb();
    const projects = await db.select<any[]>(`
      SELECT p.*,
      (SELECT path FROM pages WHERE project_id = p.id ORDER BY order_index ASC LIMIT 1) as thumbnail_path,
      (SELECT COUNT(*) FROM pages WHERE project_id = p.id AND status = 'completed') as completed_pages,
      (SELECT COUNT(*) FROM pages WHERE project_id = p.id) as total_pages
      FROM projects p
      ORDER BY updated_at DESC
    `);

    return projects.map((project) => ({
      ...project,
      progress: project.total_pages > 0 ? (project.completed_pages / project.total_pages) * 100 : 0,
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
        id: page.id,
        url: resolveAssetUrl(page.path) || "",
        path: page.path,
        name: page.name,
        translation: "",
        status: page.status,
        blocks: blocks.map((block) => ({ id: block.id, text: block.text, type: block.type })),
      });
    }

    return fullPages;
  },

  async savePage(projectId: string, page: MangaPage, orderIndex: number) {
    await invoke("save_page_atomic", {
      projectId,
      orderIndex,
      page: {
        id: page.id,
        path: page.path,
        name: page.name,
        status: page.status,
        blocks: page.blocks ?? [],
      },
    });
  },

  async deleteProject(id: string) {
    await invoke("delete_project_data", { projectId: id });
  },

  async wipeAllData() {
    await invoke("wipe_all_data");
  },

  async updateProjectStatus(id: string, status: "in_progress" | "completed") {
    const db = await this.getDb();
    await db.execute(
      "UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [status, id]
    );
  },
};
