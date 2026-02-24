import React, { createContext, useContext, useState, useCallback } from "react";
import type { AppUser, OutboundInspection, OutboundEquipmentItem, RoleCategory, Department } from "@/types";
import { seedUsers } from "@/data/seedUsers";
import { computeStatus } from "@/lib/statusAutomation";

interface AppState {
  users: AppUser[];
  inspections: OutboundInspection[];
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  addUser: (name: string, role_category: RoleCategory, department: Department) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  addInspection: (data: Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at">) => void;
  updateInspection: (id: string, updates: Partial<OutboundInspection>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

function recalcStatus(rec: OutboundInspection): OutboundInspection {
  const { status, due_warning } = computeStatus(rec);
  return { ...rec, status, due_warning, updated_at: new Date().toISOString() };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(seedUsers);
  const [inspections, setInspections] = useState<OutboundInspection[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(seedUsers[0]);

  const addUser = useCallback((name: string, role_category: RoleCategory, department: Department) => {
    setUsers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, role_category, department, is_active: true },
    ]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<AppUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }, []);

  const addInspection = useCallback(
    (data: Omit<OutboundInspection, "id" | "status" | "due_warning" | "created_at" | "updated_at">) => {
      const now = new Date().toISOString();
      const inspectionId = crypto.randomUUID();
      const equipmentItems: OutboundEquipmentItem[] = (data.equipment_items || []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        outbound_inspection_id: inspectionId,
        serial_no: null,
        created_at: now,
        updated_at: now,
      }));
      const base: OutboundInspection = {
        ...data,
        id: inspectionId,
        equipment_items: equipmentItems,
        status: "확인필요",
        due_warning: false,
        created_at: now,
        updated_at: now,
      };
      setInspections((prev) => [...prev, recalcStatus(base)]);
    },
    []
  );

  const updateInspection = useCallback((id: string, updates: Partial<OutboundInspection>) => {
    setInspections((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const updated = { ...rec, ...updates };
        return recalcStatus(updated);
      })
    );
  }, []);

  return (
    <AppContext.Provider
      value={{ users, inspections, currentUser, setCurrentUser, addUser, updateUser, addInspection, updateInspection }}
    >
      {children}
    </AppContext.Provider>
  );
}
