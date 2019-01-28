import React from 'react';
import { Layout, Spin, Icon, Button, Menu } from 'antd';
import { withRouter } from 'react-router-dom';

import { projectStore } from './models/projects';

const { Component } = React;
const { Header, Content } = Layout;

class Home extends Component {
  state = {
    loading: false,
  };

  componentDidMount() {
    console.log(this.props.location.state);
    this.setState({
      loading: true,
    }, async () => {
      await projectStore.loadProjects();
      this.setState({ loading: false });
    });
  }

  openWorkspace = () => {
    this.props.history.push('/projects');
  }

  render() {
    const { loading } = this.state;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#1DA57A', padding: 0 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            style={{ background: '#1DA57A', lineHeight: '64px' }}
          >
            <Menu.Item key="1">
            <Button onClick={this.openWorkspace}>Open workspace</Button>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
           <h2>Welcome</h2>
           <p>This web application guides the user through the process of creating and validating alignments between different data sources.</p>
          <p>The following features are available:</p>
          <ul>
            <li>It enables the user to manage different sets of data sources and alignments.</li>
            <li>It offers a graphical interface which enables the user to easily compare entities.</li>
            <li>It supports multiple data sources formats, such as Turtle, TriG, N-Triples, N-Quads, and Notation3 (N3).</li>
            <li>It allows the user to create ground truth alignments between entities that will be serialized in the <a href="http://alignapi.gforge.inria.fr/edoal.html" target="_blank" rel="noreferrer noopener">EDOAL</a> format.</li>
          </ul>

          <h2>Documentation</h2>
          <p>Documentation on this web application can be found in the <a href="#" target="_blank" rel="noopener">Wiki</a>.</p>

          <h2>Support and Feedback</h2>
          <p>For questions and feedback please use the <a href="#" target="_blank" rel="noopener">GitHub page</a>.</p>

          <h2>Current Projects</h2>
          <div>You currently have {loading ? <Icon type="loading" spin /> : projectStore.state.projects.length} project(s).</div>
          <br />
          <p><Button type="primary" onClick={this.openWorkspace}>Open workspace</Button></p>
        </Content>
      </Layout>
    )
  }
}

export default withRouter(Home);