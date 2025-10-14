import { createRouter } from "@/lib/create-app";
import * as routes from "./analytics.routes";
import * as handlers from "./analytics.handlers";
const router = createRouter()
    .openapi(routes.groupedByInseeCode, handlers.groupedByInseeCode)
    .openapi(routes.groupedByInseeCodeAndSection, handlers.groupedByInseeCodeAndSection)
    .openapi(routes.groupedByPropertyType, handlers.groupedByPropertyType)
    .openapi(routes.groupedByYear, handlers.groupedByYear)
    .openapi(routes.groupedByMonth, handlers.groupedByMonth)
    .openapi(routes.summary, handlers.summary)
    .openapi(routes.pricePerM2Deciles, handlers.pricePerM2Deciles)
    .openapi(routes.pricePerM2DecilesByInseeCode, handlers.pricePerM2DecilesByInseeCode)
    .openapi(routes.pricePerM2DecilesByInseeCodeAndSection, handlers.pricePerM2DecilesByInseeCodeAndSection);
export default router;
