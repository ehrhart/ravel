import React, { Component } from 'react';
import { Link, NavLink, Route, withRouter } from 'react-router-dom';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { Layout, Menu, Breadcrumb, Button, Icon, Modal, Popover } from 'antd';
import { observer, inject } from 'mobx-react';
import { throttle } from 'lodash';

import NewProject from './NewProject';
import EditProject from './EditProject';
import Configure from './Configure';

import { projectStore } from './models/projects';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;
const { confirm } = Modal;

class ProjectsPage extends Component {
  state = {
    viewportWidth: 0,
    menuVisible: false,
  };

  componentDidMount = () => {
    // update viewportWidth on initial load
    this.saveViewportDimensions();
    // update viewportWidth whenever the viewport is resized
    window.addEventListener('resize', this.saveViewportDimensions);

    projectStore.loadProjects();
  }

  componentWillUnmount = () => {
    // clean up - remove the listener before unmounting the component
    window.removeEventListener('resize', this.saveViewportDimensions);
  }

  handleMenuVisibility = (menuVisible) => {
    this.setState({ menuVisible });
  };

  saveViewportDimensions = throttle(() => {
    this.setState({
      viewportWidth: window.innerWidth,
    })
  }, this.props.applyViewportChange);

  projectSettings = async (project) => {
    console.log('projectSettings', project);
    await projectStore.setActiveProject(project);
    this.props.history.push(`/projects/${project.id}/settings`);
  }

  openProject = async (project) => {
    await projectStore.setActiveProject(project);
    this.props.history.push(`/projects/${project.id}/configure`);
  }

  createProject = async () => {
    await projectStore.setActiveProject(null);
    this.props.history.push('/projects/new');
    //const newProject = await projectStore.addProject({ name: 'Untitled Project ' + Date.now() });
    //this.projectSettings(newProject);
  }

  removeProject = async (project) => {
    confirm({
      title: 'Delete this project?',
      content: (<span>You are about to delete the project "<strong>{project.name}</strong>". This action can not be undone.</span>),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        if (projectStore.state.activeProject && project.id === projectStore.state.activeProject.state.id) {
          this.props.history.push(`/projects`);
        }
        projectStore.removeProject(project);
      },
    });
  }

  renderProject = (project) => {
    return (
      <SubMenu key={project.id} title={<span><Icon type="folder" />{project.name}</span>}>
        <Menu.Item key={`${project.id}#settings`} onClick={() => { this.projectSettings(project) }}>
          <Icon type="setting" />
          <span>Settings</span>
        </Menu.Item>
        <Menu.Item key={`${project.id}#open`} onClick={() => { this.openProject(project) }}>
          <Icon type="profile" />
          <span>Open</span>
        </Menu.Item>
        <Menu.Item key={`${project.id}#delete`} onClick={() => { this.removeProject(project) }}>
          <Icon type="delete" />
          <span>Delete</span>
        </Menu.Item>
      </SubMenu>
    )
  }

  render() {
    const { projects, activeProject } = projectStore.state;

    console.log('viewportWidth: ', this.state.viewportWidth);

    const Breadcrumbs = withBreadcrumbs([
      { path: '/projects/new', breadcrumb: 'New project' },
      { path: '/projects/:id', breadcrumb: ({ match }) => {
        const project = projectStore.findById(match.params.id);
        if (project) {
          return <span>{project.name}</span>;
        }
        return <span>{match.params.id}</span>;
      }}
    ])(({ breadcrumbs }) => (
      <div>
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.key}>
            <NavLink to={breadcrumb.props.match.url}>
              {breadcrumb}
            </NavLink>
            {(index < breadcrumbs.length - 1) && <i> / </i>}
          </span>
        ))}
      </div>
    ));

    const { viewportWidth } = this.state;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        {viewportWidth > 767 && (
          <Route path="/projects/:id" render={() => (
            <Sider width={240} style={{ background: '#fff' }}>
              <Menu
                //onClick={this.handleClick}
                //selectedKeys={[this.state.current]}
                mode="horizontal"
              >
                <Menu.Item
                  key="setting:1"
                  onClick={this.createProject}
                  style={{ width: '100%', textAlign: 'center' }}
                >New project</Menu.Item>
              </Menu>
              { /* <Button type="primary" onClick={() => { projectStore.updateProject({ 'id': '5c10d5962805c811fb912265', 'name': 'UPD ' + Math.random() })}}>Test</Button>
              <Button type="primary" onClick={() => { projectStore.setActiveProject(projects[0]) }}>Test 2</Button>
              <Button type="primary" onClick={() => { projectStore.update(s => s.activeProject.state.name = 'wtf') }}>Test 3</Button> */ }
              <Menu
                mode="inline"
                style={{ borderRight: 0 }}
              >
                {projects.map(this.renderProject)}
              </Menu>
            </Sider>
          )} />
        )}
        <Layout>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumbs />
            {/*<Breadcrumb style={{ margin: '16px 0' }}>

              {activeProject && <Breadcrumb.Item>{activeProject.state.name}</Breadcrumb.Item>}
            </Breadcrumb>
          */}
            <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
              <Route exact path="/projects" render={() => (
                <div>
                  <h1>Workspace</h1>
                  <p><span>Please select a project, or create a new one.</span></p>
                  <p><Button type="primary" onClick={this.createProject}>New project</Button></p>
                  <Menu
                    mode="inline"
                    style={{ borderRight: 0 }}
                  >
                    {projects.map(this.renderProject)}
                  </Menu>
                </div>
              )} />
              <Route path="/projects/new" component={NewProject} />
              <Route path="/projects/:id/settings" component={EditProject} />
              <Route path="/projects/:id/configure" component={Configure} />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(ProjectsPage);