import { INTERNAL_SERVER_ERROR, OK as OK_CODE, } from "@/config/http-status-codes";
import enviroment from "@/config/env";
export const onError = (err, c) => {
    const currentStatus = "status" in err ? err.status : c.newResponse(null).status;
    const statusCode = currentStatus === OK_CODE
        ? INTERNAL_SERVER_ERROR
        : currentStatus;
    const env = c.env?.NODE_ENV || enviroment.NODE_ENV;
    return c.json({
        message: err.message,
        stack: env === "production" ? undefined : err.stack,
    }, statusCode);
};
export default onError;
