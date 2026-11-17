import { appName } from "./config.js";
import { createState } from "./state.js";
import * as menu from "./UI/menu.js";
import * as briefing from "./UI/briefing.js";
import * as game from "./UI/jogo.js";
import * as result from "./UI/resultado.js";
import * as end from "./UI/end.js";
import * as arcade from "./UI/arcade.js";
import * as arcadeEnd from "./UI/arcade-fim.js";
import * as ranking from "./UI/ranking.js";
import { mountDebugControls } from "./UI/debug.js";
const root = document.querySelector("#app");
document.title = appName;
const state = createState({
  root,
  screens: {
    MENU: menu,
    BRIEFING: briefing,
    JOGO: game,
    RESULTADO: result,
    FIM: end,
    ARCADE: arcade,
    ARCADE_FIM: arcadeEnd,
    RANKING: ranking,
  },
});
window.state = state;
if (new URLSearchParams(window.location.search).get("debug") === "true") {
  const cleanupDebug = mountDebugControls(state);
  window.addEventListener("pagehide", cleanupDebug, { once: true });
}
state.goTo("MENU");
