import { Pool } from "pg";

// Lightweight PG-backed implementation that matches the small subset of Prisma API
// used by the app: `prisma.link.create`, `prisma.link.findUnique`, `prisma.link.findMany`,
// `prisma.link.update`, `prisma.link.delete`.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

const pool = new Pool({ connectionString });

export const prisma = {
  link: {
    create: async ({ data }) => {
      const code = data.code ?? Math.random().toString(36).slice(2, 8);
      const clicks = data.clicks ?? 0;
      const lastClicked = data.lastClicked ?? null;
      const createdAt = data.createdAt ?? new Date();
      const text = `INSERT INTO "Link"("code","url","clicks","lastClicked","createdAt") VALUES($1,$2,$3,$4,$5) RETURNING *`;
      const values = [code, data.url, clicks, lastClicked, createdAt];
      const res = await pool.query(text, values);
      return res.rows[0];
    },
    findUnique: async ({ where }) => {
      const code = where?.code;
      if (!code) return null;
      const res = await pool.query(`SELECT * FROM "Link" WHERE "code"=$1 LIMIT 1`, [code]);
      return res.rows[0] ?? null;
    },
    findMany: async () => {
      const res = await pool.query(`SELECT * FROM "Link" ORDER BY "createdAt" DESC`);
      return res.rows;
    },
    delete: async ({ where }) => {
      const code = where?.code;
      if (!code) return null;
      const res = await pool.query(`DELETE FROM "Link" WHERE "code"=$1 RETURNING *`, [code]);
      return res.rows[0] ?? null;
    },
    update: async ({ where, data }) => {
      const code = where?.code;
      if (!code) return null;
      const fields = [];
      const values = [];
      let i = 1;
      for (const [k, v] of Object.entries(data)) {
        // Support Prisma-like increment operator: { clicks: { increment: 1 } }
        if (v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "increment") && typeof v.increment === "number") {
          fields.push(`"${k}" = COALESCE("${k}", 0) + $${i++}`);
          values.push(v.increment);
        } else {
          fields.push(`"${k}"=$${i++}`);
          values.push(v);
        }
      }
      values.push(code);
      const text = `UPDATE "Link" SET ${fields.join(",")} WHERE "code"=$${i} RETURNING *`;
      const res = await pool.query(text, values);
      return res.rows[0] ?? null;
    },
  },
  // expose raw pool for ad-hoc queries
  _pool: pool,
};

export default prisma;
