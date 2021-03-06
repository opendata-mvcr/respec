define(["exports", "../core/biblio", "../core/pubsubhub"], function (_exports, _biblio, _pubsubhub) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.run = run;
  _exports.name = void 0;
  // Module w3c/seo
  // Manages SEO information for documents
  // e.g. set the canonical URL for the document if configured
  const name = "odcz/seo";
  _exports.name = name;

  function run(conf) {
    const trLatestUri = conf.shortName ? "https://ofn.gov.cz/".concat(conf.shortName, "/") : null;

    switch (conf.canonicalURI) {
      case "edDraft":
        if (conf.edDraftURI) {
          conf.canonicalURI = new URL(conf.edDraftURI, document.location.href).href;
        } else {
          (0, _pubsubhub.pub)("warn", "Canonical URI set to edDraft, " + "but no edDraftURI is set in configuration");
          conf.canonicalURI = null;
        }

        break;

      case "TR":
        if (trLatestUri) {
          conf.canonicalURI = trLatestUri;
        } else {
          (0, _pubsubhub.pub)("warn", "Canonical URI set to TR, but " + "no shortName is set in configuration");
          conf.canonicalURI = null;
        }

        break;

      default:
        if (conf.canonicalURI) {
          try {
            conf.canonicalURI = new URL(conf.canonicalURI, document.location.href).href;
          } catch (err) {
            (0, _pubsubhub.pub)("warn", "CanonicalURI is an invalid URL: ".concat(err.message));
            conf.canonicalURI = null;
          }
        } else if (trLatestUri) {
          conf.canonicalURI = trLatestUri;
        }

    }

    if (conf.canonicalURI) {
      const linkElem = document.createElement("link");
      linkElem.setAttribute("rel", "canonical");
      linkElem.setAttribute("href", conf.canonicalURI);
      document.head.appendChild(linkElem);
    }

    if (conf.doJsonLd) {
      addJSONLDInfo(conf, document);
    }
  }

  async function addJSONLDInfo(conf, doc) {
    await doc.respecIsReady; // Content for JSON

    const type = ["TechArticle"];
    if (conf.rdfStatus) type.push(conf.rdfStatus);
    const jsonld = {
      "@context": ["http://schema.org", {
        "@vocab": "http://schema.org/",
        "@language": doc.documentElement.lang || "en",
        w3p: "http://www.w3.org/2001/02pd/rec54#",
        foaf: "http://xmlns.com/foaf/0.1/",
        datePublished: {
          "@type": "http://www.w3.org/2001/XMLSchema#date"
        },
        inLanguage: {
          "@language": null
        },
        isBasedOn: {
          "@type": "@id"
        },
        license: {
          "@type": "@id"
        }
      }],
      id: conf.canonicalURI || conf.thisVersion,
      type,
      name: conf.title,
      inLanguage: doc.documentElement.lang || "en",
      license: conf.licenseInfo.url,
      datePublished: conf.dashDate,
      copyrightHolder: {
        name: "World Wide Web Consortium",
        url: "https://www.w3.org/"
      },
      discussionUrl: conf.issueBase,
      alternativeHeadline: conf.subtitle,
      isBasedOn: conf.prevVersion
    }; // add any additional copyright holders

    if (conf.additionalCopyrightHolders) {
      const addl = Array.isArray(conf.additionalCopyrightHolders) ? conf.additionalCopyrightHolders : [conf.additionalCopyrightHolders];
      jsonld.copyrightHolder = [jsonld.copyrightHolder, ...addl.map(h => ({
        name: h
      }))];
    } // description from meta description


    const description = doc.head.querySelector("meta[name=description]");

    if (description) {
      jsonld.description = description.content;
    } // Editors


    if (conf.editors) {
      jsonld.editor = conf.editors.map(addPerson);
    }

    if (conf.authors) {
      jsonld.contributor = conf.authors.map(addPerson);
    } // normative and informative references


    jsonld.citation = [...conf.normativeReferences, ...conf.informativeReferences].map(ref => _biblio.biblio[ref]).filter(ref => typeof ref === "object").map(addRef);
    const script = doc.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonld, null, 2);
    doc.head.appendChild(script);
  } // Turn editors and authors into a list of JSON-LD relationships


  function addPerson({
    name,
    url,
    mailto,
    company,
    companyURL
  }) {
    const ed = {
      type: "Person",
      name,
      url,
      "foaf:mbox": mailto
    };

    if (company || companyURL) {
      ed.worksFor = {
        name: company,
        url: companyURL
      };
    }

    return ed;
  } // Create a reference URL from the ref


  function addRef(ref) {
    const {
      href: id,
      title: name,
      href: url
    } = ref;
    return {
      id,
      type: "TechArticle",
      name,
      url
    };
  }
});
//# sourceMappingURL=seo.js.map