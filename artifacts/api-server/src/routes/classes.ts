import { Router } from "express";
import { readClasses } from "../lib/classes.js";
import { getAllBookings } from "../lib/bookings.js";

const router = Router();

router.get("/classes", async (_req, res) => {
  const classes = readClasses();
  const allBookings = await getAllBookings();

  const result = classes.map((cls) => {
    const spotsByDate: Record<string, number> = {};
    for (const date of cls.dates) {
      const taken = allBookings.filter(
        (b) => b.classId === cls.id && b.date === date
      ).length;
      spotsByDate[date] = Math.max(0, cls.spotsTotal - taken);
    }
    return { ...cls, spotsByDate };
  });

  res.json(result);
});

export default router;
