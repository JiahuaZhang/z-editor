export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      editor_documents: {
        Row: {
          alert: Json[] | null
          comment: Json[] | null
          content: Json
          created: string | null
          id: string
          is_public: boolean | null
          tag: string[] | null
          updated: string | null
          user_id: string
        }
        Insert: {
          alert?: Json[] | null
          comment?: Json[] | null
          content: Json
          created?: string | null
          id?: string
          is_public?: boolean | null
          tag?: string[] | null
          updated?: string | null
          user_id: string
        }
        Update: {
          alert?: Json[] | null
          comment?: Json[] | null
          content?: Json
          created?: string | null
          id?: string
          is_public?: boolean | null
          tag?: string[] | null
          updated?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_filtered_tag_statistics: {
        Args: { selected_tags: string[] }
        Returns: {
          document_count: number
          tag_name: string
        }[]
      }
      get_tag_statistics: {
        Args: never
        Returns: {
          document_count: number
          tag_name: string
        }[]
      }
      pgroonga_command:
        | {
            Args: { arguments: string[]; groongacommand: string }
            Returns: string
          }
        | { Args: { groongacommand: string }; Returns: string }
      pgroonga_command_escape_value: {
        Args: { value: string }
        Returns: string
      }
      pgroonga_condition: {
        Args: {
          column_name?: string
          fuzzy_max_distance_ratio?: number
          index_name?: string
          query?: string
          schema_name?: string
          scorers?: string[]
          weights?: number[]
        }
        Returns: Database["public"]["CompositeTypes"]["pgroonga_condition"]
        SetofOptions: {
          from: "*"
          to: "pgroonga_condition"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pgroonga_equal_query_text_array: {
        Args: { query: string; targets: string[] }
        Returns: boolean
      }
      pgroonga_equal_query_text_array_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              targets: string[]
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              targets: string[]
            }
            Returns: boolean
          }
      pgroonga_equal_query_varchar_array: {
        Args: { query: string; targets: string[] }
        Returns: boolean
      }
      pgroonga_equal_query_varchar_array_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              targets: string[]
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              targets: string[]
            }
            Returns: boolean
          }
      pgroonga_equal_text: {
        Args: { other: string; target: string }
        Returns: boolean
      }
      pgroonga_equal_text_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_equal_varchar: {
        Args: { other: string; target: string }
        Returns: boolean
      }
      pgroonga_equal_varchar_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_escape:
        | {
            Args: { value: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { special_characters: string; value: string }
            Returns: string
          }
        | {
            Args: { value: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { value: boolean }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.pgroonga_escape(value => bool), public.pgroonga_escape(value => int8), public.pgroonga_escape(value => int2), public.pgroonga_escape(value => int4), public.pgroonga_escape(value => text), public.pgroonga_escape(value => float4), public.pgroonga_escape(value => float8), public.pgroonga_escape(value => timestamp), public.pgroonga_escape(value => timestamptz). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      pgroonga_flush: { Args: { indexname: unknown }; Returns: boolean }
      pgroonga_highlight_html:
        | {
            Args: { indexname: unknown; keywords: string[]; targets: string[] }
            Returns: string[]
          }
        | { Args: { keywords: string[]; targets: string[] }; Returns: string[] }
        | {
            Args: { indexname: unknown; keywords: string[]; target: string }
            Returns: string
          }
        | { Args: { keywords: string[]; target: string }; Returns: string }
      pgroonga_index_column_name:
        | { Args: { columnname: string; indexname: unknown }; Returns: string }
        | { Args: { columnindex: number; indexname: unknown }; Returns: string }
      pgroonga_is_writable: { Args: never; Returns: boolean }
      pgroonga_list_broken_indexes: { Args: never; Returns: string[] }
      pgroonga_list_lagged_indexes: { Args: never; Returns: string[] }
      pgroonga_match_positions_byte:
        | {
            Args: { indexname: unknown; keywords: string[]; target: string }
            Returns: number[]
          }
        | { Args: { keywords: string[]; target: string }; Returns: number[] }
      pgroonga_match_positions_character:
        | {
            Args: { indexname: unknown; keywords: string[]; target: string }
            Returns: number[]
          }
        | { Args: { keywords: string[]; target: string }; Returns: number[] }
      pgroonga_match_term:
        | { Args: { target: string[]; term: string }; Returns: boolean }
        | { Args: { target: string; term: string }; Returns: boolean }
        | { Args: { target: string[]; term: string }; Returns: boolean }
        | { Args: { target: string; term: string }; Returns: boolean }
      pgroonga_match_text_array_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string[]
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string[]
            }
            Returns: boolean
          }
      pgroonga_match_text_array_condition_with_scorers: {
        Args: {
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"]
          target: string[]
        }
        Returns: boolean
      }
      pgroonga_match_text_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_match_text_condition_with_scorers: {
        Args: {
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"]
          target: string
        }
        Returns: boolean
      }
      pgroonga_match_varchar_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_match_varchar_condition_with_scorers: {
        Args: {
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"]
          target: string
        }
        Returns: boolean
      }
      pgroonga_normalize:
        | { Args: { normalizername: string; target: string }; Returns: string }
        | { Args: { target: string }; Returns: string }
      pgroonga_prefix_varchar_condition:
        | {
            Args: {
              conditoin: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              conditoin: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_query_escape: { Args: { query: string }; Returns: string }
      pgroonga_query_expand: {
        Args: {
          query: string
          synonymscolumnname: string
          tablename: unknown
          termcolumnname: string
        }
        Returns: string
      }
      pgroonga_query_extract_keywords: {
        Args: { index_name?: string; query: string }
        Returns: string[]
      }
      pgroonga_query_text_array_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              targets: string[]
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              targets: string[]
            }
            Returns: boolean
          }
      pgroonga_query_text_array_condition_with_scorers: {
        Args: {
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"]
          targets: string[]
        }
        Returns: boolean
      }
      pgroonga_query_text_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_query_text_condition_with_scorers: {
        Args: {
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"]
          target: string
        }
        Returns: boolean
      }
      pgroonga_query_varchar_condition:
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_condition"]
              target: string
            }
            Returns: boolean
          }
        | {
            Args: {
              condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"]
              target: string
            }
            Returns: boolean
          }
      pgroonga_query_varchar_condition_with_scorers: {
        Args: {
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"]
          target: string
        }
        Returns: boolean
      }
      pgroonga_regexp_text_array: {
        Args: { pattern: string; targets: string[] }
        Returns: boolean
      }
      pgroonga_regexp_text_array_condition: {
        Args: {
          pattern: Database["public"]["CompositeTypes"]["pgroonga_condition"]
          targets: string[]
        }
        Returns: boolean
      }
      pgroonga_result_to_jsonb_objects: {
        Args: { result: Json }
        Returns: Json
      }
      pgroonga_result_to_recordset: {
        Args: { result: Json }
        Returns: Record<string, unknown>[]
      }
      pgroonga_score:
        | { Args: { row: Record<string, unknown> }; Returns: number }
        | { Args: { ctid: unknown; tableoid: unknown }; Returns: number }
      pgroonga_set_writable: {
        Args: { newwritable: boolean }
        Returns: boolean
      }
      pgroonga_snippet_html: {
        Args: { keywords: string[]; target: string; width?: number }
        Returns: string[]
      }
      pgroonga_table_name: { Args: { indexname: unknown }; Returns: string }
      pgroonga_tokenize: {
        Args: { options: string[]; target: string }
        Returns: Json[]
      }
      pgroonga_vacuum: { Args: never; Returns: boolean }
      pgroonga_wal_apply:
        | { Args: { indexname: unknown }; Returns: number }
        | { Args: never; Returns: number }
      pgroonga_wal_set_applied_position:
        | { Args: { indexname: unknown }; Returns: boolean }
        | {
            Args: { block: number; indexname: unknown; offset: number }
            Returns: boolean
          }
        | { Args: never; Returns: boolean }
        | { Args: { block: number; offset: number }; Returns: boolean }
      pgroonga_wal_status: {
        Args: never
        Returns: {
          current_block: number
          current_offset: number
          current_size: number
          last_block: number
          last_offset: number
          last_size: number
          name: string
          oid: unknown
        }[]
      }
      pgroonga_wal_truncate:
        | { Args: { indexname: unknown }; Returns: number }
        | { Args: never; Returns: number }
      search_document_content: {
        Args: { phrase_array?: string[]; word_array?: string[] }
        Returns: string[]
      }
      search_documents_advanced: {
        Args: {
          alert_after?: string
          alert_at?: string
          alert_before?: string
          alert_from?: string
          alert_to?: string
          created_after?: string
          created_at?: string
          created_before?: string
          created_from?: string
          created_to?: string
          limit_count?: number
          offset_count?: number
          phrase_array?: string[]
          tag_array?: string[]
          updated_after?: string
          updated_at?: string
          updated_before?: string
          updated_from?: string
          updated_to?: string
          word_array?: string[]
        }
        Returns: {
          alert: Json[] | null
          comment: Json[] | null
          content: Json
          created: string | null
          id: string
          is_public: boolean | null
          tag: string[] | null
          updated: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "editor_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_documents_combined: {
        Args: { phrases?: string[]; tags?: string[]; words?: string[] }
        Returns: {
          alert: Json[] | null
          comment: Json[] | null
          content: Json
          created: string | null
          id: string
          is_public: boolean | null
          tag: string[] | null
          updated: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "editor_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      pgroonga_condition: {
        query: string | null
        weigths: number[] | null
        scorers: string[] | null
        schema_name: string | null
        index_name: string | null
        column_name: string | null
        fuzzy_max_distance_ratio: number | null
      }
      pgroonga_full_text_search_condition: {
        query: string | null
        weigths: number[] | null
        indexname: string | null
      }
      pgroonga_full_text_search_condition_with_scorers: {
        query: string | null
        weigths: number[] | null
        scorers: string[] | null
        indexname: string | null
      }
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
  public: {
    Enums: {},
  },
} as const
