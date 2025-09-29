import type { NotFoundHandler } from "hono";
import { NOT_FOUND as NOT_FOUND_MESSAGE } from "@/config/http-status-phrases";
import { NOT_FOUND as NOT_FOUND_CODE } from "@/config/http-status-codes";

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      message: `${NOT_FOUND_MESSAGE} - requested resource not found at path: ${c.req.path}`,
    },
    NOT_FOUND_CODE
  );
};

export default notFound;
