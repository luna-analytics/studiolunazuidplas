import { useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type ClassInstance = {
  id: string;
  title: string;
  time: string;
  teacher: string;
  spotsTotal: number;
  description: string;
  type: "yoga" | "circle";
  dates: string[];
  spotsByDate: Record<string, number>;
};

export function useClasses() {
  const [classes, setClasses] = useState<ClassInstance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${BASE}/api/classes`);
      if (res.ok) setClasses(await res.json());
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  return { classes, loading, refetch: fetchClasses };
}
