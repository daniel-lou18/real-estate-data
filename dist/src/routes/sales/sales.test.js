import { describe, it, expect } from "vitest";
import router from "./sales.index";
import { createTestApp } from "@/lib/create-app";
const testRouter = createTestApp(router);
describe("Sales", () => {
    it("should return a list of property sales", async () => {
        const response = await testRouter.request("/sales");
        const result = await response.json();
        console.log(result);
        const length = result.length;
        expect(length).toBeGreaterThan(0);
    });
});
