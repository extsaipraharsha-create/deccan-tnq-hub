export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string | null;
          action_type: string | null;
          details: string | null;
          field_changed: string | null;
          id: string;
          new_value: string | null;
          old_value: string | null;
          target: string | null;
          timestamp: string | null;
          user_id: string | null;
        };
        Insert: {
          action?: string | null;
          action_type?: string | null;
          details?: string | null;
          field_changed?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          target?: string | null;
          timestamp?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string | null;
          action_type?: string | null;
          details?: string | null;
          field_changed?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          target?: string | null;
          timestamp?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      admin_sources: {
        Row: {
          contributor_id: string | null;
          created_at: string;
          id: string;
          project_id: string | null;
          source_type: string | null;
          uploaded_by: string | null;
          url: string | null;
        };
        Insert: {
          contributor_id?: string | null;
          created_at?: string;
          id?: string;
          project_id?: string | null;
          source_type?: string | null;
          uploaded_by?: string | null;
          url?: string | null;
        };
        Update: {
          contributor_id?: string | null;
          created_at?: string;
          id?: string;
          project_id?: string | null;
          source_type?: string | null;
          uploaded_by?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_sources_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      contributor_achievements: {
        Row: {
          achievement_type: string;
          contributor_id: string | null;
          earned_at: string;
          id: string;
        };
        Insert: {
          achievement_type?: string;
          contributor_id?: string | null;
          earned_at?: string;
          id?: string;
        };
        Update: {
          achievement_type?: string;
          contributor_id?: string | null;
          earned_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      contributor_progress: {
        Row: {
          completed_at: string | null;
          contributor_id: string | null;
          id: string;
          learning_path_id: string | null;
          module_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          contributor_id?: string | null;
          id?: string;
          learning_path_id?: string | null;
          module_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          contributor_id?: string | null;
          id?: string;
          learning_path_id?: string | null;
          module_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contributor_progress_learning_path_id_fkey";
            columns: ["learning_path_id"];
            isOneToOne: false;
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributor_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_path_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      contributors: {
        Row: {
          id: string;
          last_active_at: string | null;
          learning_path_id: string | null;
          onboarding_stage: number | null;
          onboarding_status: string | null;
          playground_id: string | null;
          projects: string[] | null;
          sme_id: string | null;
        };
        Insert: {
          id: string;
          last_active_at?: string | null;
          learning_path_id?: string | null;
          onboarding_stage?: number | null;
          onboarding_status?: string | null;
          playground_id?: string | null;
          projects?: string[] | null;
          sme_id?: string | null;
        };
        Update: {
          id?: string;
          last_active_at?: string | null;
          learning_path_id?: string | null;
          onboarding_stage?: number | null;
          onboarding_status?: string | null;
          playground_id?: string | null;
          projects?: string[] | null;
          sme_id?: string | null;
        };
        Relationships: [];
      };
      learning_path_items: {
        Row: {
          created_at: string;
          created_by: string | null;
          deccanexperts_url: string | null;
          display_order: number;
          id: string;
          is_live: boolean;
          last_updated: string;
          last_updated_by: string | null;
          live_since: string | null;
          name: string;
          production_url: string | null;
          project_id: string;
          user_url: string | null;
          version: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          deccanexperts_url?: string | null;
          display_order?: number;
          id?: string;
          is_live?: boolean;
          last_updated?: string;
          last_updated_by?: string | null;
          live_since?: string | null;
          name: string;
          production_url?: string | null;
          project_id: string;
          user_url?: string | null;
          version?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          deccanexperts_url?: string | null;
          display_order?: number;
          id?: string;
          is_live?: boolean;
          last_updated?: string;
          last_updated_by?: string | null;
          live_since?: string | null;
          name?: string;
          production_url?: string | null;
          project_id?: string;
          user_url?: string | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_path_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_path_modules: {
        Row: {
          completion_criteria: string | null;
          created_at: string;
          estimated_minutes: number | null;
          id: string;
          learning_path_id: string | null;
          order_index: number;
          title: string;
          type: string;
        };
        Insert: {
          completion_criteria?: string | null;
          created_at?: string;
          estimated_minutes?: number | null;
          id?: string;
          learning_path_id?: string | null;
          order_index?: number;
          title?: string;
          type?: string;
        };
        Update: {
          completion_criteria?: string | null;
          created_at?: string;
          estimated_minutes?: number | null;
          id?: string;
          learning_path_id?: string | null;
          order_index?: number;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_path_modules_learning_path_id_fkey";
            columns: ["learning_path_id"];
            isOneToOne: false;
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_paths: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          display_order: number | null;
          id: string;
          is_live: boolean | null;
          last_updated: string | null;
          last_updated_by: string | null;
          live_since: string | null;
          name: string;
          production_url: string | null;
          project_id: string | null;
          user_url: string | null;
          version: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          display_order?: number | null;
          id?: string;
          is_live?: boolean | null;
          last_updated?: string | null;
          last_updated_by?: string | null;
          live_since?: string | null;
          name: string;
          production_url?: string | null;
          project_id?: string | null;
          user_url?: string | null;
          version?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          display_order?: number | null;
          id?: string;
          is_live?: boolean | null;
          last_updated?: string | null;
          last_updated_by?: string | null;
          live_since?: string | null;
          name?: string;
          production_url?: string | null;
          project_id?: string | null;
          user_url?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "learning_paths_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      newcomer_resources: {
        Row: {
          doc_label: string | null;
          doc_url: string | null;
          id: string;
          last_updated: string | null;
          last_updated_by: string | null;
          notes: string | null;
          poc_user_id: string | null;
          project_id: string | null;
          video_label: string | null;
          video_url: string | null;
        };
        Insert: {
          doc_label?: string | null;
          doc_url?: string | null;
          id?: string;
          last_updated?: string | null;
          last_updated_by?: string | null;
          notes?: string | null;
          poc_user_id?: string | null;
          project_id?: string | null;
          video_label?: string | null;
          video_url?: string | null;
        };
        Update: {
          doc_label?: string | null;
          doc_url?: string | null;
          id?: string;
          last_updated?: string | null;
          last_updated_by?: string | null;
          notes?: string | null;
          poc_user_id?: string | null;
          project_id?: string | null;
          video_label?: string | null;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "newcomer_resources_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      playground_content_items: {
        Row: {
          component_name: string;
          id: string;
          last_updated: string;
          last_updated_by: string | null;
          notes: string | null;
          owner_id: string | null;
          playground_id: string | null;
          status: string;
        };
        Insert: {
          component_name?: string;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          playground_id?: string | null;
          status?: string;
        };
        Update: {
          component_name?: string;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          playground_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "playground_content_items_playground_id_fkey";
            columns: ["playground_id"];
            isOneToOne: false;
            referencedRelation: "playgrounds";
            referencedColumns: ["id"];
          },
        ];
      };
      playground_documents: {
        Row: {
          file_size: number | null;
          id: string;
          name: string;
          playground_id: string | null;
          type: string | null;
          uploaded_at: string;
          uploaded_by: string | null;
          url: string;
          version_number: string | null;
        };
        Insert: {
          file_size?: number | null;
          id?: string;
          name?: string;
          playground_id?: string | null;
          type?: string | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
          url?: string;
          version_number?: string | null;
        };
        Update: {
          file_size?: number | null;
          id?: string;
          name?: string;
          playground_id?: string | null;
          type?: string | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
          url?: string;
          version_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "playground_documents_playground_id_fkey";
            columns: ["playground_id"];
            isOneToOne: false;
            referencedRelation: "playgrounds";
            referencedColumns: ["id"];
          },
        ];
      };
      playgrounds: {
        Row: {
          access_type: string | null;
          access_url: string | null;
          active_users_count: number | null;
          content_owner_id: string | null;
          content_url: string | null;
          created_at: string | null;
          created_by: string | null;
          dashboard_url: string | null;
          deccanexperts_url: string | null;
          description: string | null;
          display_order: number | null;
          docs_url: string | null;
          estimated_duration: string | null;
          id: string;
          is_live: boolean | null;
          last_updated: string | null;
          last_updated_by: string | null;
          learning_objectives: string[] | null;
          learning_path_id: string | null;
          live_since: string | null;
          name: string;
          playground_id: string | null;
          playground_url: string | null;
          progress_percent: number | null;
          project_id: string | null;
          reviewer_ids: string[] | null;
          sme_owner_id: string | null;
          status: string | null;
          target_go_live: string | null;
          version: string | null;
          version_number: string | null;
          workflow_stage: string | null;
        };
        Insert: {
          access_type?: string | null;
          access_url?: string | null;
          active_users_count?: number | null;
          content_owner_id?: string | null;
          content_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          dashboard_url?: string | null;
          deccanexperts_url?: string | null;
          description?: string | null;
          display_order?: number | null;
          docs_url?: string | null;
          estimated_duration?: string | null;
          id?: string;
          is_live?: boolean | null;
          last_updated?: string | null;
          last_updated_by?: string | null;
          learning_objectives?: string[] | null;
          learning_path_id?: string | null;
          live_since?: string | null;
          name: string;
          playground_id?: string | null;
          playground_url?: string | null;
          progress_percent?: number | null;
          project_id?: string | null;
          reviewer_ids?: string[] | null;
          sme_owner_id?: string | null;
          status?: string | null;
          target_go_live?: string | null;
          version?: string | null;
          version_number?: string | null;
          workflow_stage?: string | null;
        };
        Update: {
          access_type?: string | null;
          access_url?: string | null;
          active_users_count?: number | null;
          content_owner_id?: string | null;
          content_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          dashboard_url?: string | null;
          deccanexperts_url?: string | null;
          description?: string | null;
          display_order?: number | null;
          docs_url?: string | null;
          estimated_duration?: string | null;
          id?: string;
          is_live?: boolean | null;
          last_updated?: string | null;
          last_updated_by?: string | null;
          learning_objectives?: string[] | null;
          learning_path_id?: string | null;
          live_since?: string | null;
          name?: string;
          playground_id?: string | null;
          playground_url?: string | null;
          progress_percent?: number | null;
          project_id?: string | null;
          reviewer_ids?: string[] | null;
          sme_owner_id?: string | null;
          status?: string | null;
          target_go_live?: string | null;
          version?: string | null;
          version_number?: string | null;
          workflow_stage?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "playgrounds_learning_path_id_fkey";
            columns: ["learning_path_id"];
            isOneToOne: false;
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "playgrounds_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          first_login: boolean | null;
          id: string;
          last_active: string | null;
          name: string | null;
          photo_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          first_login?: boolean | null;
          id: string;
          last_active?: string | null;
          name?: string | null;
          photo_url?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          first_login?: boolean | null;
          id?: string;
          last_active?: string | null;
          name?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
      project_co_owners: {
        Row: {
          added_at: string | null;
          id: string;
          project_id: string | null;
          user_id: string | null;
          working_on: string | null;
        };
        Insert: {
          added_at?: string | null;
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          working_on?: string | null;
        };
        Update: {
          added_at?: string | null;
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          working_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_co_owners_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_links: {
        Row: {
          added_at: string | null;
          added_by: string | null;
          id: string;
          label: string | null;
          link_type: string | null;
          project_id: string | null;
          updated_at: string | null;
          updated_by: string | null;
          url: string | null;
        };
        Insert: {
          added_at?: string | null;
          added_by?: string | null;
          id?: string;
          label?: string | null;
          link_type?: string | null;
          project_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          url?: string | null;
        };
        Update: {
          added_at?: string | null;
          added_by?: string | null;
          id?: string;
          label?: string | null;
          link_type?: string | null;
          project_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          audience_type: string | null;
          auditing_status: string;
          created_at: string | null;
          current_owner_ids: string[] | null;
          description: string | null;
          domain: string | null;
          emoji_icon: string | null;
          given_name: string | null;
          guidelines_url: string | null;
          id: string;
          last_updated: string | null;
          last_updated_by: string | null;
          links: string | null;
          name: string;
          previous_owner_ids: string[] | null;
          sme_owner_id: string | null;
          status: string | null;
          tasking_live: boolean | null;
          updated_at: string;
          updated_by: string | null;
          user_analytics_url: string | null;
          version: string | null;
        };
        Insert: {
          audience_type?: string | null;
          auditing_status?: string;
          created_at?: string | null;
          current_owner_ids?: string[] | null;
          description?: string | null;
          domain?: string | null;
          emoji_icon?: string | null;
          given_name?: string | null;
          guidelines_url?: string | null;
          id?: string;
          last_updated?: string | null;
          last_updated_by?: string | null;
          links?: string | null;
          name: string;
          previous_owner_ids?: string[] | null;
          sme_owner_id?: string | null;
          status?: string | null;
          tasking_live?: boolean | null;
          updated_at?: string;
          updated_by?: string | null;
          user_analytics_url?: string | null;
          version?: string | null;
        };
        Update: {
          audience_type?: string | null;
          auditing_status?: string;
          created_at?: string | null;
          current_owner_ids?: string[] | null;
          description?: string | null;
          domain?: string | null;
          emoji_icon?: string | null;
          given_name?: string | null;
          guidelines_url?: string | null;
          id?: string;
          last_updated?: string | null;
          last_updated_by?: string | null;
          links?: string | null;
          name?: string;
          previous_owner_ids?: string[] | null;
          sme_owner_id?: string | null;
          status?: string | null;
          tasking_live?: boolean | null;
          updated_at?: string;
          updated_by?: string | null;
          user_analytics_url?: string | null;
          version?: string | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          p256dh: string;
          user_id: string;
        };
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          p256dh: string;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          p256dh?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      quality_issues: {
        Row: {
          contributor_id: string | null;
          date: string | null;
          id: string;
          issue: string | null;
          notes: string | null;
          project_id: string | null;
          sme_id: string | null;
          status: string | null;
        };
        Insert: {
          contributor_id?: string | null;
          date?: string | null;
          id?: string;
          issue?: string | null;
          notes?: string | null;
          project_id?: string | null;
          sme_id?: string | null;
          status?: string | null;
        };
        Update: {
          contributor_id?: string | null;
          date?: string | null;
          id?: string;
          issue?: string | null;
          notes?: string | null;
          project_id?: string | null;
          sme_id?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quality_issues_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      quality_scores: {
        Row: {
          contributor_id: string | null;
          id: string;
          notes: string | null;
          project_id: string | null;
          review_date: string | null;
          reviewed_by: string | null;
          score: number | null;
        };
        Insert: {
          contributor_id?: string | null;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          review_date?: string | null;
          reviewed_by?: string | null;
          score?: number | null;
        };
        Update: {
          contributor_id?: string | null;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          review_date?: string | null;
          reviewed_by?: string | null;
          score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "quality_scores_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      quality_sheet_config: {
        Row: {
          id: string;
          last_synced: string | null;
          linked_at: string | null;
          linked_by: string | null;
          sheet_csv_url: string | null;
          sheet_embed_url: string | null;
          sheet_label: string | null;
        };
        Insert: {
          id?: string;
          last_synced?: string | null;
          linked_at?: string | null;
          linked_by?: string | null;
          sheet_csv_url?: string | null;
          sheet_embed_url?: string | null;
          sheet_label?: string | null;
        };
        Update: {
          id?: string;
          last_synced?: string | null;
          linked_at?: string | null;
          linked_by?: string | null;
          sheet_csv_url?: string | null;
          sheet_embed_url?: string | null;
          sheet_label?: string | null;
        };
        Relationships: [];
      };
      recognition_posts: {
        Row: {
          created_at: string;
          given_by: string;
          id: string;
          message: string;
        };
        Insert: {
          created_at?: string;
          given_by: string;
          id?: string;
          message: string;
        };
        Update: {
          created_at?: string;
          given_by?: string;
          id?: string;
          message?: string;
        };
        Relationships: [];
      };
      recognition_reactions: {
        Row: {
          created_at: string;
          emoji: string;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emoji: string;
          id?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emoji?: string;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recognition_reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "recognition_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      recognition_recipients: {
        Row: {
          contributor_id: string;
          id: string;
          post_id: string;
        };
        Insert: {
          contributor_id: string;
          id?: string;
          post_id: string;
        };
        Update: {
          contributor_id?: string;
          id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recognition_recipients_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "recognition_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_grants: {
        Row: {
          granted_at: string | null;
          granted_by: string | null;
          id: string;
          permission: string | null;
          resource_id: string | null;
          resource_type: string | null;
          user_id: string | null;
        };
        Insert: {
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          permission?: string | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_id?: string | null;
        };
        Update: {
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          permission?: string | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          category: string | null;
          date: string | null;
          file_type: string | null;
          id: string;
          name: string;
          tags: string[] | null;
          uploaded_by: string | null;
          url: string | null;
          visible_to: string[] | null;
        };
        Insert: {
          category?: string | null;
          date?: string | null;
          file_type?: string | null;
          id?: string;
          name: string;
          tags?: string[] | null;
          uploaded_by?: string | null;
          url?: string | null;
          visible_to?: string[] | null;
        };
        Update: {
          category?: string | null;
          date?: string | null;
          file_type?: string | null;
          id?: string;
          name?: string;
          tags?: string[] | null;
          uploaded_by?: string | null;
          url?: string | null;
          visible_to?: string[] | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          updated_at: string | null;
          value: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          updated_at?: string | null;
          value?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          updated_at?: string | null;
          value?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          assigned_sme_id: string | null;
          created_at: string | null;
          id: string;
          role: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          assigned_sme_id?: string | null;
          created_at?: string | null;
          id?: string;
          role?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          assigned_sme_id?: string | null;
          created_at?: string | null;
          id?: string;
          role?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      work_log_comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          entry_id: string;
          id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          entry_id: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          entry_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_comments_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "work_log_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      work_log_delay_log: {
        Row: {
          created_at: string;
          entry_id: string;
          explanation: string | null;
          id: string;
          new_deadline: string;
          old_deadline: string;
          reason: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entry_id: string;
          explanation?: string | null;
          id?: string;
          new_deadline: string;
          old_deadline: string;
          reason: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entry_id?: string;
          explanation?: string | null;
          id?: string;
          new_deadline?: string;
          old_deadline?: string;
          reason?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_delay_log_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "work_log_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      work_log_entries: {
        Row: {
          completed_at: string | null;
          completed_at_estimated: boolean;
          content: string | null;
          created_at: string | null;
          deadline: string | null;
          deadline_updated_at: string | null;
          entry_type: string | null;
          id: string;
          overdue_notified_at: string | null;
          p0_escalation_sent_at: string | null;
          previous_entry_type: string | null;
          priority: string | null;
          project_id: string | null;
          reminder_sent_at: string | null;
          snoozed_until: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          completed_at?: string | null;
          completed_at_estimated?: boolean;
          content?: string | null;
          created_at?: string | null;
          deadline?: string | null;
          deadline_updated_at?: string | null;
          entry_type?: string | null;
          id?: string;
          overdue_notified_at?: string | null;
          p0_escalation_sent_at?: string | null;
          previous_entry_type?: string | null;
          priority?: string | null;
          project_id?: string | null;
          reminder_sent_at?: string | null;
          snoozed_until?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          completed_at?: string | null;
          completed_at_estimated?: boolean;
          content?: string | null;
          created_at?: string | null;
          deadline?: string | null;
          deadline_updated_at?: string | null;
          entry_type?: string | null;
          id?: string;
          overdue_notified_at?: string | null;
          p0_escalation_sent_at?: string | null;
          previous_entry_type?: string | null;
          priority?: string | null;
          project_id?: string | null;
          reminder_sent_at?: string | null;
          snoozed_until?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      work_log_entry_status_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          entry_id: string;
          from_type: string | null;
          id: string;
          to_type: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          entry_id: string;
          from_type?: string | null;
          id?: string;
          to_type: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          entry_id?: string;
          from_type?: string | null;
          id?: string;
          to_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_entry_status_history_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "work_log_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      work_log_nudges: {
        Row: {
          created_at: string;
          entry_id: string;
          from_user: string;
          id: string;
          to_user: string;
        };
        Insert: {
          created_at?: string;
          entry_id: string;
          from_user: string;
          id?: string;
          to_user: string;
        };
        Update: {
          created_at?: string;
          entry_id?: string;
          from_user?: string;
          id?: string;
          to_user?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_nudges_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "work_log_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      work_log_review_requests: {
        Row: {
          created_at: string;
          entry_id: string;
          id: string;
          reminder_last_sent_at: string | null;
          requested_by: string;
          reviewed_at: string | null;
          reviewer_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          entry_id: string;
          id?: string;
          reminder_last_sent_at?: string | null;
          requested_by: string;
          reviewed_at?: string | null;
          reviewer_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          entry_id?: string;
          id?: string;
          reminder_last_sent_at?: string | null;
          requested_by?: string;
          reviewed_at?: string | null;
          reviewer_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_review_requests_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "work_log_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_group_order: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          project_id: string;
          user_id: string;
          workspace_type: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          project_id: string;
          user_id: string;
          workspace_type: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          project_id?: string;
          user_id?: string;
          workspace_type?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_review_on_completion: {
        Args: { request_id: string };
        Returns: undefined;
      };
      current_role: { Args: never; Returns: string };
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
      is_sme: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
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
    | { schema: keyof DatabaseWithoutInternals },
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
    | { schema: keyof DatabaseWithoutInternals },
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
    | { schema: keyof DatabaseWithoutInternals },
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
