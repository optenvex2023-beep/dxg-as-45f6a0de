
-- ============================================================
-- 1. app_users table
-- ============================================================
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emp_no TEXT NOT NULL,
  name TEXT NOT NULL,
  role_category TEXT NOT NULL DEFAULT '미배정',
  department TEXT NOT NULL DEFAULT '없음',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_users" ON public.app_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert app_users" ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update app_users" ON public.app_users FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- 2. outbound_inspections table
-- ============================================================
CREATE TABLE public.outbound_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT '확인필요',
  manage_no TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  outbound_request_date_mode TEXT NOT NULL DEFAULT '단일',
  outbound_request_date_single TEXT,
  outbound_request_date_start TEXT,
  outbound_request_date_end TEXT,
  planned_outbound_date TEXT,
  outbound_date TEXT,
  inbound_date TEXT,
  first_inspection_done_date TEXT,
  final_inspection_done_date TEXT,
  reinstall_request_date_mode TEXT NOT NULL DEFAULT '단일',
  reinstall_request_date_single TEXT,
  reinstall_request_date_start TEXT,
  reinstall_request_date_end TEXT,
  reinstall_date TEXT,
  reinstall_confirm_status TEXT NOT NULL DEFAULT '예정',
  contract_due_date TEXT,
  special_note TEXT NOT NULL DEFAULT '',
  client_pic_name TEXT NOT NULL DEFAULT '',
  client_pic_phone TEXT NOT NULL DEFAULT '',
  request_type TEXT NOT NULL DEFAULT '세일즈오더',
  support_request_file TEXT,
  due_warning BOOLEAN NOT NULL DEFAULT false,
  noti_confirm_needed_sent_at TEXT,
  noti_dispatch_plan_sent_at TEXT,
  noti_dispatch_done_sent_at TEXT,
  noti_first_check_done_sent_at TEXT,
  noti_final_check_done_sent_at TEXT,
  noti_install_done_sent_at TEXT,
  due_alert_sent_at TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outbound_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read outbound_inspections" ON public.outbound_inspections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert outbound_inspections" ON public.outbound_inspections FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update outbound_inspections" ON public.outbound_inspections FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete outbound_inspections" ON public.outbound_inspections FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 3. outbound_equipment_items table
-- ============================================================
CREATE TABLE public.outbound_equipment_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outbound_inspection_id UUID NOT NULL REFERENCES public.outbound_inspections(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL DEFAULT '',
  qty_set INTEGER NOT NULL DEFAULT 1,
  serial_no TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.outbound_equipment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read outbound_equipment_items" ON public.outbound_equipment_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert outbound_equipment_items" ON public.outbound_equipment_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update outbound_equipment_items" ON public.outbound_equipment_items FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete outbound_equipment_items" ON public.outbound_equipment_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 4. inspection_reports table
-- ============================================================
CREATE TABLE public.inspection_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.outbound_inspections(id) ON DELETE CASCADE,
  equipment_item_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'first',
  status TEXT NOT NULL DEFAULT 'draft',
  serial_numbers JSONB NOT NULL DEFAULT '{}',
  inspection_data JSONB NOT NULL DEFAULT '{}',
  inspection_result TEXT NOT NULL DEFAULT '',
  special_notes TEXT NOT NULL DEFAULT '',
  inspector_name TEXT NOT NULL DEFAULT '',
  created_date TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  qa_review_status TEXT NOT NULL DEFAULT '미검토',
  qa_reviewer_name TEXT,
  qa_reviewed_at TIMESTAMPTZ,
  qa_signature_applied BOOLEAN NOT NULL DEFAULT false,
  qa_notification_sent_to_sales BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read inspection_reports" ON public.inspection_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert inspection_reports" ON public.inspection_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update inspection_reports" ON public.inspection_reports FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- 5. report_versions table
-- ============================================================
CREATE TABLE public.report_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.inspection_reports(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_name TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL DEFAULT '',
  uploaded_by TEXT NOT NULL DEFAULT '',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read report_versions" ON public.report_versions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert report_versions" ON public.report_versions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- 6. calibration_gas_inventory table
-- ============================================================
CREATE TABLE public.calibration_gas_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_end_date TEXT,
  site_name TEXT NOT NULL DEFAULT '',
  tms_status TEXT NOT NULL DEFAULT '',
  unit_no TEXT NOT NULL DEFAULT '',
  analyzer_range TEXT NOT NULL DEFAULT '',
  gas_name TEXT NOT NULL DEFAULT '',
  concentration TEXT NOT NULL DEFAULT '',
  volume_l TEXT NOT NULL DEFAULT '',
  expiry_date TEXT,
  remaining_percent TEXT NOT NULL DEFAULT '',
  purchase_entity TEXT NOT NULL DEFAULT '',
  so_issue TEXT NOT NULL DEFAULT '',
  arrival_status TEXT NOT NULL DEFAULT '',
  branch TEXT NOT NULL DEFAULT '',
  gas_inspection_first TEXT NOT NULL DEFAULT '',
  gas_inspection_last TEXT NOT NULL DEFAULT '',
  gas_inspection_next TEXT NOT NULL DEFAULT '',
  gas_inspection_round TEXT NOT NULL DEFAULT '',
  gas_inspection_so TEXT NOT NULL DEFAULT '',
  gas_inspection_so_arrival TEXT NOT NULL DEFAULT '',
  velocity_inspection_first TEXT NOT NULL DEFAULT '',
  velocity_inspection_last TEXT NOT NULL DEFAULT '',
  velocity_inspection_next TEXT NOT NULL DEFAULT '',
  velocity_inspection_round TEXT NOT NULL DEFAULT '',
  velocity_inspection_so TEXT NOT NULL DEFAULT '',
  inspection_notes TEXT NOT NULL DEFAULT '',
  inspection_date TEXT NOT NULL DEFAULT '',
  inspection_cycle TEXT NOT NULL DEFAULT '',
  md TEXT NOT NULL DEFAULT '',
  monthly_amount TEXT NOT NULL DEFAULT '',
  contract_consumables TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calibration_gas_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read calibration_gas_inventory" ON public.calibration_gas_inventory FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert calibration_gas_inventory" ON public.calibration_gas_inventory FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update calibration_gas_inventory" ON public.calibration_gas_inventory FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- 7. calibration_gas_history table
-- ============================================================
CREATE TABLE public.calibration_gas_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES public.calibration_gas_inventory(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL DEFAULT '',
  field_name TEXT NOT NULL DEFAULT '',
  before_value TEXT NOT NULL DEFAULT '',
  after_value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.calibration_gas_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read calibration_gas_history" ON public.calibration_gas_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert calibration_gas_history" ON public.calibration_gas_history FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- 8. in_app_notifications table
-- ============================================================
CREATE TABLE public.in_app_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  link_url TEXT,
  entity_type TEXT NOT NULL DEFAULT 'status',
  entity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read in_app_notifications" ON public.in_app_notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert in_app_notifications" ON public.in_app_notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update in_app_notifications" ON public.in_app_notifications FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- 9. updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_outbound_inspections_updated_at BEFORE UPDATE ON public.outbound_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_outbound_equipment_items_updated_at BEFORE UPDATE ON public.outbound_equipment_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspection_reports_updated_at BEFORE UPDATE ON public.inspection_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calibration_gas_inventory_updated_at BEFORE UPDATE ON public.calibration_gas_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
