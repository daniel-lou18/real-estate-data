import { createRouter } from "@/lib/create-app";
import * as routes from "./analytics.routes";
import * as handlers from "./analytics.handlers";
const router = createRouter()
    .openapi(routes.groupedByInseeCode, handlers.groupedByInseeCode)
    .openapi(routes.groupedByInseeCodeAndSection, handlers.groupedByInseeCodeAndSection)
    .openapi(routes.groupedByPropertyType, handlers.groupedByPropertyType)
    .openapi(routes.groupedByYear, handlers.groupedByYear)
    .openapi(routes.groupedByMonth, handlers.groupedByMonth)
    .openapi(routes.summary, handlers.summary);
export default router;
