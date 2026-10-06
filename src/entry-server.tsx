import { renderToString } from "react-dom/server";
import App from "./App";
export { site } from "./content";
export function render(path = "/") {
  return renderToString(<App path={path} />);
}
