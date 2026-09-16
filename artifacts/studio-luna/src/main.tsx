import { createRoot } from "react-dom/client";
import App from "./App";
// Lettertypes staan op de eigen site en worden niet bij Google opgehaald (AVG):
// bij Google Fonts ziet Google het IP-adres van elke bezoeker.
import "@fontsource-variable/alegreya/wght.css";
import "@fontsource-variable/alegreya/wght-italic.css";
import "@fontsource/alegreya-sans/300.css";
import "@fontsource/alegreya-sans/400.css";
import "@fontsource/alegreya-sans/400-italic.css";
import "@fontsource/alegreya-sans/500.css";
import "@fontsource/alegreya-sans/700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
