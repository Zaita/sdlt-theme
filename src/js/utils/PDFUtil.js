// @flow

import pdfMake from "pdfmake/build/pdfmake";
import vfsFonts from "pdfmake/build/vfs_fonts";
import type { AnswerAction, AnswerInput, Question } from "../types/Questionnaire";
import React from "react";
import StringUtil from "./StringUtil";
import _ from "lodash";
import type { User } from "../types/User";
import moment from "moment";
import SiteConfigParser from "../utils/SiteConfigParser";
import html2canvas from "html2canvas";
import htmlToPdfMake from "html-to-pdfmake"

type GeneratePDFArgument = {
  questions: Array<Question>,
  submitter: User,
  questionnaireTitle: string
}

async function getImageDataByBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", (event: *) => {
      resolve(event.target.result);
    });
    reader.readAsDataURL(blob);
  });
}

async function getImageDataByURL(imageURL: string) {
  const response = await fetch(imageURL);
  const blob = await response.blob();
  const data = await getImageDataByBlob(blob);
  return data;
}

export default class PDFUtil {
  static async downloadCertificate(args: GeneratePDFArgument) {
    const { vfs } = vfsFonts.pdfMake;
    pdfMake.vfs = vfs;

    const { siteConfig } = { ...args };

    const documentDefaultOverrides = {
      defaultStyles: {
        h5: {
          fontSize: 10,
          marginTop: 10,
        },
        h3: {
          fontSize: 12,
        },
        p: {
          margin: [0, 1, 0, 5],
        },
      },
    };

    // Header image
    const headingImageData = await getImageDataByURL(siteConfig.pdfHeaderImageLink);

    // Convert canvas to jpeg for pdfmake
    const riskTableCanvasData = await html2canvas(
      document.getElementById("risk-container"),
      { scale: 3 }
    ).then((canvas) => canvas.toDataURL("image/jpeg", 1));

    const recommendationsTableCanvasData = await html2canvas(
      document.getElementById("recommendations-table"),
      { scale: 3 }
    ).then((canvas) => canvas.toDataURL("image/jpeg", 1));

    const taskTableCanvasData = await html2canvas(
      document.getElementById("task-container"),
      { scale: 3 }
    ).then((canvas) => canvas.toDataURL("image/jpeg", 1));

    // Parse HTML to make content pdfmake compatible
    const reportHeadingLeftContent = htmlToPdfMake(
      document.getElementsByClassName("report-heading-left-container")[0].innerHTML,
      documentDefaultOverrides
    );
    const reportIntroContent = htmlToPdfMake(
      document.getElementsByClassName("report-intro-container")[0].innerHTML,
      documentDefaultOverrides
    );
    const certificateContent = htmlToPdfMake(
      document.getElementById("certificate-container").innerHTML,
      documentDefaultOverrides
    );
    const riskProfileContent = htmlToPdfMake(
      document.getElementById("risk-profile").innerHTML,
      documentDefaultOverrides
    );

    // PDF definition, and content order, and styles.
    let documentDefinition = {
      pageSize: "A4",
      pageMargins: [50, 70, 50, 40],
      header: {
        image: headingImageData,
        alignment: "center",
        width: 500,
      },
      content: [
        reportHeadingLeftContent,
        reportIntroContent,
        certificateContent,
        riskProfileContent,
        {
          image: riskTableCanvasData,
          fit: [750, 750],
          margin: [0, 0, 0, 20],
        },
        {
          image: recommendationsTableCanvasData,
          fit: [750, 750],
          margin: [0, 0, 0, 20],
        },
        {
          image: taskTableCanvasData,
          fit: [750, 750],
          margin: [0, 0, 0, 20],
        },
      ],
      pageBreakBefore: function (currentNode) {
        return (currentNode.style && currentNode.style.indexOf("pdf-pagebreak-before") > -1);
      },
      defaultStyle: {
        fontSize: 9,
      },
    };

    const info = {
      title: "Certification & Accreditation Report.pdf",
    };

    try {
      await pdfMake.createPdf(documentDefinition).download(info.title);
    } catch {
      alert("Unable to generate your PDF. Maybe you have a browser Ad-Block extension enabled?");
    }
  }

  static async generatePDF(args: GeneratePDFArgument) {
    const { questions, submitter, questionnaireTitle, siteConfig, result, riskResults } = { ...args };

    const defaultFontSize = 12;
    const content = [];
    const styles = {
      questionnaireTitle: {
        bold: true,
        fontSize: defaultFontSize + 4,
        color: "#004071",
        alignment: "center"
      },
      siteTitle: {
        bold: true,
        fontSize: defaultFontSize,
        color: "#004071",
        alignment: "center"
      },
      sectionHeading: {
        bold: true,
        fontSize: defaultFontSize + 2,
        color: "#004071"
      },
      questionHeading: {
        bold: true,
      },
    };
    const defaultStyle = {
      fontSize: defaultFontSize
    };
    const info = {
      title: `${questionnaireTitle} - ${submitter.name}.pdf`
    };

    const { vfs } = vfsFonts.pdfMake;
    pdfMake.vfs = vfs;

    // Header image
    const headingImageData = await getImageDataByURL(siteConfig.pdfHeaderImageLink);

    content.push({
      image: headingImageData,
      width: 500, // Page size A4 in 72 dpi (web) = 595 X 842 pixels,
      margin: [0, 0, 0, defaultFontSize]
    });

    // Questionnaire title
    content.push({
      text: questionnaireTitle,
      style: "questionnaireTitle",
      margin: [0, 0, 0, defaultFontSize / 2],
    });

    // Site title
    content.push({
      text: siteConfig.siteTitle,
      style: "siteTitle",
      margin: [0, 0, 0, defaultFontSize * 2],
    });

    // Submitter info
    content.push({
      text: `Submitted by:`,
      style: "sectionHeading",
      margin: [0, 0, 0, defaultFontSize],
    });

    content.push({
      text: `Name: ${submitter.name}`,
      style: "questionHeading",
      margin: [0, 0, 0, defaultFontSize / 2],
    });

    content.push({
      text: `Email: ${submitter.email}`,
      margin: [0, 0, 0, defaultFontSize * 2],
    });

    if (result) {
      content.push({
        text: `Result:`,
        style: "sectionHeading",
        margin: [0, 0, 0, defaultFontSize],
      });
      content.push({
        text: `${result}`,
        margin: [0, 0, 0, defaultFontSize * 2],
      });
    }

    // Response heading
    content.push({
      text: `Responses`,
      style: "sectionHeading",
      margin: [0, 0, 0, defaultFontSize],
    });

    // Questions
    questions.forEach((question, index) => {
      // Heading of questions
      content.push({
        text: `${index + 1}. ${question.heading}`,
        style: "questionHeading",
        margin: [0, 0, 0, defaultFontSize / 2],
      });

      // Non-applicable questions
      if (!question.isApplicable) {
        content.push({
          text: "(Not applicable)",
          margin: [0, 0, 0, defaultFontSize],
        });
        return;
      }

      // Empty-answer questions
      if (!question.hasAnswer) {
        content.push({
          text: "(Has no answer)",
          margin: [0, 0, 0, defaultFontSize],
        });
        return;
      }

      // Input-type questions
      if (question.type === "input" && question.inputs && Array.isArray(question.inputs) && question.inputs.length > 0) {
        const renderInputData = (input: AnswerInput) => {
          let data: string = input.data || "";
          // Format data
          if (input.type === "date") {
            data = moment(data).format("DD-MM-YYYY");
          }
          // Format textarea or "product aspects"
          if (input.type === "textarea" || input.type === "product aspects") {
            data = "\n" + data;
          }

          // Format radio button data: replace value with label
          if (input.type === "radio" && data) {
            const option = input.options.find((option => {
              return option.value === data
            }));
            if (option) {
              data = option.label;
            }
          }

          // Format checkbox data: replace value with label
          if (input.type === "checkbox" && data && data !== "[]") {
            const selectedOptions = JSON.parse(data);

            const dataArr = input.options.filter((option) => {
              return selectedOptions.includes(option.value);
            }).map((option) => {
              return option.label;
            })

            data = dataArr.join(', ');
          }

          return data;
        };

        // For multiple-inputs question, display their labels
        if (question.inputs.length > 1) {
          question.inputs.forEach((input, index, arr) => {
            const isLast = (index === arr.length - 1);
            content.push({
              text: `${input.label}: ${StringUtil.toString(renderInputData(input))}`,
              margin: [0, 0, 0, isLast ? defaultFontSize : parseInt(`${defaultFontSize / 3}`)],
            });
          });
          return;
        }

        // For single-input question, display its answer directly
        content.push({
          text: renderInputData(question.inputs[0]).trim(),
          margin: [0, 0, 0, defaultFontSize],
        });
        return;
      }

      // Action-type questions
      if (question.type === "action" && question.actions && Array.isArray(question.actions)) {
        let action: AnswerAction = _.head(question.actions.filter((action) => action.isChose));
        content.push({
          text: action.label,
          margin: [0, 0, 0, defaultFontSize],
        });
      }
    });

    if (typeof riskResults === 'object' && riskResults.length > 0) {
      let results = [
        [
          { text: 'Risk Name', bold: true, alignment: 'center' },
          { text: 'Weights', bold: true, alignment: 'center' },
          { text: 'Score', bold: true, alignment: 'center' },
          { text: 'Rating', bold: true, alignment: 'center' },
        ]
      ];
      riskResults.forEach(function (result, i) {
        let resultObj = { text: result.rating, alignment: 'center', color: '#' + result.colour, bold: true };

        if (result.rating == 'Unknown') {
          resultObj = { text: 'Unknown', alignment: 'center', color: '#000000', bold: true };
        }


        results.push([
          { text: result.riskName },
          result.weights,
          result.score,
          resultObj
        ])
      })
      content.push({
        table: {
          headerRows: 1,
          //actual rendered width of footer and header images
          widths: [237, 75, 75, 75],
          body: results
        },
        width: 500,
        margin: [0, 0, 0, defaultFontSize]
      });
    }

    // Footer image
    const footerImageData = await getImageDataByURL(siteConfig.pdfFooterImageLink);

    content.push({
      image: footerImageData,
      width: 500,
      margin: [0, 0, 0, defaultFontSize]
    });

    try {
      await pdfMake.createPdf({ info, content, styles, defaultStyle }).download(info.title);
    } catch {
      alert("Unable to generate your PDF. Maybe you have a browser Ad-Block extension enabled?");
    }

  }

  static async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.readAsDataURL(blob);
    });
  }
}
