// @flow

import React, {Component} from "react";
import Pillar from "./Pillar";
import TaskButton from "./TaskButton";
import type {HomeState} from "../../store/HomeState";
import type {SiteConfig} from "../../store/SiteConfig";
import type {Task} from "../../types/Task";
import Header from "../Header/Header";
import MySubmissionList from "../QuestionnaireSubmissionList/DashboardSubmissionList";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

type Props = {
  homeState: HomeState,
  siteConfig: SiteConfig,
};

class Home extends Component<Props> {

  render() {
    const {title, titleText, subtitle, subtitleText, pillars, tasks} = {...this.props.homeState};
    const {logoPath, homePageSubHeaderImagePath} = {...this.props.siteConfig};

    return (
      <div className="Home">        
        <Header logopath={logoPath} subHeaderImagePath={homePageSubHeaderImagePath}/>
        <div className="layout">
          <div className="title-box">{title}</div>
          <div className="sdlt-description">{titleText}</div>  

          <div className="create-text">{subtitle}</div>
          <div className="create-help">{subtitleText}</div>       
          <div className="pillars">
            
            <div className="pillar-row">
              {pillars.map((pillar, index) => {
                return (
                  <Pillar link={`/questionnaire/start/${pillar.questionnaireID}`}
                          classes={["pillar-col", "mx-1"]}
                          pillar={pillar}
                          key={'pillar_'+(index+1)}
                  />
                );
              })}
            </div>
          </div>
          <div className="tasks">
            {tasks.map((task: Task, index) => {
              let link = `/tasks/standalone/${task.id}`;
              if (task.type === "selection") {
                link = `/component-selection/standalone/${task.id}?componentTarget=${task.componentTarget}`;
              }
              return (
                <TaskButton link={link} classes={["mx-1"]} title={task.name} key={'standalone_task_'+(index+1)}/>
              );
            })}
          </div>
          <div className="submissions">
            <div className="submission-text">Your latest submissions</div>
            <MySubmissionList/>
          </div>
            <div className="view-all-submissions"><a href="#">See all submissions <NavigateNextIcon/></a></div>
        </div>
      </div>
    );
  }
}

export default Home;
