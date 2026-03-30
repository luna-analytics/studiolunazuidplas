import { Router } from "express";
import { readClasses } from "../lib/classes.js";
import { getAllBookings } from "../lib/bookings.js";
import { readReserveringen } from "../lib/reserveringen.js";

const router = Router();

router.get("/classes", async (_req, res) => {
  const classes = await readClasses();
  const [allBookings, allReserveringen] = await Promise.all([
    getAllBookings(),
    readReserveringen(),
  ]);

  const result = classes.map((cls) => {
    const spotsByDate: Record<string, number> = {};
    for (const date of cls.dates) {
      const takenByBookings = allBookings.filter(
        (b) => b.classId === cls.id && b.date === date
      ).length;
      const takenByReserveringen = allReserveringen.filter(
        (r) => r.classId === cls.id && r.dateStr === date
      ).length;
      spotsByDate[date] = Math.max(0, cls.spotsTotal - takenByBookings - takenByReserveringen);
    }
    return { ...cls, spotsByDate };
  });

  res.json(result);
});

export default router;
