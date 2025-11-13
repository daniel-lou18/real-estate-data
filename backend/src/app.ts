import createApp from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index.route";
import sales from "@/routes/sales/sales.index";
import chat from "@/routes/chat/chat.index";

const app = createApp().basePath("/api");

configureOpenAPI(app);

app.route("/", index);
app.route("/sales", sales);
app.route("/chat", chat);

export default app;
