import createApp from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index.route";
import sales from "@/routes/sales/sales.index";

const app = createApp();

const routes = [index, sales];

configureOpenAPI(app);

routes.forEach((route) => app.route("/", route));

export default app;
