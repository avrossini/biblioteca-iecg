import { describe, it, expect } from "vitest";
import { ehConexaoLocal } from "../../scripts/migracao/migrar";

describe("ehConexaoLocal", () => {
  it("reconhece conexões locais", () => {
    expect(ehConexaoLocal("postgresql://postgres:postgres@127.0.0.1:54322/postgres")).toBe(true);
    expect(ehConexaoLocal("postgresql://postgres:postgres@localhost:5432/postgres")).toBe(true);
  });

  it("classifica o Supabase Cloud como remoto (exige SSL)", () => {
    expect(ehConexaoLocal("postgresql://postgres:pw@db.abcdefgh.supabase.co:5432/postgres?sslmode=require")).toBe(false);
    expect(ehConexaoLocal("postgresql://postgres.abcdefgh:pw@aws-0-sa-east-1.pooler.supabase.com:5432/postgres")).toBe(false);
  });
});
