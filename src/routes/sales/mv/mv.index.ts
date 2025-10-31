import { createRouter } from "@/lib/create-app";
import * as routes from "./mv.routes";
import * as handlers from "./mv.handlers";

const router = createRouter()
  .openapi(routes.getAptsByInseeCodeYear, handlers.getAptsByInseeCodeYear)
  .openapi(routes.getHousesByInseeCodeYear, handlers.getHousesByInseeCodeYear)
  .openapi(routes.getAptsByInseeCodeMonth, handlers.getAptsByInseeCodeMonth)
  .openapi(routes.getHousesByInseeCodeMonth, handlers.getHousesByInseeCodeMonth)
  .openapi(routes.getAptsByInseeCodeWeek, handlers.getAptsByInseeCodeWeek)
  .openapi(routes.getHousesByInseeCodeWeek, handlers.getHousesByInseeCodeWeek);

export default router;
