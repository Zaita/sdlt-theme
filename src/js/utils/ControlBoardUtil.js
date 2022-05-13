// @flow

import {
  EVALUTION_RATING_1,
  EVALUTION_RATING_2,
  EVALUTION_RATING_3,
  EVALUTION_RATING_4,
} from "./../constants/values.js";

export default class ControlBoardUtil {
  static sortByAscending(controlsArray) {
    const collator = new Intl.Collator();

    return Object.fromEntries(
      Object.entries(controlsArray).sort((a, b) => {
        return collator.compare(a[1].name, b[1].name);
      })
    );
  }

  static sortByDescending(controlsArray) {
    const collator = new Intl.Collator();

    return Object.fromEntries(
      Object.entries(controlsArray).sort((a, b) => {
        return collator.compare(b[1].name, a[1].name);
      })
    );
  }

  static sortByKeyControlsFirst(controlsArray) {
    return Object.fromEntries(
      Object.entries(controlsArray).sort((a, b) => {
        return Number(b[1].isKeyControl) - Number(a[1].isKeyControl);
      })
    );
  }

  static sortByEffectiveness(controlsArray) {
    const sortOrder = [
      EVALUTION_RATING_4,
      EVALUTION_RATING_3,
      EVALUTION_RATING_2,
      EVALUTION_RATING_1,
    ];

    return Object.fromEntries(
      Object.entries(controlsArray).sort((a, b) => {
        return (
          sortOrder.indexOf(a[1].evalutionRating) -
          sortOrder.indexOf(b[1].evalutionRating)
        );
      })
    );
  }

  static sortByEvidenceAdded(controlsArray) {
    return Object.fromEntries(
      Object.entries(controlsArray).sort((a, b) => {
        if (a[1].implementationEvidenceUserInput === "") {
          return 1;
        }

        if (b[1].implementationEvidenceUserInput === "") {
          return -1;
        }

        if (a[1].implementationEvidenceUserInput === b[1].implementationEvidenceUserInput) {
          return 0;
        }
      })
    );
  }

  static sortByNumberOfRiskCategories(controlsArray) {
    return Object.fromEntries(
      Object.entries(controlsArray).sort((a, b) => {
        return b[1].riskCategories.length - a[1].riskCategories.length;
      })
    );
  }

  static sortByNone(columnOrder, columns, unorderedColumns) {
    columnOrder.map((columnId) => {
      const column = columns[columnId];
      const prevColumn = unorderedColumns[columnId] ? unorderedColumns[columnId] : [];
      const prevColumnControlIdsArray = prevColumn.controlIds;

      if (prevColumnControlIdsArray) {
        column.controlIds.sort(
          (a, b) =>
            prevColumnControlIdsArray.indexOf(a) -
            prevColumnControlIdsArray.indexOf(b)
        );
      }
    });

    return columns;
  }
}
