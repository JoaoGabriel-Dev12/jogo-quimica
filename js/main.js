import { appName } from "./config.js";
import { createState } from "./state.js";
import * as menu from "./ui/menu.js";
import * as briefing from "./ui/briefing.js";
import * as game from "./ui/jogo.js";
import * as result from "./ui/resultado.js";
import * as end from "./ui/end.js";
import { mountDebugControls } from "./ui/debug.js";
const root = document.querySelector("#app");
document.title = appName;
const state = createState({ root, screens: { MENU: menu, BRIEFING: briefing, JOGO: game, RESULTADO: result, FIM: end } });
window.state = state;
if (new URLSearchParams(window.location.search).get("debug") === "true") {
  const cleanupDebug = mountDebugControls(state);
  window.addEventListener("pagehide", cleanupDebug, { once: true });
}
state.goTo("MENU");
