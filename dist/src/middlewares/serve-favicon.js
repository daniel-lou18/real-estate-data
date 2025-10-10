export const serveEmojiFavicon = (emoji) => {
    return async (c, next) => {
        if (c.req.path === "/favicon.ico") {
            c.res.headers.set("content-type", "image/svg+xml");
            c.res.headers.set("cache-control", "public, max-age=86400"); // Cache for 1 day
            c.res.headers.set("expires", new Date(Date.now() + 86400000).toUTCString());
            return c.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" x="-0.1em" font-size="90">${emoji}</text></svg>`);
        }
        return next();
    };
};
export default serveEmojiFavicon;
