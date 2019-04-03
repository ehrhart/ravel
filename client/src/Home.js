import React from 'react';
import { Layout, Icon, Button, Menu, Typography, Divider } from 'antd';
import { withRouter } from 'react-router-dom';

import { projectStore } from './models/projects';

const { Component } = React;
const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

class Home extends Component {
  state = {
    loading: false,
  };

  componentDidMount() {
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
          <Title className="logo">RAVEL</Title>
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ background: '#1DA57A', lineHeight: '64px' }}
          >
            <Menu.Item key="1">
              <Button onClick={this.openWorkspace}>Open workspace</Button>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
          <Typography>
            <Title level={2}>Welcome</Title>
            <Paragraph>
              This web application guides the user through the process of creating and validating alignments between different data sources.
            </Paragraph>
            <Paragraph>
              The following features are available:
            </Paragraph>
            <Paragraph>
              <ul>
                <li>It enables the user to manage different sets of data sources and alignments.</li>
                <li>It offers a graphical interface which enables the user to easily compare entities.</li>
                <li>It supports multiple data sources formats, such as Turtle, TriG, N-Triples, N-Quads, and Notation3 (N3).</li>
                <li>It allows the user to create ground truth alignments between entities that will be serialized in the <a href="http://alignapi.gforge.inria.fr/edoal.html" target="_blank" rel="noreferrer noopener">EDOAL</a> format.</li>
              </ul>
            </Paragraph>
            <Title level={2}>Documentation</Title>
            <Paragraph>
              Documentation on this web application can be found in the <a href="https://github.com/ehrhart/ravel/wiki" target="_blank" rel="noopener noreferrer">Wiki</a>.
            </Paragraph>
            <Title level={2}>Support and Feedback</Title>
            <Paragraph>
              For questions and feedback please use the <a href="https://github.com/ehrhart/ravel" target="_blank" rel="noopener noreferrer">GitHub page</a>.
            </Paragraph>
            <Title level={2}>Current Projects</Title>
            <Paragraph>
              You currently have {loading ? <Icon type="loading" spin /> : projectStore.state.projects.length} project(s).
            </Paragraph>

            <Divider />

            <Paragraph>
              <Button type="primary" onClick={this.openWorkspace}>Open workspace</Button>
            </Paragraph>
          </Typography>
        </Content>
      </Layout>
    )
  }
}

export default withRouter(Home);