// ReSpec Worker v0.2.0
"use strict";
try {
  importScripts("https://data.gov.cz/otevřené-formální-normy/static/js/respec-highlight.js");
  self.hljs.configure({
    tabReplace: "  ", // 2 spaces
    languages: ["abnf", "css", "http", "javascript", "json", "markdown", "xml"],
  });
} catch (err) {
  console.error("Network error loading/configuring highlighter", err);
}

self.addEventListener("message", ({ data: originalData }) => {
  const data = Object.assign({}, originalData);
  switch (data.action) {
    case "highlight-load-lang": {
      const { langURL, propName, lang } = data;
      importScripts(langURL);
      self.hljs.registerLanguage(lang, self[propName]);
      break;
    }
    case "highlight": {
      const { code } = data;
      const langs = data.languages.length ? data.languages : undefined;
      try {
        const { value, language } = self.hljs.highlightAuto(code, langs);
        Object.assign(data, { value, language });
      } catch (err) {
        console.error("Could not transform some code?", err);
        // Post back the original code
        Object.assign(data, { value: code, language: "" });
      }
      break;
    }
  }
  self.postMessage(data);
});
