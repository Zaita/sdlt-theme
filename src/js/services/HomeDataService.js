// @flow

import React, {Component} from "react";
import type {HomeState} from "../store/HomeState";

import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import LightBulbIcon from "@mui/icons-material/Lightbulb";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';

import get from "lodash/get";
import toString from "lodash/toString";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Pillar} from "../types/Pillar";
import type {Task} from "../types/Task";
import TaskParser from "../utils/TaskParser";
import SubmissionList from "../components/QuestionnaireSubmissionList/MySubmissionList";


export default class HomeDataService {

  static async fetchHomeData(): Promise<HomeState> {
    // GraphQL
    const query = `
query {
  readDashboard {
    Title
    Subtitle
    TitleText
    SubtitleText
    Pillars {
      Label
      Caption
      Type
      Disabled
      Questionnaire {
        ID
      }
    }
    Tasks {
      ID
      Name
      TaskType
      ComponentTarget
    }
  }
}`;
    

    // Send request
    const json = await GraphQLRequestHelper.request({query});
    const data = get(json, "data.readDashboard", []);
    if (!Array.isArray(data) || data.length === 0) {
      throw DEFAULT_NETWORK_ERROR;
    }

    // Parse data for use in frontend
    const dashboardJSON = data[0];

    const title = toString(get(dashboardJSON, "Title", ""));
    const subtitle = toString(get(dashboardJSON, "Subtitle", ""));
    const titleText = toString(get(dashboardJSON, "TitleText", ""));
    const subtitleText = toString(get(dashboardJSON, "SubtitleText", ""));

    const pillarsJSONArray = get(dashboardJSON, "Pillars", []);
    const pillars = this.parsePillars(pillarsJSONArray);

    const taskJSONArray = get(dashboardJSON, "Tasks", []);
    const tasks = this.parseTasks(taskJSONArray);


    // const submissionList = 

    return {
      title,
      titleText,
      subtitle,
      subtitleText,
      pillars,
      tasks,
    };
  }

  static parsePillars(pillarsJSONArray: Array<*>): Array<Pillar> {
    if (!Array.isArray(pillarsJSONArray)) {
      return [];
    }
    const pillars = pillarsJSONArray.map(item => {
      let icon = <CloseIcon/>;
      switch (item["Type"]) {
        case "question_answer":
          icon =  <QuestionAnswerRoundedIcon/>;
          break;
        case "lightbulb":
          icon = <LightBulbIcon/>;
          break;
        case "cloud_download":
          icon = <CloudDownloadIcon/>;
          break;
        case "shield":
          icon = <SecurityIcon/>;
          break;
        case "bug":
          icon = <BugReportIcon/>;
          break;                  
      }

      return {
        title: toString(get(item, "Label", "")),
        caption: toString(get(item, "Caption", "")),
        disabled: Boolean(get(item, "Disabled", true)),
        questionnaireID: toString(get(item, "Questionnaire.0.ID", "")),
        icon: icon,
      };
    });
    return pillars;
  }

  static parseTasks(tasksJSONArray: Array<*>): Array<Task> {
    if (!Array.isArray(tasksJSONArray)) {
      return [];
    }

    const tasks = [];
    tasksJSONArray.forEach((taskJSON) => {
      const task = TaskParser.parseFromJSONObject(taskJSON);
      tasks.push(task);
    });
    return tasks;
  }
}
