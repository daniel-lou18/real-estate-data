import type { ListRoute } from "./sales.routes";
import type { AppRouteHandler } from "@/types";
import * as HttpStatusCodes from "@/config/http-status-codes";

export const list: AppRouteHandler<ListRoute> = (c) => {
  return c.json(
    [
      {
        year: 2025,
        month: 9,
        date: "2025-09-30",
        nbApartments: 2,
        nbHouses: 0,
        price: 1000000,
        floorArea: 100,
      },
    ],
    HttpStatusCodes.OK
  );
};
