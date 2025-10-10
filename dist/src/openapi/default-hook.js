import { UNPROCESSABLE_ENTITY } from "@/config/http-status-codes";
export const defaultHook = (result, c) => {
    if (!result.success) {
        return c.json({
            success: result.success,
            error: {
                name: result.error.name,
                issues: result.error.issues,
            },
        }, UNPROCESSABLE_ENTITY);
    }
};
export default defaultHook;
