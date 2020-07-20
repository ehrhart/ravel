import React, { Component } from 'react';
import { Link, NavLink, Route, withRouter } from 'react-router-dom';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { Layout, Menu, Button, Modal, Typography, Divider } from 'antd';
import { CheckOutlined, PlusOutlined, DeleteOutlined, ProfileOutlined, SettingOutlined, FolderOutlined } from '@ant-design/icons';

import NewProject from './NewProject';
import EditProject from './EditProject';
import Configure from './Configure';

import { throttle } from './helpers/utils';
import { projectStore } from './models/projects';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;
const { confirm } = Modal;
const { Title, Paragraph } = Typography;

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
    await projectStore.setActiveProject(project);
    this.props.history.push(`/projects/${project.id}/settings`);
  }

  projectConfiguration = async (project) => {
    await projectStore.setActiveProject(project);
    this.props.history.push(`/projects/${project.id}/configure`);
  }

  startProject = async (project) => {
    await projectStore.setActiveProject(project);
    this.props.history.push(`/compare/${project.id}`);
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

  start = (e) => {
    e.preventDefault();

    this.props.history.push(`/compare/${projectStore.state.activeProject.state.id}`);
  }

  renderProjectMenuItem = (project) => {
    return (
      <SubMenu key={project.id} title={<span><FolderOutlined />{project.name}</span>}>
        <Menu.Item key={`${project.id}#settings`} onClick={() => { this.projectSettings(project) }}>
          <SettingOutlined />
          <span>Project Settings</span>
        </Menu.Item>
        <Menu.Item key={`${project.id}#configure`} onClick={() => { this.projectConfiguration(project) }}>
          <ProfileOutlined />
          <span>Configure Properties</span>
        </Menu.Item>
        <Menu.Item key={`${project.id}#compare`} onClick={() => { this.startProject(project) }}>
          <CheckOutlined />
          <span>Start Comparison</span>
        </Menu.Item>
        <Menu.Item key={`${project.id}#delete`} onClick={() => { this.removeProject(project) }}>
          <DeleteOutlined />
          <span>Delete</span>
        </Menu.Item>
      </SubMenu>
    )
  }

  render() {
    const { projects, activeProject } = projectStore.state;

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
            <NavLink to={breadcrumb.match.url}>
              {breadcrumb.breadcrumb}
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
          <Route path="/projects" render={() => (
            <Sider width={240} style={{ background: '#fff' }}>
              <Title className="logo">
                <Link to="/projects">RAVEL</Link>
              </Title>
              <Divider />
              <Menu
                //onClick={this.handleClick}
                //selectedKeys={[this.state.current]}
                mode="inline"
                style={{ borderRight: 0 }}
              >
                <Menu.Item
                  key="setting:1"
                  onClick={this.createProject}
                >
                  <PlusOutlined />
                  <span>New project</span>
                </Menu.Item>
                {projects.map(this.renderProjectMenuItem)}
              </Menu>
              { /* <Button type="primary" onClick={() => { projectStore.updateProject({ 'id': '5c10d5962805c811fb912265', 'name': 'UPD ' + Math.random() })}}>Test</Button>
              <Button type="primary" onClick={() => { projectStore.setActiveProject(projects[0]) }}>Test 2</Button>
              <Button type="primary" onClick={() => { projectStore.update(s => s.activeProject.state.name = 'wtf') }}>Test 3</Button> */ }
            </Sider>
          )} />
        )}
        <Layout>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Layout style={{ background: '#fff', padding: 24, margin: '24px 0', flexGrow: 0, flexDirection: 'row' }}>
              <Breadcrumbs />
              {activeProject && <Button type="primary" icon={<CheckOutlined />} onClick={this.start} style={{ marginLeft: 'auto' }}>Start</Button>}
            </Layout>
            {/*<Breadcrumb style={{ margin: '16px 0' }}>

              {activeProject && <Breadcrumb.Item>{activeProject.state.name}</Breadcrumb.Item>}
            </Breadcrumb>
          */}
            <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
              <Route exact path="/projects" render={() => (
                <>
                  <Title>Projects</Title>
                  <Paragraph>
                    Please select an existing project, or create a new one.
                  </Paragraph>
                  <Paragraph>
                    <Button type="primary" icon={<PlusOutlined />} onClick={this.createProject}>New project</Button>
                  </Paragraph>
                  <Menu
                    mode="inline"
                    style={{ borderRight: 0 }}
                  >
                    {projects.map(this.renderProjectMenuItem)}
                  </Menu>
                </>
              )} />
              <Route path="/projects/new" component={NewProject} />
              <Route path="/projects/:id" exact component={EditProject} />
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