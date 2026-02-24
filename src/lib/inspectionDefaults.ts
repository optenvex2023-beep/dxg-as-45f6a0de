import type { InspectionReportData, InspectionCheckItem } from "@/types";

export const DEFAULT_CHECK_ITEMS: InspectionCheckItem[] = [
  { category: "광학부", item: "Beam Splitter", result: "", action: "", action_result: "" },
  { category: "광학부", item: "Focusing Lens", result: "", action: "", action_result: "" },
  { category: "광학부", item: "M/U Window", result: "", action: "", action_result: "" },
  { category: "Spectrometer", item: "스펙트럼 형상", result: "", action: "", action_result: "" },
  { category: "Spectrometer", item: "신호 상태", result: "", action: "", action_result: "" },
  { category: "UV Lamp", item: "UV Lamp 광원", result: "", action: "", action_result: "" },
  { category: "UV Lamp Driver", item: "DC 출력 상태", result: "", action: "", action_result: "" },
  { category: "SMPS", item: "동작 상태 (5V, 12V, 24V)", result: "", action: "", action_result: "" },
  { category: "배선 결선", item: "배선 단락, 단선", result: "", action: "", action_result: "" },
  { category: "Main Control CPU Board", item: "부팅 여부 / 동작 상태", result: "", action: "", action_result: "" },
  { category: "냉각 팬", item: "동작 상태", result: "", action: "", action_result: "" },
  { category: "프로브", item: "외관 상태", result: "", action: "", action_result: "" },
  { category: "프로브", item: "온도센서 / 동작 상태", result: "", action: "", action_result: "" },
  { category: "프로브", item: "코너큐브 미러", result: "", action: "", action_result: "" },
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
