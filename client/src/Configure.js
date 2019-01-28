import React from 'react';
import { Layout, Menu, AutoComplete, Breadcrumb, Button, Form, Input, Select, Modal, Radio } from 'antd';
import { withRouter } from 'react-router-dom';

import RDFPropertiesTable from './RDFPropertiesTable';
import CustomizedForm from './CollectionCreateForm';

import { projectStore } from './models/projects';

import Api from './Api';

const { Component, PureComponent } = React;
const { Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;

class Configure extends Component {
  state = {
    loading: false,
    modalVisible: false,
    formValues: {},
    mapPropsToFields: {},
    addOrEdit: true,
    rdfTypes: [],
    rdfProperties: [],
  }

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

      const { activeProject } = projectStore.state;
      const loadedSourceDataset = await activeProject.state.loadDataset(activeProject.state.sourceDataset);
      const loadedTargetDataset = await activeProject.state.loadDataset(activeProject.state.targetDataset);
      this.setState({
        loadedSourceDataset,
        loadedTargetDataset,
        rdfTypes: loadedSourceDataset.rdfTypes || [],
      });
      this.loadRdfProperties();
    }
  }

  onSelectSourceRdfType = (value) => {
    console.log(`onSelectSourceRdfType, selected ${value}`);
    
    projectStore.state.activeProject.update(s => s.selectedSourceRdfType = value);

    // Save changes
    projectStore.updateProject(projectStore.state.activeProject);

    this.loadRdfProperties();
  }

  onSelectTargetRdfType = (value) => {
    console.log(`onSelectTargetRdfType, selected ${value}`);
    
    projectStore.state.activeProject.update(s => s.selectedTargetRdfType = value);

    // Save changes
    projectStore.updateProject(projectStore.state.activeProject);

    this.loadRdfProperties();
  }

  loadRdfProperties = () => {
    if (!projectStore.state.activeProject) {
      console.log('loadRdfProperties: Project not found');
      return;
    }

    if (!this.state.loadedSourceDataset.store) {
      console.log('loadRdfProperties: Store not found');
      return;
    }
    
    const { selectedSourceRdfType } = projectStore.state.activeProject.state;
    if (!selectedSourceRdfType) {
      console.log('loadRdfProperties: No selected RDF type');
      return;
    }

    const { store } = this.state.loadedSourceDataset;

    console.log('LOAD RDF PROPERTIES');

    var sparqlQuery = 
      `SELECT DISTINCT ?p WHERE {
         ?s a <${selectedSourceRdfType}> .
         ?s ?p ?o .
      }`;

    let rdfProperties = [];
    const subjects = store.getSubjects('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', selectedSourceRdfType).map(o => o.id);
    subjects.forEach(subj => {
      const predicates = store.getPredicates(subj).map(o => o.id);
      rdfProperties.push(...predicates);
    });
    rdfProperties = [...new Set(rdfProperties)];
    this.setState({
      rdfProperties,
    });
  }

  addProperty = (e) => {
    e.preventDefault();

    this.setState({
      mapPropsToFields: {},
      addOrEdit: true,
    });
    this.handleModalVisible(true);
  }

  handleAdd = (fields) => {
    console.log('Received form fields: ', fields);

    // Update Selected RDF Properties
    const { mapPropsToFields, addOrEdit } = this.state;

    if (addOrEdit) {
      // Add
      projectStore.state.activeProject.update(s => {
        s.selectedRdfProperties = [...s.selectedRdfProperties, {
          propertyName: fields.propertyName,
          type: fields.type,
          label: fields.label
        }];
      });
      this.setState({
        modalVisible: false,
      });
    } else {
      // Edit
      projectStore.state.activeProject.update(s => {
        s.selectedRdfProperties.forEach(p => {
          if (p.propertyName === mapPropsToFields.propertyName) {
            p = Object.assign(p, fields);
          }
        });
      });
      this.setState({
        modalVisible: false,
      });
    }

    // Save changes
    projectStore.updateProject(projectStore.state.activeProject);
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  moveProperty = (dragIndex, hoverIndex) => {
    console.log('moveProperty', dragIndex, hoverIndex);

    const { activeProject } = projectStore.state;
    activeProject.update(s => {
      const selectedRdfProperties = s.selectedRdfProperties.slice();
      const dragRow = selectedRdfProperties[dragIndex];
      selectedRdfProperties.splice(dragIndex, 1);
      selectedRdfProperties.splice(hoverIndex, 0, dragRow);
      s.selectedRdfProperties = selectedRdfProperties.slice();
    });

    // Save changes
    projectStore.updateProject(projectStore.state.activeProject);
  }

  editProperty = (row) =>{
    this.setState({
      mapPropsToFields: row,
      addOrEdit: false,
    });
    this.handleModalVisible(true);
  }

  removeProperty = (row) =>{
    const { activeProject } = projectStore.state;
    activeProject.update(s => {
      s.selectedRdfProperties = s.selectedRdfProperties.filter(o => o.propertyName !== row.propertyName); 
    });

    // Save changes
    projectStore.updateProject(projectStore.state.activeProject);
  }

  start = (e) => {
    e.preventDefault();

    const { activeProject } = projectStore.state;
    this.props.history.push(`/compare/${activeProject.state.id}`);
  }

  render() {
    console.log('Configure.render', this.props);

    const { activeProject } = projectStore.state;
    if (!activeProject) {
      return null;
    }

    const { rdfTypes, rdfProperties } = this.state;
    const rdfTypesList = rdfTypes.map(function(name) {
      return <Option key={name} value={name}>{name}</Option>;
    });

    const { modalVisible, mapPropsToFields, addOrEdit } = this.state;

    return (
      <div>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
          <strong>Select the Source Type:</strong>
          <Select
            defaultValue={activeProject.state.selectedSourceRdfType}
            showSearch
            style={{ width: '100%' }}
            placeholder="Select an RDF type"
            optionFilterProp="children"
            onChange={this.onSelectSourceRdfType}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {rdfTypesList}
          </Select>

          <br /><br />

          <strong>Select the Target Type:</strong>
          <Select
            defaultValue={activeProject.state.selectedTargetRdfType}
            showSearch
            style={{ width: '100%' }}
            placeholder="Select an RDF type"
            optionFilterProp="children"
            onChange={this.onSelectTargetRdfType}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {rdfTypesList}
          </Select>

          <br /><br />

          <p>Properties to display:</p>
          <RDFPropertiesTable
            data={activeProject.state.selectedRdfProperties}
            onMoveRow={this.moveProperty}
            onEdit={this.editProperty}
            onRemove={this.removeProperty}
          />

          <p style={{ textAlign: 'right' }}><Button type="primary" onClick={this.addProperty}>Add property</Button></p>

          <br />

          <p><Button type="primary" onClick={this.start}>Start</Button></p>
        </Content>

        <CustomizedForm
          rdfProperties={rdfProperties}
          handleAdd={this.handleAdd}
          handleModalVisible={this.handleModalVisible}
          modalVisible={modalVisible}
          addOrEdit={addOrEdit}
          mapPropsToFields = {mapPropsToFields}
        />
      </div>
    )
  }
}

export default withRouter(Configure);