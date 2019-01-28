import React from 'react';
import { Layout, Menu, Breadcrumb, Icon, Button, Row, Col, Form, Input } from 'antd';
import { Route, withRouter } from 'react-router-dom';

import DatasetOptionsForm from './DatasetOptionsForm';
import AlignmentsOptionsForm from './AlignmentsOptionsForm';

import { projectStore, Project } from './models/projects';

const { Component } = React;
const { Content } = Layout;
const FormItem = Form.Item;

class NewProject extends Component {
  state = {
    newProject: new Project(),
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
    await projectStore.setActiveProject(null);
  }

  start = async (e) => {
    e.preventDefault();
    
    const project = await projectStore.addProject(this.state.newProject);
    await projectStore.setActiveProject(project);
    
    const { activeProject } = projectStore.state;
    this.props.history.push(`/projects/${activeProject.state.id}/configure`);
  }

  createNewAlignment = async () => {
    this.setState({
      newProject: new Project(),
    });
    this.props.history.push('/projects/new/create');
  }

  validateExistingAlignment = async () => {
    this.setState({
      newProject: new Project(),
    });
    this.props.history.push('/projects/new/validate');
  }

  onSaveDataset = async (datasetType, fieldsValue, cb) => {
    console.log(datasetType, fieldsValue);
    const { newProject } = this.state;
    if (datasetType === 'source') {
      Object.assign(newProject.sourceDataset, fieldsValue);
    } else if (datasetType === 'target') {
      Object.assign(newProject.targetDataset, fieldsValue);
    } else if (datasetType === 'alignments') {
      Object.assign(newProject.alignments, fieldsValue);
    }
    this.setState({
      newProject,
    });
    cb();
  }

  onSaveAlignments = async (fieldsValue, cb) => {
    console.log(fieldsValue);
    const { newProject } = this.state;
    Object.assign(newProject.alignments, fieldsValue);
    this.setState({
      newProject,
    });
    cb();
  }

  handleProjectNameChange = (e) => {
    const { newProject } = this.state;
    newProject.name = e.target.value;
    this.setState({
      newProject,
    });
  }

  render() {
    const { newProject } = this.state;

    return (
      <Layout style={{ height: '100%' }}>
        <Route exact path="/projects/new" render={() =>
          <Layout style={{ height: '100%' }}>
            <Content style={{ background: '#fff', padding: 24, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h1>New project</h1>
              <p>What would you like to do?</p>
              <p>
                <Button type="primary" onClick={this.createNewAlignment}>Create a new alignment</Button>
              </p>
              <p>
                <Button type="primary" onClick={this.validateExistingAlignment}>Validate an existing alignment</Button>
              </p>
            </Content>
          </Layout>
        } />
        <Route path="/projects/new/create" render={() =>
          <Layout>
            <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
              <h1>Create a new alignment</h1>
              <p>So you want to create a new alignment? Okay!</p>
              <p>Start by entering a name for your new project.</p>
              <p>
                <strong>Project name</strong>
                <Input value={newProject.name} onChange={this.handleProjectNameChange} />
              </p>

              <p>Then upload your datasets (supported formats: Turtle, TriG, N-Triples, N-Quads, Notation3 (N3). By default, the format will be automatically detected.</p>
              <Row type="flex" gutter={16}>
                <Col>
                  <DatasetOptionsForm
                    label="Source Dataset"
                    dataset={newProject.sourceDataset}
                    datasetType="source"
                    onSave={this.onSaveDataset}
                  />
                </Col>
                <Col>
                  <DatasetOptionsForm
                    label="Target Dataset"
                    dataset={newProject.targetDataset}
                    datasetType="target"
                    onSave={this.onSaveDataset}
                  />
                </Col>
              </Row>

              <br />
              <p>Once you're done, we can start!</p>
              <p><Button type="primary" onClick={this.start}>Start</Button></p>
            </Content>
          </Layout>
        } />
        <Route path="/projects/new/validate" render={() =>
          <Layout>
            <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
              <h1>New project / Validate</h1>
              <p>So you want to validate an existing alignment? Okay!</p>
              <p>Start by entering a name for your new project.</p>
              <p>
                <strong>Project name</strong>
                <Input value={newProject.name} onChange={this.handleProjectNameChange} />
              </p>

              <p>Now upload your alignment file (<a href="http://alignapi.gforge.inria.fr/edoal.html" target="_blank" rel="noreferrer noopener">EDOAL</a> format).</p>
              <AlignmentsOptionsForm
                label="Alignments"
                alignments={newProject.alignments}
                onSave={this.onSaveAlignments}
              />

              <br />

              <p>Finally, upload the dataset(s) that contain the actual informations about the entities from your alignment file, because comparing URIs isn't fun (supported formats: Turtle, TriG, N-Triples, N-Quads, Notation3 (N3). By default, the format will be automatically detected.</p>
              <Row type="flex" gutter={16}>
                <Col>
                  <DatasetOptionsForm
                    label="Source Dataset"
                    dataset={newProject.sourceDataset}
                    datasetType="source"
                    onSave={this.onSaveDataset}
                  />
                </Col>
                <Col>
                  <DatasetOptionsForm
                    label="Target Dataset"
                    dataset={newProject.targetDataset}
                    datasetType="target"
                    onSave={this.onSaveDataset}
                  />
                </Col>
              </Row>
              <Row type="flex" gutter={16} style={{ marginTop: 32}}>
                <Col>
                  <Button type="primary" onClick={this.start}>Start</Button>
                </Col>
              </Row>
            </Content>
          </Layout>
        } />
      </Layout>
    )
  }
}

export default withRouter(Form.create()(NewProject));