export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined; }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      editor_documents: {
        Row: {
          comment: Json[] | null;
          content: Json;
          created: string | null;
          id: string;
          is_public: boolean | null;
          reminder: Json[] | null;
          tag: string[] | null;
          updated: string | null;
          user_id: string;
        };
        Insert: {
          comment?: Json[] | null;
          content: Json;
          created?: string | null;
          id?: string;
          is_public?: boolean | null;
          reminder?: Json[] | null;
          tag?: string[] | null;
          updated?: string | null;
          user_id: string;
        };
        Update: {
          comment?: Json[] | null;
          content?: Json;
          created?: string | null;
          id?: string;
          is_public?: boolean | null;
          reminder?: Json[] | null;
          tag?: string[] | null;
          updated?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      pgroonga_command: {
        Args:
        | { groongacommand: string; }
        | { groongacommand: string; arguments: string[]; };
        Returns: string;
      };
      pgroonga_command_escape_value: {
        Args: { value: string; };
        Returns: string;
      };
      pgroonga_condition: {
        Args: {
          query?: string;
          weights?: number[];
          scorers?: string[];
          schema_name?: string;
          index_name?: string;
          column_name?: string;
          fuzzy_max_distance_ratio?: number;
        };
        Returns: Database["public"]["CompositeTypes"]["pgroonga_condition"];
      };
      pgroonga_equal_query_text_array: {
        Args: { targets: string[]; query: string; };
        Returns: boolean;
      };
      pgroonga_equal_query_text_array_condition: {
        Args:
        | {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_equal_query_varchar_array: {
        Args: { targets: string[]; query: string; };
        Returns: boolean;
      };
      pgroonga_equal_query_varchar_array_condition: {
        Args:
        | {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_equal_text: {
        Args: { target: string; other: string; };
        Returns: boolean;
      };
      pgroonga_equal_text_condition: {
        Args:
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_equal_varchar: {
        Args: { target: string; other: string; };
        Returns: boolean;
      };
      pgroonga_equal_varchar_condition: {
        Args:
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_escape: {
        Args:
        | { value: boolean; }
        | { value: number; }
        | { value: number; }
        | { value: number; }
        | { value: number; }
        | { value: number; }
        | { value: string; }
        | { value: string; }
        | { value: string; }
        | { value: string; special_characters: string; };
        Returns: string;
      };
      pgroonga_flush: {
        Args: { indexname: unknown; };
        Returns: boolean;
      };
      pgroonga_handler: {
        Args: { "": unknown; };
        Returns: unknown;
      };
      pgroonga_highlight_html: {
        Args:
        | { target: string; keywords: string[]; }
        | { target: string; keywords: string[]; indexname: unknown; }
        | { targets: string[]; keywords: string[]; }
        | { targets: string[]; keywords: string[]; indexname: unknown; };
        Returns: string;
      };
      pgroonga_index_column_name: {
        Args:
        | { indexname: unknown; columnindex: number; }
        | { indexname: unknown; columnname: string; };
        Returns: string;
      };
      pgroonga_is_writable: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      pgroonga_list_broken_indexes: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      pgroonga_list_lagged_indexes: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      pgroonga_match_positions_byte: {
        Args:
        | { target: string; keywords: string[]; }
        | { target: string; keywords: string[]; indexname: unknown; };
        Returns: number[];
      };
      pgroonga_match_positions_character: {
        Args:
        | { target: string; keywords: string[]; }
        | { target: string; keywords: string[]; indexname: unknown; };
        Returns: number[];
      };
      pgroonga_match_term: {
        Args:
        | { target: string[]; term: string; }
        | { target: string[]; term: string; }
        | { target: string; term: string; }
        | { target: string; term: string; };
        Returns: boolean;
      };
      pgroonga_match_text_array_condition: {
        Args:
        | {
          target: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_match_text_array_condition_with_scorers: {
        Args: {
          target: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_match_text_condition: {
        Args:
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_match_text_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_match_varchar_condition: {
        Args:
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_match_varchar_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_normalize: {
        Args: { target: string; } | { target: string; normalizername: string; };
        Returns: string;
      };
      pgroonga_prefix_varchar_condition: {
        Args:
        | {
          target: string;
          conditoin: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          conditoin: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_escape: {
        Args: { query: string; };
        Returns: string;
      };
      pgroonga_query_expand: {
        Args: {
          tablename: unknown;
          termcolumnname: string;
          synonymscolumnname: string;
          query: string;
        };
        Returns: string;
      };
      pgroonga_query_extract_keywords: {
        Args: { query: string; index_name?: string; };
        Returns: string[];
      };
      pgroonga_query_text_array_condition: {
        Args:
        | {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_text_array_condition_with_scorers: {
        Args: {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_query_text_condition: {
        Args:
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_text_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_query_varchar_condition: {
        Args:
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        }
        | {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_varchar_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_regexp_text_array: {
        Args: { targets: string[]; pattern: string; };
        Returns: boolean;
      };
      pgroonga_regexp_text_array_condition: {
        Args: {
          targets: string[];
          pattern: Database["public"]["CompositeTypes"]["pgroonga_condition"];
        };
        Returns: boolean;
      };
      pgroonga_result_to_jsonb_objects: {
        Args: { result: Json; };
        Returns: Json;
      };
      pgroonga_result_to_recordset: {
        Args: { result: Json; };
        Returns: Record<string, unknown>[];
      };
      pgroonga_score: {
        Args:
        | { row: Record<string, unknown>; }
        | { tableoid: unknown; ctid: unknown; };
        Returns: number;
      };
      pgroonga_set_writable: {
        Args: { newwritable: boolean; };
        Returns: boolean;
      };
      pgroonga_snippet_html: {
        Args: { target: string; keywords: string[]; width?: number; };
        Returns: string[];
      };
      pgroonga_table_name: {
        Args: { indexname: unknown; };
        Returns: string;
      };
      pgroonga_tokenize: {
        Args: { target: string; };
        Returns: Json[];
      };
      pgroonga_vacuum: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      pgroonga_wal_apply: {
        Args: Record<PropertyKey, never> | { indexname: unknown; };
        Returns: number;
      };
      pgroonga_wal_set_applied_position: {
        Args:
        | Record<PropertyKey, never>
        | { block: number; offset: number; }
        | { indexname: unknown; }
        | { indexname: unknown; block: number; offset: number; };
        Returns: boolean;
      };
      pgroonga_wal_status: {
        Args: Record<PropertyKey, never>;
        Returns: {
          name: string;
          oid: unknown;
          current_block: number;
          current_offset: number;
          current_size: number;
          last_block: number;
          last_offset: number;
          last_size: number;
        }[];
      };
      pgroonga_wal_truncate: {
        Args: Record<PropertyKey, never> | { indexname: unknown; };
        Returns: number;
      };
      search_documents_combined: {
        Args: { tags?: string[]; words?: string[]; phrases?: string[]; };
        Returns: {
          comment: Json[] | null;
          content: Json;
          created: string | null;
          id: string;
          is_public: boolean | null;
          reminder: Json[] | null;
          tag: string[] | null;
          updated: string | null;
          user_id: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      pgroonga_condition: {
        query: string | null;
        weigths: number[] | null;
        scorers: string[] | null;
        schema_name: string | null;
        index_name: string | null;
        column_name: string | null;
        fuzzy_max_distance_ratio: number | null;
      };
      pgroonga_full_text_search_condition: {
        query: string | null;
        weigths: number[] | null;
        indexname: string | null;
      };
      pgroonga_full_text_search_condition_with_scorers: {
        query: string | null;
        weigths: number[] | null;
        scorers: string[] | null;
        indexname: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals; },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals; },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals; },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals; },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals; },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
