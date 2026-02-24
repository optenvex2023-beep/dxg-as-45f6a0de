import type { InspectionReportData, InspectionCheckItem } from "@/types";

const ci = (category: string, item: string): InspectionCheckItem => ({
  category, item, result: "", action: "", action_result: "",
  inspection_result_option: "사용 가능", inspection_result_detail: "",
});

export const DEFAULT_CHECK_ITEMS: InspectionCheckItem[] = [
  ci("광학부", "Beam Splitter"),
  ci("광학부", "Focusing Lens"),
  ci("광학부", "M/U Window"),
  ci("Spectrometer", "스펙트럼 형상"),
  ci("Spectrometer", "신호 상태"),
  ci("UV Lamp", "UV Lamp 광원"),
  ci("UV Lamp Driver", "DC 출력 상태"),
  ci("SMPS", "동작 상태 (5V, 12V, 24V)"),
  ci("배선 결선", "배선 단락, 단선"),
  ci("Main Control CPU Board", "부팅 여부 / 동작 상태"),
  ci("냉각 팬", "동작 상태"),
  ci("프로브", "외관 상태"),
  ci("프로브", "온도센서 / 동작 상태"),
  ci("프로브", "코너큐브 미러"),
];

export const MODEL_OPTIONS = ["DGA-X", "DSM-XG", "RGA-60", "RSM-61", "TGA-50", "LSM-30", "GGA-70-1", "PGA-91"];
export const INBOUND_ITEM_OPTIONS = ["Main Unit", "ACU", "Probe", "Purge Air Unit"];
export const GAS_OPTIONS = ["NOx", "NO2", "SO2", "NH3", "CO", "HCl", "O2", "Flow"];
export const INSTALL_OPTIONS = ["BLR", "SCR", "ESP", "FGD", "TMS"];

export function createDefaultReportData(): InspectionReportData {
  return {
    client_name: "",
    serial_no: "",
    inbound_date: "",
    related_doc: "",
    model_checks: [],
    inbound_items: [],
    inbound_type: [],
    site_situation: "",
    client_request: "",
    voltage_main: [],
    voltage_purge: [],
    measure_gas: [],
    install_type: [],
    check_items: DEFAULT_CHECK_ITEMS.map(i => ({ ...i })),
    replacement_parts: [],
    detail_notes: "",
    main_control_cpu: "부팅 상태, AO 신호, DO 신호 : ",
    optics_window_lens: "오염상태 : ",
    beam_splitter_contamination: "",
    beam_splitter_result: "",
    spectrometer_status: "",
    spectrometer_result: "",
    uv_lamp_note: "",
    cooling_fan_status: "",
    smps_note: "",
    wiring_status: "",
    probe_exterior: "",
    probe_temp_sensor: "",
    probe_corner_mirror: "",
    probe_length: "",
    probe_measure_section: "",
    probe_gas_direction: "",
    summary_items: ["", "", "", ""],
    department_head: "",
    photos: [],
  };
}
