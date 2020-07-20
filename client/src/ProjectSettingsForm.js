import React from 'react';
import { Layout, Row, Col, Input, Divider } from 'antd';

import DatasetOptionsForm from './DatasetOptionsForm';
import AlignmentsOptionsForm from './AlignmentsOptionsForm';

import { debounce } from './helpers/utils';
import { projectStore } from './models/projects';

const { Content } = Layout;

class ProjectSettingsForm extends React.Component {
  state = {
    isSaving: false,
  };

  onSaveDataset = async (datasetType, fieldsValue, cb) => {
    this.setState({
      isSaving: true,
    }, async ()  => {
      const { activeProject } = projectStore.state;
      if (datasetType === 'source') {
        Object.assign(activeProject.state.sourceDataset, fieldsValue);
      } else if (datasetType === 'target') {
        Object.assign(activeProject.state.targetDataset, fieldsValue);
      }
      await projectStore.updateProject(activeProject);
      this.setState({
        isSaving: false,
      });
      cb();
    });
  }

  onSaveAlignments = async (fieldsValue, cb) => {
    this.setState({
      isSaving: true,
    }, async ()  => {
      const { activeProject } = projectStore.state;
      Object.assign(activeProject.state.alignments, fieldsValue);
      await projectStore.updateProject(activeProject);
      this.setState({
        isSaving: false,
      });
      cb();
    });
  }

  debounceEventHandler(...args) {
    const debounced = debounce(...args);
    return function(e) {
      e.persist();
      return debounced(e);
    }
  }

  handleProjectNameChange = async (e) => {
    const { project } = this.props;
    project.update(s => s.name = e.target.value);
    this.updateProjectName();
  }

  updateProjectName = debounce(async () => {
    const { project } = this.props;
    await projectStore.updateProject(project);
  }, 500)

  render() {
    return (
      <Layout>
        <Content style={{ background: '#fff', margin: 0, minHeight: 280 }}>
          <div>
            <label><strong>Project name</strong></label>
            <Input value={this.props.project.state.name} onChange={this.handleProjectNameChange} />
          </div>

          <Divider />

          <Row type="flex" gutter={16}>
            <Col>
              <DatasetOptionsForm
                label="Source Dataset"
                dataset={this.props.project.state.sourceDataset}
                datasetType="source"
                onSave={this.onSaveDataset}
                isSaving={this.state.isSaving}
              />
            </Col>
            <Col>
              <DatasetOptionsForm
                label="Target Dataset"
                dataset={this.props.project.state.targetDataset}
                datasetType="target"
                onSave={this.onSaveDataset}
                isSaving={this.state.isSaving}
              />
            </Col>
          </Row>
          <Row type="flex" gutter={16} style={{ marginTop: 32 }}>
            <Col>
              <AlignmentsOptionsForm
                label="Alignments"
                alignments={this.props.project.state.alignments}
                onSave={this.onSaveAlignments}
                isSaving={this.state.isSaving}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    )
  }
}

export default ProjectSettingsForm;