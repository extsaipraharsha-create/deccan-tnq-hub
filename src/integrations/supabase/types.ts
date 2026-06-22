export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string;
          action_type: Database["public"]["Enums"]["activity_action_type"];
          details: Json | null;
          field_changed: string | null;
          id: string;
          new_value: string | null;
          old_value: string | null;
          target: string | null;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          action_type?: Database["public"]["Enums"]["activity_action_type"];
          details?: Json | null;
          field_changed?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          target?: string | null;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          action_type?: Database["public"]["Enums"]["activity_action_type"];
          details?: Json | null;
          field_changed?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          target?: string | null;
          timestamp?: string;
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
          contributor_id: string;
          earned_at: string;
          id: string;
        };
        Insert: {
          achievement_type: string;
          contributor_id: string;
          earned_at?: string;
          id?: string;
        };
        Update: {
          achievement_type?: string;
          contributor_id?: string;
          earned_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      contributor_progress: {
        Row: {
          completed_at: string | null;
          contributor_id: string;
          id: string;
          learning_path_id: string | null;
          module_id: string | null;
          status: Database["public"]["Enums"]["progress_status"];
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          contributor_id: string;
          id?: string;
          learning_path_id?: string | null;
          module_id?: string | null;
          status?: Database["public"]["Enums"]["progress_status"];
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          contributor_id?: string;
          id?: string;
          learning_path_id?: string | null;
          module_id?: string | null;
          status?: Database["public"]["Enums"]["progress_status"];
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
          onboarding_stage: number;
          onboarding_status: Database["public"]["Enums"]["onboarding_status"];
          playground_id: string | null;
          projects: string[] | null;
          sme_id: string | null;
        };
        Insert: {
          id: string;
          last_active_at?: string | null;
          learning_path_id?: string | null;
          onboarding_stage?: number;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          playground_id?: string | null;
          projects?: string[] | null;
          sme_id?: string | null;
        };
        Update: {
          id?: string;
          last_active_at?: string | null;
          learning_path_id?: string | null;
          onboarding_stage?: number;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          playground_id?: string | null;
          projects?: string[] | null;
          sme_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contributors_learning_path_id_fkey";
            columns: ["learning_path_id"];
            isOneToOne: false;
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributors_playground_id_fkey";
            columns: ["playground_id"];
            isOneToOne: false;
            referencedRelation: "playgrounds";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_path_items: {
        Row: {
          created_at: string;
          created_by: string | null;
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
          learning_path_id: string;
          order_index: number;
          title: string;
          type: Database["public"]["Enums"]["module_type"];
        };
        Insert: {
          completion_criteria?: string | null;
          created_at?: string;
          estimated_minutes?: number | null;
          id?: string;
          learning_path_id: string;
          order_index?: number;
          title: string;
          type?: Database["public"]["Enums"]["module_type"];
        };
        Update: {
          completion_criteria?: string | null;
          created_at?: string;
          estimated_minutes?: number | null;
          id?: string;
          learning_path_id?: string;
          order_index?: number;
          title?: string;
          type?: Database["public"]["Enums"]["module_type"];
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
          created_at: string;
          created_by: string | null;
          id: string;
          last_updated: string;
          last_updated_by: string | null;
          name: string;
          project_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          name: string;
          project_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          name?: string;
          project_id?: string | null;
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
          created_at: string;
          doc_label: string | null;
          doc_url: string | null;
          id: string;
          last_updated: string;
          last_updated_by: string | null;
          notes: string | null;
          poc_user_id: string | null;
          project_id: string;
          video_label: string | null;
          video_url: string | null;
        };
        Insert: {
          created_at?: string;
          doc_label?: string | null;
          doc_url?: string | null;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          notes?: string | null;
          poc_user_id?: string | null;
          project_id: string;
          video_label?: string | null;
          video_url?: string | null;
        };
        Update: {
          created_at?: string;
          doc_label?: string | null;
          doc_url?: string | null;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          notes?: string | null;
          poc_user_id?: string | null;
          project_id?: string;
          video_label?: string | null;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "newcomer_resources_poc_user_id_fkey";
            columns: ["poc_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "newcomer_resources_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      playground_activity: {
        Row: {
          action: string;
          created_at: string;
          details: Json | null;
          id: string;
          playground_id: string;
          section: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          playground_id: string;
          section?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          playground_id?: string;
          section?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "playground_activity_playground_id_fkey";
            columns: ["playground_id"];
            isOneToOne: false;
            referencedRelation: "playgrounds";
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
          playground_id: string;
          status: Database["public"]["Enums"]["content_item_status"];
        };
        Insert: {
          component_name: string;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          playground_id: string;
          status?: Database["public"]["Enums"]["content_item_status"];
        };
        Update: {
          component_name?: string;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          playground_id?: string;
          status?: Database["public"]["Enums"]["content_item_status"];
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
          playground_id: string;
          type: string | null;
          uploaded_at: string;
          uploaded_by: string | null;
          url: string;
          version_number: string | null;
        };
        Insert: {
          file_size?: number | null;
          id?: string;
          name: string;
          playground_id: string;
          type?: string | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
          url: string;
          version_number?: string | null;
        };
        Update: {
          file_size?: number | null;
          id?: string;
          name?: string;
          playground_id?: string;
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
      playground_nodes: {
        Row: {
          id: string;
          last_updated: string;
          order_index: number;
          owner_id: string | null;
          playground_id: string;
          status: string | null;
          title: string;
          type: string | null;
        };
        Insert: {
          id?: string;
          last_updated?: string;
          order_index?: number;
          owner_id?: string | null;
          playground_id: string;
          status?: string | null;
          title: string;
          type?: string | null;
        };
        Update: {
          id?: string;
          last_updated?: string;
          order_index?: number;
          owner_id?: string | null;
          playground_id?: string;
          status?: string | null;
          title?: string;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "playground_nodes_playground_id_fkey";
            columns: ["playground_id"];
            isOneToOne: false;
            referencedRelation: "playgrounds";
            referencedColumns: ["id"];
          },
        ];
      };
      playground_reviews: {
        Row: {
          created_at: string;
          feedback: string | null;
          id: string;
          playground_id: string;
          requested_changes: string | null;
          resolution: string | null;
          review_type: Database["public"]["Enums"]["review_type"];
          reviewer_id: string | null;
          status: Database["public"]["Enums"]["review_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          feedback?: string | null;
          id?: string;
          playground_id: string;
          requested_changes?: string | null;
          resolution?: string | null;
          review_type: Database["public"]["Enums"]["review_type"];
          reviewer_id?: string | null;
          status?: Database["public"]["Enums"]["review_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          feedback?: string | null;
          id?: string;
          playground_id?: string;
          requested_changes?: string | null;
          resolution?: string | null;
          review_type?: Database["public"]["Enums"]["review_type"];
          reviewer_id?: string | null;
          status?: Database["public"]["Enums"]["review_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "playground_reviews_playground_id_fkey";
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
          created_at: string;
          created_by: string | null;
          dashboard_url: string | null;
          description: string | null;
          display_order: number;
          docs_url: string | null;
          estimated_duration: string | null;
          id: string;
          is_live: boolean;
          last_updated: string;
          last_updated_by: string | null;
          learning_objectives: string[] | null;
          learning_path_id: string | null;
          live_since: string | null;
          name: string;
          progress_percent: number;
          project_id: string | null;
          reviewer_ids: string[] | null;
          sme_owner_id: string | null;
          status: Database["public"]["Enums"]["playground_status"];
          target_go_live: string | null;
          version_number: string | null;
          workflow_stage: string | null;
        };
        Insert: {
          access_type?: string | null;
          access_url?: string | null;
          active_users_count?: number | null;
          content_owner_id?: string | null;
          content_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          dashboard_url?: string | null;
          description?: string | null;
          display_order?: number;
          docs_url?: string | null;
          estimated_duration?: string | null;
          id?: string;
          is_live?: boolean;
          last_updated?: string;
          last_updated_by?: string | null;
          learning_objectives?: string[] | null;
          learning_path_id?: string | null;
          live_since?: string | null;
          name: string;
          progress_percent?: number;
          project_id?: string | null;
          reviewer_ids?: string[] | null;
          sme_owner_id?: string | null;
          status?: Database["public"]["Enums"]["playground_status"];
          target_go_live?: string | null;
          version_number?: string | null;
          workflow_stage?: string | null;
        };
        Update: {
          access_type?: string | null;
          access_url?: string | null;
          active_users_count?: number | null;
          content_owner_id?: string | null;
          content_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          dashboard_url?: string | null;
          description?: string | null;
          display_order?: number;
          docs_url?: string | null;
          estimated_duration?: string | null;
          id?: string;
          is_live?: boolean;
          last_updated?: string;
          last_updated_by?: string | null;
          learning_objectives?: string[] | null;
          learning_path_id?: string | null;
          live_since?: string | null;
          name?: string;
          progress_percent?: number;
          project_id?: string | null;
          reviewer_ids?: string[] | null;
          sme_owner_id?: string | null;
          status?: Database["public"]["Enums"]["playground_status"];
          target_go_live?: string | null;
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
          created_at: string;
          email: string | null;
          first_login: boolean;
          id: string;
          last_active: string | null;
          name: string | null;
          photo_url: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          first_login?: boolean;
          id: string;
          last_active?: string | null;
          name?: string | null;
          photo_url?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          first_login?: boolean;
          id?: string;
          last_active?: string | null;
          name?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
      project_links: {
        Row: {
          added_at: string;
          added_by: string | null;
          id: string;
          label: string;
          link_type: string;
          project_id: string;
          updated_at: string;
          updated_by: string | null;
          url: string;
        };
        Insert: {
          added_at?: string;
          added_by?: string | null;
          id?: string;
          label: string;
          link_type: string;
          project_id: string;
          updated_at?: string;
          updated_by?: string | null;
          url: string;
        };
        Update: {
          added_at?: string;
          added_by?: string | null;
          id?: string;
          label?: string;
          link_type?: string;
          project_id?: string;
          updated_at?: string;
          updated_by?: string | null;
          url?: string;
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
          auditing_live: boolean;
          auditing_status: string;
          created_at: string;
          current_owner_ids: string[] | null;
          description: string | null;
          domain: string | null;
          emoji_icon: string | null;
          given_name: string | null;
          guidelines_url: string | null;
          id: string;
          last_updated: string;
          last_updated_by: string | null;
          links: string | null;
          name: string;
          previous_owner_ids: string[] | null;
          quick_link: string | null;
          sme_owner_id: string | null;
          status: Database["public"]["Enums"]["project_status"];
          tasking_live: boolean;
          updated_at: string;
          updated_by: string | null;
          version: string | null;
        };
        Insert: {
          audience_type?: string | null;
          auditing_live?: boolean;
          auditing_status?: string;
          created_at?: string;
          current_owner_ids?: string[] | null;
          description?: string | null;
          domain?: string | null;
          emoji_icon?: string | null;
          given_name?: string | null;
          guidelines_url?: string | null;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          links?: string | null;
          name: string;
          previous_owner_ids?: string[] | null;
          quick_link?: string | null;
          sme_owner_id?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          tasking_live?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          version?: string | null;
        };
        Update: {
          audience_type?: string | null;
          auditing_live?: boolean;
          auditing_status?: string;
          created_at?: string;
          current_owner_ids?: string[] | null;
          description?: string | null;
          domain?: string | null;
          emoji_icon?: string | null;
          given_name?: string | null;
          guidelines_url?: string | null;
          id?: string;
          last_updated?: string;
          last_updated_by?: string | null;
          links?: string | null;
          name?: string;
          previous_owner_ids?: string[] | null;
          quick_link?: string | null;
          sme_owner_id?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          tasking_live?: boolean;
          updated_at?: string;
          updated_by?: string | null;
          version?: string | null;
        };
        Relationships: [];
      };
      quality_issues: {
        Row: {
          contributor_id: string | null;
          date: string;
          id: string;
          issue: string;
          notes: string | null;
          project_id: string | null;
          sme_id: string | null;
          status: Database["public"]["Enums"]["issue_status"];
        };
        Insert: {
          contributor_id?: string | null;
          date?: string;
          id?: string;
          issue: string;
          notes?: string | null;
          project_id?: string | null;
          sme_id?: string | null;
          status?: Database["public"]["Enums"]["issue_status"];
        };
        Update: {
          contributor_id?: string | null;
          date?: string;
          id?: string;
          issue?: string;
          notes?: string | null;
          project_id?: string | null;
          sme_id?: string | null;
          status?: Database["public"]["Enums"]["issue_status"];
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
      quality_notes: {
        Row: {
          contributor_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          note_text: string;
        };
        Insert: {
          contributor_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note_text: string;
        };
        Update: {
          contributor_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note_text?: string;
        };
        Relationships: [];
      };
      quality_scores: {
        Row: {
          contributor_id: string;
          id: string;
          notes: string | null;
          project_id: string | null;
          review_date: string;
          reviewed_by: string | null;
          score: number;
        };
        Insert: {
          contributor_id: string;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          review_date?: string;
          reviewed_by?: string | null;
          score: number;
        };
        Update: {
          contributor_id?: string;
          id?: string;
          notes?: string | null;
          project_id?: string | null;
          review_date?: string;
          reviewed_by?: string | null;
          score?: number;
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
          linked_at: string;
          linked_by: string | null;
          sheet_csv_url: string | null;
          sheet_embed_url: string | null;
          sheet_label: string | null;
        };
        Insert: {
          id?: string;
          last_synced?: string | null;
          linked_at?: string;
          linked_by?: string | null;
          sheet_csv_url?: string | null;
          sheet_embed_url?: string | null;
          sheet_label?: string | null;
        };
        Update: {
          id?: string;
          last_synced?: string | null;
          linked_at?: string;
          linked_by?: string | null;
          sheet_csv_url?: string | null;
          sheet_embed_url?: string | null;
          sheet_label?: string | null;
        };
        Relationships: [];
      };
      resource_grants: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          id: string;
          permission: Database["public"]["Enums"]["permission_level"];
          resource_id: string;
          resource_type: string;
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          permission?: Database["public"]["Enums"]["permission_level"];
          resource_id: string;
          resource_type: string;
          user_id: string;
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          permission?: Database["public"]["Enums"]["permission_level"];
          resource_id?: string;
          resource_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          category: Database["public"]["Enums"]["resource_category"];
          date: string;
          file_type: string | null;
          id: string;
          name: string;
          tags: string[] | null;
          uploaded_by: string | null;
          url: string;
          visible_to: string[] | null;
        };
        Insert: {
          category?: Database["public"]["Enums"]["resource_category"];
          date?: string;
          file_type?: string | null;
          id?: string;
          name: string;
          tags?: string[] | null;
          uploaded_by?: string | null;
          url: string;
          visible_to?: string[] | null;
        };
        Update: {
          category?: Database["public"]["Enums"]["resource_category"];
          date?: string;
          file_type?: string | null;
          id?: string;
          name?: string;
          tags?: string[] | null;
          uploaded_by?: string | null;
          url?: string;
          visible_to?: string[] | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          assigned_sme_id: string | null;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          status: Database["public"]["Enums"]["user_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assigned_sme_id?: string | null;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assigned_sme_id?: string | null;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      wall_of_excellence: {
        Row: {
          awarded_at: string;
          awarded_by: string | null;
          category: string;
          id: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          awarded_at?: string;
          awarded_by?: string | null;
          category: string;
          id?: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          awarded_at?: string;
          awarded_by?: string | null;
          category?: string;
          id?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      work_log_comments: {
        Row: {
          content: string;
          created_at: string;
          entry_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          entry_id: string;
          id?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          entry_id?: string;
          id?: string;
          user_id?: string;
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
      work_log_entries: {
        Row: {
          content: string;
          created_at: string;
          entry_type: string;
          id: string;
          project_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          entry_type: string;
          id?: string;
          project_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          entry_type?: string;
          id?: string;
          project_id?: string | null;
          updated_at?: string;
          user_id?: string;
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
      work_log_reactions: {
        Row: {
          created_at: string;
          entry_id: string;
          id: string;
          reaction_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entry_id: string;
          id?: string;
          reaction_type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entry_id?: string;
          id?: string;
          reaction_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_log_reactions_entry_id_fkey";
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
      current_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      is_sme: { Args: never; Returns: boolean };
    };
    Enums: {
      activity_action_type:
        | "created"
        | "updated"
        | "deleted"
        | "login"
        | "role_changed"
        | "grant_added"
        | "grant_revoked";
      app_role: "super_admin" | "tnq_team" | "contributor" | "pending";
      content_item_status: "not_started" | "in_progress" | "completed" | "needs_revision";
      issue_status: "open" | "resolved";
      module_type: "video" | "reading" | "quiz" | "assessment";
      onboarding_status: "not_started" | "in_progress" | "complete";
      permission_level: "view_only" | "can_edit" | "can_upload" | "full_access";
      playground_status:
        | "not_started"
        | "in_progress"
        | "under_sme_review"
        | "under_qa_review"
        | "needs_revision"
        | "ready_for_publishing"
        | "live"
        | "archived";
      progress_status: "locked" | "available" | "complete";
      project_status: "active" | "paused" | "completed";
      resource_category: "team_sheet" | "project_doc" | "template" | "external_link";
      review_status: "pending" | "approved" | "approved_with_changes" | "rejected";
      review_type: "sme" | "qa" | "content";
      user_status: "active" | "suspended" | "pending";
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
  public: {
    Enums: {
      activity_action_type: [
        "created",
        "updated",
        "deleted",
        "login",
        "role_changed",
        "grant_added",
        "grant_revoked",
      ],
      app_role: ["super_admin", "tnq_team", "contributor", "pending"],
      content_item_status: ["not_started", "in_progress", "completed", "needs_revision"],
      issue_status: ["open", "resolved"],
      module_type: ["video", "reading", "quiz", "assessment"],
      onboarding_status: ["not_started", "in_progress", "complete"],
      permission_level: ["view_only", "can_edit", "can_upload", "full_access"],
      playground_status: [
        "not_started",
        "in_progress",
        "under_sme_review",
        "under_qa_review",
        "needs_revision",
        "ready_for_publishing",
        "live",
        "archived",
      ],
      progress_status: ["locked", "available", "complete"],
      project_status: ["active", "paused", "completed"],
      resource_category: ["team_sheet", "project_doc", "template", "external_link"],
      review_status: ["pending", "approved", "approved_with_changes", "rejected"],
      review_type: ["sme", "qa", "content"],
      user_status: ["active", "suspended", "pending"],
    },
  },
} as const;
