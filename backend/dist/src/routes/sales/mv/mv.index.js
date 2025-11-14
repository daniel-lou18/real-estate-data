import { createRouter } from "@/lib/create-app";
import * as routes from "./mv.routes";
import * as handlers from "./mv.handlers";
import * as deltasRoutes from "./mv_deltas.routes";
import * as deltasHandlers from "./mv_deltas.handlers";
import * as slopesRoutes from "./mv_slopes.routes";
import * as slopesHandlers from "./mv_slopes.handlers";
const router = createRouter()
    .openapi(routes.getAptsByInseeCodeYear, handlers.getAptsByInseeCodeYear)
    .openapi(routes.getHousesByInseeCodeYear, handlers.getHousesByInseeCodeYear)
    .openapi(routes.getAptsByInseeCodeMonth, handlers.getAptsByInseeCodeMonth)
    .openapi(routes.getHousesByInseeCodeMonth, handlers.getHousesByInseeCodeMonth)
    .openapi(routes.getAptsByInseeCodeWeek, handlers.getAptsByInseeCodeWeek)
    .openapi(routes.getHousesByInseeCodeWeek, handlers.getHousesByInseeCodeWeek)
    .openapi(routes.getAptsBySectionYear, handlers.getAptsBySectionYear)
    .openapi(routes.getHousesBySectionYear, handlers.getHousesBySectionYear)
    .openapi(routes.getAptsBySectionMonth, handlers.getAptsBySectionMonth)
    .openapi(routes.getHousesBySectionMonth, handlers.getHousesBySectionMonth)
    .openapi(slopesRoutes.getAptsByInseeCodeMonthSlope, slopesHandlers.getAptsByInseeCodeMonthSlope)
    .openapi(slopesRoutes.getHousesByInseeCodeMonthSlope, slopesHandlers.getHousesByInseeCodeMonthSlope)
    .openapi(slopesRoutes.getAptsBySectionMonthSlope, slopesHandlers.getAptsBySectionMonthSlope)
    .openapi(slopesRoutes.getHousesBySectionMonthSlope, slopesHandlers.getHousesBySectionMonthSlope)
    .openapi(deltasRoutes.getAptsByInseeCodeYearlyDeltas, deltasHandlers.getAptsByInseeCodeYearlyDeltas)
    .openapi(deltasRoutes.getHousesByInseeCodeYearlyDeltas, deltasHandlers.getHousesByInseeCodeYearlyDeltas)
    .openapi(deltasRoutes.getAptsBySectionYearlyDeltas, deltasHandlers.getAptsBySectionYearlyDeltas)
    .openapi(deltasRoutes.getHousesBySectionYearlyDeltas, deltasHandlers.getHousesBySectionYearlyDeltas);
export default router;
