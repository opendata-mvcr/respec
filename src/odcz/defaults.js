/**
 * Sets the defaults for W3C specs
 */
export const name = "odcz/defaults";
import { coreDefaults } from "../core/defaults.js";
import { definitionMap } from "../core/dfn-map.js";
import linter from "../core/linter.js";
import { rule as privsecSectionRule } from "../core/linter-rules/privsec-section.js";
import { rule as wptTestsExist } from "../core/linter-rules/wpt-tests-exist.js";

linter.register(privsecSectionRule, wptTestsExist);

const licenses = new Map([
  [
    "cc0",
    {
      name: "Creative Commons 0 Public Domain Dedication",
      short: "CC0",
      url: "https://creativecommons.org/publicdomain/zero/1.0/",
    },
  ],
  [
    "cc-by",
    {
      name: "Creative Commons Attribution 4.0 International Public License",
      short: "CC-BY",
      url: "https://creativecommons.org/licenses/by/4.0/legalcode",
    },
  ],
]);

const odczDefaults = {
  lint: {
    "no-headingless-sections": true,
    "no-http-props": true,
    "check-punctuation": false,
    "local-refs-exist": true,
  },
  pluralize: false,
  highlightVars: true,
  doJsonLd: false,
  license: "cc-by",
  specStatus: "base",
  logos: [
	{
      src: "https://ofn.gov.cz/static/images/ozp_logo_cz.jpg",
      alt: "Evropská unie - Evropský sociální fond - Operační program Zaměstnanost",
      height: 48,
      width: 231,
	  url: "https://www.esfcr.cz/"
    },
    {
      src: "https://ofn.gov.cz/static/images/logo.png",
      alt: "Otevřená data",
      height: 64,
      width: 64,
      url: "https://data.gov.cz/"
    }
  ],
  addSectionLinks: true,
  xref: true,
};

export function run(conf) {
  // assign the defaults
  const lint =
    conf.lint === false
      ? false
      : {
          ...coreDefaults.lint,
          ...odczDefaults.lint,
          ...conf.lint,
        };
  Object.assign(conf, {
    ...coreDefaults,
    ...odczDefaults,
    ...conf,
    lint,
  });
  
  
  // TODO: eventually, we want to remove this.
  // It's here for legacy support of json-ld specs
  // see https://github.com/w3c/respec/issues/2019
  Object.assign(conf, { definitionMap });
}