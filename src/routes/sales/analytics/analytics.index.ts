import { createRouter } from "@/lib/create-app";
import * as routes from "./analytics.routes";
import * as handlers from "./analytics.handlers";
import mvRouter from "../mv/mv.index";

const router = createRouter()
  .openapi(routes.groupedByInseeCode, handlers.groupedByInseeCode)
  .openapi(
    routes.groupedByInseeCodeAndSection,
    handlers.groupedByInseeCodeAndSection
  )
  .openapi(routes.groupedByPropertyType, handlers.groupedByPropertyType)
  .openapi(routes.groupedByYear, handlers.groupedByYear)
  .openapi(routes.groupedByMonth, handlers.groupedByMonth)
  .openapi(routes.summary, handlers.summary)
  .openapi(routes.pricePerM2Deciles, handlers.pricePerM2Deciles)
  .route("/mv", mvRouter);

export default router;
