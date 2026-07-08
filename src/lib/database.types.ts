export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      autores: {
        Row: {
          biografia: string | null
          created_at: string
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          biografia?: string | null
          created_at?: string
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          biografia?: string | null
          created_at?: string
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      bibliotecas: {
        Row: {
          created_at: string
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      emprestimos: {
        Row: {
          created_at: string
          data_devolucao: string | null
          data_emprestimo: string
          data_prevista_devolucao: string
          exemplar_id: number
          id: number
          pessoa_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          data_prevista_devolucao: string
          exemplar_id: number
          id?: number
          pessoa_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          data_prevista_devolucao?: string
          exemplar_id?: number
          id?: number
          pessoa_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_exemplar_id_fkey"
            columns: ["exemplar_id"]
            isOneToOne: false
            referencedRelation: "exemplares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      exemplares: {
        Row: {
          biblioteca_id: number
          created_at: string
          data_aquisicao: string | null
          id: number
          livro_id: number
          numero_tombo: string | null
          status_id: number
          updated_at: string
        }
        Insert: {
          biblioteca_id: number
          created_at?: string
          data_aquisicao?: string | null
          id?: number
          livro_id: number
          numero_tombo?: string | null
          status_id: number
          updated_at?: string
        }
        Update: {
          biblioteca_id?: number
          created_at?: string
          data_aquisicao?: string | null
          id?: number
          livro_id?: number
          numero_tombo?: string | null
          status_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exemplares_biblioteca_id_fkey"
            columns: ["biblioteca_id"]
            isOneToOne: false
            referencedRelation: "bibliotecas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exemplares_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "livros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exemplares_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionalidades: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      generos: {
        Row: {
          created_at: string
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      grupo_funcionalidade: {
        Row: {
          funcionalidade_id: number
          grupo_id: number
        }
        Insert: {
          funcionalidade_id: number
          grupo_id: number
        }
        Update: {
          funcionalidade_id?: number
          grupo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "grupo_funcionalidade_funcionalidade_id_fkey"
            columns: ["funcionalidade_id"]
            isOneToOne: false
            referencedRelation: "funcionalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_funcionalidade_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          created_at: string
          descricao: string | null
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      livro_autor: {
        Row: {
          autor_id: number
          livro_id: number
        }
        Insert: {
          autor_id: number
          livro_id: number
        }
        Update: {
          autor_id?: number
          livro_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "livro_autor_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "autores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livro_autor_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "livros"
            referencedColumns: ["id"]
          },
        ]
      }
      livros: {
        Row: {
          codigo_livro: string | null
          created_at: string
          genero_id: number
          id: number
          nome: string
          resumo: string | null
          updated_at: string
        }
        Insert: {
          codigo_livro?: string | null
          created_at?: string
          genero_id: number
          id?: number
          nome: string
          resumo?: string | null
          updated_at?: string
        }
        Update: {
          codigo_livro?: string | null
          created_at?: string
          genero_id?: number
          id?: number
          nome?: string
          resumo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "livros_genero_id_fkey"
            columns: ["genero_id"]
            isOneToOne: false
            referencedRelation: "generos"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: number
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: number
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: number
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      status: {
        Row: {
          codigo: string
          created_at: string
          id: number
          nome: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: number
          nome: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      temas: {
        Row: {
          created_at: string
          id: number
          livro_id: number
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          livro_id: number
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          livro_id?: number
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "temas_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "livros"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_grupo: {
        Row: {
          grupo_id: number
          user_id: string
        }
        Insert: {
          grupo_id: number
          user_id: string
        }
        Update: {
          grupo_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attach_set_updated_at: { Args: { p_table: unknown }; Returns: undefined }
      meus_codigos: { Args: never; Returns: string[] }
      registrar_devolucao: {
        Args: { p_emprestimo_id: number }
        Returns: undefined
      }
      registrar_emprestimo: {
        Args: {
          p_data_prevista?: string
          p_exemplar_id: number
          p_pessoa_id: number
        }
        Returns: number
      }
      tem_permissao: { Args: { p_codigo: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

