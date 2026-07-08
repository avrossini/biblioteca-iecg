export type DadosLivro = {
  nome: string;
  codigo_livro: string;
  genero_id: number;
  resumo: string;
  autores: number[];
  temas: string[];
};

export type ResultadoLivro = { erro?: string; id?: number };
