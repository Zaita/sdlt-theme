// @flow

import type {Siteconfig} from "../types/SiteConfig";
import React from "react";
import { Link } from "react-router-dom";
import get from "lodash/get";
import toString from "lodash/toString";
import DefaultLogoImage from "../../img/sdlt_base_logo.png";
import DefaultBackgroundImage from "../../img/Home/background.jpg";
import DefaultPDFHeaderImage from "../../img/PDF/heading.jpg";
import DefaultPDFFooterImage from "../../img/PDF/footer.jpg";
import DefaultSubHeaderImage from "../../img/Home/subheader.jpg";

export default class SiteConfigParser {
  static parseSiteConfigFromJSON(siteConfigJSON: string | Object): Siteconfig {
    const jsonObject = (typeof siteConfigJSON === "string" ? JSON.parse(siteConfigJSON) : siteConfigJSON);
    const defaultFooterText = <Link to="https://github.com/zaita/sdlt" target="_blank">SDLT on GitHub</Link>;

    var fct = toString(get(jsonObject, "FooterCopyrightText", ''));
    if (fct == '') { fct = defaultFooterText; }

    // Ensure defaults are configured for when user-contributed config doesn't yet exist
    return {
      siteTitle: toString(get(jsonObject, "Title") || 'SDLT'),
      footerCopyrightText: fct,
      logoPath: toString(get(jsonObject, "LogoPath", '') || DefaultLogoImage),
      homePageBackgroundImagePath: toString(get(jsonObject, "HomePageBackgroundImagePath", '') || DefaultBackgroundImage),
      pdfHeaderImageLink: toString(get(jsonObject, "PdfHeaderImageLink", '') || DefaultPDFHeaderImage),
      pdfFooterImageLink: toString(get(jsonObject, "PdfFooterImageLink", '') || DefaultPDFFooterImage),
      securityTeamEmail: toString(get(jsonObject, "SecurityTeamEmail") || ''),
      homePageSubHeaderImagePath: toString(get(jsonObject, "HomePageSubHeaderImagePath", '') || DefaultSubHeaderImage),
    }
  }
}
