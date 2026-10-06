import { renderToString } from "react-dom/server";
import App from "./App";
export { site } from "./content";
export function render() {
  return renderToString(<App />);
}
