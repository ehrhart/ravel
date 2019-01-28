import React from 'react';
import { Layout, Menu, Breadcrumb, Icon, Button, Row, Col, Form, Input } from 'antd';
import { withRouter } from 'react-router-dom';

import ProjectSettingsForm from './ProjectSettingsForm';

import { projectStore } from './models/projects';

import Api from './Api';

const { Component } = React;

class EditProject extends Component {
  state = {
  };

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.onRouteChanged();
    }
  }

  componentDidMount() {
    this.onRouteChanged();
  }

  onRouteChanged = async () => {
    const projectId = this.props.match.params.id;
    const project = (await Api.get(`projects/${projectId}`)).data;
    if (project) {
      console.log('onRouteChanged, project: ', project);
      await projectStore.setActiveProject(project);
    }
  }

  /*
  start = async (e) => {
    e.preventDefault();
    
    const { activeProject } = projectStore.state;
    this.props.history.push(`/projects/${activeProject.state.id}/configure`);
  }
  */

  render() {
    const { activeProject } = projectStore.state;

    return (
      <div>
        {activeProject && (<ProjectSettingsForm project={activeProject} />)}
      </div>
    )
  }
}

export default withRouter(EditProject);