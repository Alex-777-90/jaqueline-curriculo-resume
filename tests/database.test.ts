// @vitest-environment node
// Real PostgreSQL execution via PGlite; Supabase-specific auth/storage schemas are fixtures.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, test } from "vitest";
let db: PGlite;
const owner = "11111111-1111-1111-1111-111111111111";
const outsider = "22222222-2222-2222-2222-222222222222";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
 create role anon; create role authenticated;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth to anon,authenticated;
 grant execute on function auth.uid() to anon,authenticated;
 create schema storage;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id serial primary key,bucket_id text,name text);
 alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
 grant usage on schema storage to anon,authenticated;
 grant select,insert,delete on storage.objects to anon,authenticated;
 grant usage,select on all sequences in schema storage to anon,authenticated;
 insert into auth.users(id) values ('${owner}'),('${outsider}');
 `);
  await db.exec(readFileSync("supabase/01-estrutura.sql", "utf8"));
  await db.exec(readFileSync("supabase/02-conteudo-inicial.sql", "utf8"));
  await db.query("insert into public.site_editors values ($1)", [owner]);
}, 60000);
afterAll(async () => {
  await db?.close();
});
async function asRole<T>(
  role: "anon" | "authenticated",
  user: string,
  action: () => Promise<T>,
): Promise<T> {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  try {
    return await action();
  } finally {
    await db.exec("reset role");
  }
}
test("anonymous visitors can read the published CV but cannot update or upload", async () => {
  await asRole("anon", "", async () => {
    expect((await db.query("select id from public.site_content")).rows).toEqual(
      [{ id: "main" }],
    );
    await expect(
      db.exec(
        "update public.site_content set revision=revision+1 where id='main'",
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        "insert into storage.objects(bucket_id,name) values('curriculo-media','site/file.png')",
      ),
    ).rejects.toThrow();
  });
});
test("authenticated users without an editor grant cannot modify content or grant themselves access", async () => {
  await asRole("authenticated", outsider, async () => {
    expect(
      (await db.query("select * from public.site_editors")).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          "update public.site_content set revision=revision+1 returning id",
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.query("insert into public.site_editors(user_id) values ($1)", [
        outsider,
      ]),
    ).rejects.toThrow();
    await expect(
      db.exec(
        "insert into storage.objects(bucket_id,name) values('curriculo-media','site/file.png')",
      ),
    ).rejects.toThrow();
  });
});
test("editor can publish with revision checking, upload and delete media", async () => {
  await asRole("authenticated", owner, async () => {
    expect(
      (await db.query("select * from public.site_editors")).rows,
    ).toHaveLength(1);
    const result = await db.query<{ revision: number }>(
      "update public.site_content set data=jsonb_set(data,'{profile,name}','\"Jaqueline Sousa Teste\"'),revision=2 where id='main' and revision=1 returning revision",
    );
    expect(result.rows[0].revision).toBe(2);
    expect(
      (
        await db.query(
          "update public.site_content set revision=2 where id='main' and revision=1 returning id",
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.exec("update public.site_content set revision=1 where id='main'"),
    ).rejects.toThrow("revisão");
    await db.exec(
      "insert into storage.objects(bucket_id,name) values('curriculo-media','site/test.png')",
    );
    expect(
      (await db.query("delete from storage.objects returning name")).rows,
    ).toEqual([{ name: "site/test.png" }]);
    await expect(
      db.exec(
        "insert into storage.objects(bucket_id,name) values('other','site/test.png')",
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        "insert into storage.objects(bucket_id,name) values('curriculo-media','other/test.png')",
      ),
    ).rejects.toThrow();
  });
});
test("schema and seed are rerunnable without overwriting published changes; revocation is immediate", async () => {
  await db.exec(readFileSync("supabase/01-estrutura.sql", "utf8"));
  await db.exec(readFileSync("supabase/02-conteudo-inicial.sql", "utf8"));
  expect(
    (
      await db.query<{ revision: number }>(
        "select revision from public.site_content",
      )
    ).rows[0].revision,
  ).toBe(2);
  await db.query("delete from public.site_editors where user_id=$1", [owner]);
  await asRole("authenticated", owner, async () =>
    expect(
      (
        await db.query(
          "update public.site_content set revision=revision+1 returning id",
        )
      ).rows,
    ).toHaveLength(0),
  );
});
