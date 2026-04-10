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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string
          department: string
          emp_no: string
          id: string
          is_active: boolean
          name: string
          role_category: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          emp_no: string
          id?: string
          is_active?: boolean
          name: string
          role_category?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          emp_no?: string
          id?: string
          is_active?: boolean
          name?: string
          role_category?: string
          updated_at?: string
        }
        Relationships: []
      }
      calibration_gas_history: {
        Row: {
          after_value: string
          before_value: string
          field_name: string
          file_name: string
          id: string
          inventory_item_id: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          after_value?: string
          before_value?: string
          field_name?: string
          file_name?: string
          id?: string
          inventory_item_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Update: {
          after_value?: string
          before_value?: string
          field_name?: string
          file_name?: string
          id?: string
          inventory_item_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibration_gas_history_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "calibration_gas_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      calibration_gas_inventory: {
        Row: {
          analyzer_range: string
          arrival_status: string
          branch: string
          concentration: string
          contract_consumables: string
          contract_end_date: string | null
          created_at: string
          expiry_date: string | null
          gas_inspection_first: string
          gas_inspection_last: string
          gas_inspection_next: string
          gas_inspection_round: string
          gas_inspection_so: string
          gas_inspection_so_arrival: string
          gas_name: string
          id: string
          inspection_cycle: string
          inspection_date: string
          inspection_notes: string
          md: string
          monthly_amount: string
          notes: string
          purchase_entity: string
          remaining_percent: string
          site_name: string
          so_issue: string
          sort_order: number
          tms_status: string
          unit_no: string
          updated_at: string
          velocity_inspection_first: string
          velocity_inspection_last: string
          velocity_inspection_next: string
          velocity_inspection_round: string
          velocity_inspection_so: string
          volume_l: string
        }
        Insert: {
          analyzer_range?: string
          arrival_status?: string
          branch?: string
          concentration?: string
          contract_consumables?: string
          contract_end_date?: string | null
          created_at?: string
          expiry_date?: string | null
          gas_inspection_first?: string
          gas_inspection_last?: string
          gas_inspection_next?: string
          gas_inspection_round?: string
          gas_inspection_so?: string
          gas_inspection_so_arrival?: string
          gas_name?: string
          id?: string
          inspection_cycle?: string
          inspection_date?: string
          inspection_notes?: string
          md?: string
          monthly_amount?: string
          notes?: string
          purchase_entity?: string
          remaining_percent?: string
          site_name?: string
          so_issue?: string
          sort_order?: number
          tms_status?: string
          unit_no?: string
          updated_at?: string
          velocity_inspection_first?: string
          velocity_inspection_last?: string
          velocity_inspection_next?: string
          velocity_inspection_round?: string
          velocity_inspection_so?: string
          volume_l?: string
        }
        Update: {
          analyzer_range?: string
          arrival_status?: string
          branch?: string
          concentration?: string
          contract_consumables?: string
          contract_end_date?: string | null
          created_at?: string
          expiry_date?: string | null
          gas_inspection_first?: string
          gas_inspection_last?: string
          gas_inspection_next?: string
          gas_inspection_round?: string
          gas_inspection_so?: string
          gas_inspection_so_arrival?: string
          gas_name?: string
          id?: string
          inspection_cycle?: string
          inspection_date?: string
          inspection_notes?: string
          md?: string
          monthly_amount?: string
          notes?: string
          purchase_entity?: string
          remaining_percent?: string
          site_name?: string
          so_issue?: string
          sort_order?: number
          tms_status?: string
          unit_no?: string
          updated_at?: string
          velocity_inspection_first?: string
          velocity_inspection_last?: string
          velocity_inspection_next?: string
          velocity_inspection_round?: string
          velocity_inspection_so?: string
          volume_l?: string
        }
        Relationships: []
      }
      in_app_notifications: {
        Row: {
          body: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          link_url: string | null
          read_at: string | null
          recipient_user_id: string
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          link_url?: string | null
          read_at?: string | null
          recipient_user_id: string
          title?: string
        }
        Update: {
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          link_url?: string | null
          read_at?: string | null
          recipient_user_id?: string
          title?: string
        }
        Relationships: []
      }
      inspection_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          created_date: string
          equipment_item_id: string
          id: string
          inspection_data: Json
          inspection_id: string
          inspection_result: string
          inspector_name: string
          manufacturing_review_completed: boolean
          manufacturing_reviewed_at: string | null
          qa_notification_sent_to_sales: boolean
          qa_review_status: string
          qa_reviewed_at: string | null
          qa_reviewer_name: string | null
          qa_signature_applied: boolean
          report_type: string
          serial_numbers: Json
          special_notes: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_date?: string
          equipment_item_id: string
          id?: string
          inspection_data?: Json
          inspection_id: string
          inspection_result?: string
          inspector_name?: string
          manufacturing_review_completed?: boolean
          manufacturing_reviewed_at?: string | null
          qa_notification_sent_to_sales?: boolean
          qa_review_status?: string
          qa_reviewed_at?: string | null
          qa_reviewer_name?: string | null
          qa_signature_applied?: boolean
          report_type?: string
          serial_numbers?: Json
          special_notes?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_date?: string
          equipment_item_id?: string
          id?: string
          inspection_data?: Json
          inspection_id?: string
          inspection_result?: string
          inspector_name?: string
          manufacturing_review_completed?: boolean
          manufacturing_reviewed_at?: string | null
          qa_notification_sent_to_sales?: boolean
          qa_review_status?: string
          qa_reviewed_at?: string | null
          qa_reviewer_name?: string | null
          qa_signature_applied?: boolean
          report_type?: string
          serial_numbers?: Json
          special_notes?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "outbound_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_equipment_items: {
        Row: {
          created_at: string
          equipment_name: string
          id: string
          outbound_inspection_id: string
          qty_set: number
          serial_no: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_name?: string
          id?: string
          outbound_inspection_id: string
          qty_set?: number
          serial_no?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_name?: string
          id?: string
          outbound_inspection_id?: string
          qty_set?: number
          serial_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbound_equipment_items_outbound_inspection_id_fkey"
            columns: ["outbound_inspection_id"]
            isOneToOne: false
            referencedRelation: "outbound_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_inspections: {
        Row: {
          client_pic_name: string
          client_pic_phone: string
          closed_at: string | null
          contract_due_date: string | null
          created_at: string
          created_by: string | null
          due_alert_sent_at: string | null
          due_warning: boolean
          final_inspection_done_date: string | null
          first_inspection_done_date: string | null
          id: string
          inbound_date: string | null
          install_completed: boolean
          is_closed: boolean
          manage_no: string
          noti_confirm_needed_sent_at: string | null
          noti_dispatch_done_sent_at: string | null
          noti_dispatch_plan_sent_at: string | null
          noti_final_check_done_sent_at: string | null
          noti_first_check_done_sent_at: string | null
          noti_install_done_sent_at: string | null
          outbound_date: string | null
          outbound_request_date_end: string | null
          outbound_request_date_mode: string
          outbound_request_date_single: string | null
          outbound_request_date_start: string | null
          planned_outbound_date: string | null
          project_name: string
          reinstall_confirm_status: string
          reinstall_date: string | null
          reinstall_request_date_end: string | null
          reinstall_request_date_mode: string
          reinstall_request_date_single: string | null
          reinstall_request_date_start: string | null
          request_type: string
          special_note: string
          status: string
          support_request_file: string | null
          updated_at: string
        }
        Insert: {
          client_pic_name?: string
          client_pic_phone?: string
          closed_at?: string | null
          contract_due_date?: string | null
          created_at?: string
          created_by?: string | null
          due_alert_sent_at?: string | null
          due_warning?: boolean
          final_inspection_done_date?: string | null
          first_inspection_done_date?: string | null
          id?: string
          inbound_date?: string | null
          install_completed?: boolean
          is_closed?: boolean
          manage_no?: string
          noti_confirm_needed_sent_at?: string | null
          noti_dispatch_done_sent_at?: string | null
          noti_dispatch_plan_sent_at?: string | null
          noti_final_check_done_sent_at?: string | null
          noti_first_check_done_sent_at?: string | null
          noti_install_done_sent_at?: string | null
          outbound_date?: string | null
          outbound_request_date_end?: string | null
          outbound_request_date_mode?: string
          outbound_request_date_single?: string | null
          outbound_request_date_start?: string | null
          planned_outbound_date?: string | null
          project_name?: string
          reinstall_confirm_status?: string
          reinstall_date?: string | null
          reinstall_request_date_end?: string | null
          reinstall_request_date_mode?: string
          reinstall_request_date_single?: string | null
          reinstall_request_date_start?: string | null
          request_type?: string
          special_note?: string
          status?: string
          support_request_file?: string | null
          updated_at?: string
        }
        Update: {
          client_pic_name?: string
          client_pic_phone?: string
          closed_at?: string | null
          contract_due_date?: string | null
          created_at?: string
          created_by?: string | null
          due_alert_sent_at?: string | null
          due_warning?: boolean
          final_inspection_done_date?: string | null
          first_inspection_done_date?: string | null
          id?: string
          inbound_date?: string | null
          install_completed?: boolean
          is_closed?: boolean
          manage_no?: string
          noti_confirm_needed_sent_at?: string | null
          noti_dispatch_done_sent_at?: string | null
          noti_dispatch_plan_sent_at?: string | null
          noti_final_check_done_sent_at?: string | null
          noti_first_check_done_sent_at?: string | null
          noti_install_done_sent_at?: string | null
          outbound_date?: string | null
          outbound_request_date_end?: string | null
          outbound_request_date_mode?: string
          outbound_request_date_single?: string | null
          outbound_request_date_start?: string | null
          planned_outbound_date?: string | null
          project_name?: string
          reinstall_confirm_status?: string
          reinstall_date?: string | null
          reinstall_request_date_end?: string | null
          reinstall_request_date_mode?: string
          reinstall_request_date_single?: string | null
          reinstall_request_date_start?: string | null
          request_type?: string
          special_note?: string
          status?: string
          support_request_file?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_versions: {
        Row: {
          file_name: string
          file_path: string
          file_url: string
          id: string
          report_id: string
          uploaded_at: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          file_name?: string
          file_path?: string
          file_url?: string
          id?: string
          report_id: string
          uploaded_at?: string
          uploaded_by?: string
          version_number?: number
        }
        Update: {
          file_name?: string
          file_path?: string
          file_url?: string
          id?: string
          report_id?: string
          uploaded_at?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_versions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "inspection_reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
