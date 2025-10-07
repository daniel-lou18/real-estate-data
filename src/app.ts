import createApp from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index.route";
import sales from "@/routes/sales/sales.index";
import chat from "@/routes/chat/chat.index";

const app = createApp();

const routes = [index, sales, chat];

configureOpenAPI(app);

routes.forEach((route) => app.route("/api/", route));

export default app;
