import React from 'react';
import { Layout, Menu, Progress, Pagination, Button, Row, Col } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import * as N3 from 'n3';

import RdfEntity from './RdfEntity';
import { projectStore } from './models/projects';
import Api from './Api';

const { Component } = React;
const { Content } = Layout;
const { Header } = Layout;
const { namedNode, literal } = N3.DataFactory;
const { SubMenu } = Menu;

class Compare extends Component {
  state = {
    index: 0,
    entity1: null,
    entity2: null,
    currentScore: null,
    loadedSourceDataset: {},
    loadedTargetDataset: {},
    loadedAlignments: {},
    entitiesPermutations: [],
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

      const { activeProject } = projectStore.state;
      const loadedSourceDataset = await activeProject.state.loadDataset(activeProject.state.sourceDataset);
      const loadedTargetDataset = await activeProject.state.loadDataset(activeProject.state.targetDataset);
      const loadedAlignments = await activeProject.state.loadAlignments();
      loadedSourceDataset.entities = await this.loadEntities(loadedSourceDataset.store);
      loadedTargetDataset.entities = await this.loadEntities(loadedTargetDataset.store);

      this.setState({
        loadedSourceDataset,
        loadedTargetDataset,
        loadedAlignments,
        rdfTypes: loadedSourceDataset.rdfTypes || [],
      }, () => {
        this.generatePermutations(() => {
          this.showNextEntities();
        });
      });
    }
  }

  loadEntities = (store) => {
    if (!store) {
      console.log(new Error('loadEntities: no store'));
      return [];
    }

    const { selectedSourceRdfType } = projectStore.state.activeProject.state;
    return store.getSubjects('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', selectedSourceRdfType).map(o => o.id);
  }

  exportEDOAL = (e) => {
    const { entitiesPermutations } = this.state;

    const writer = new N3.Writer({ prefixes: {
      align: 'http://knowledgeweb.semanticweb.org/heterogeneity/alignment#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    }, format: 'Turtle' });
    entitiesPermutations.forEach((link, index) => {
      if (link.score > 0) {
        writer.addQuad(
          namedNode(`${window.location.origin}/alignments#${index + 1}`),
          namedNode('rdf:type'),
          namedNode('align:Alignment')
        );
        writer.addQuad(
          namedNode(`${window.location.origin}/alignments#${index + 1}`),
          namedNode('align:map'),
          writer.blank([{
            predicate: namedNode('rdf:type'),
            object: namedNode('align:Cell'),
          },{
            predicate: namedNode('align:entity1'),
            object: namedNode(link.entity1),
          },{
            predicate: namedNode('align:entity2'),
            object: namedNode(link.entity2),
          },{
            predicate: namedNode('align:measure'),
            object: literal(link.score.toFixed(1), namedNode('xsd:float')),
          },{
            predicate: namedNode('align:relation'),
            object: literal('='),
          }])
        );
      }
    });
    writer.end((error, result) => {
      this.download(result, 'alignments.ttl');
    });
  }

  exportOWL = (e) => {
    const { entitiesPermutations } = this.state;

    const writer = new N3.Writer({ format: 'N-Triples' });
    entitiesPermutations.forEach((link, index) => {
      if (link.score > 0) {
        writer.addQuad(
          namedNode(link.entity1),
          namedNode('http://www.w3.org/2002/07/owl#sameAs'),
          namedNode(link.entity2)
        );
      }
    });
    writer.end((error, result) => {
      this.download(result, 'alignments.nt');
    });
  }

  download = (content, fileName) => {
    const pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    pom.setAttribute('download', fileName);
    if (document.createEvent) {
      const event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }

  selectScore = (score) => {
    const { entitiesPermutations, index } = this.state;

    // Update score
    entitiesPermutations[index - 1].score = score;

    // Update entities permutations
    this.setState({
      entitiesPermutations,
    }, () => {
      this.showNextEntities();
    });
  }

  generatePermutations = (cb) => {
    console.log('generatePermutations, loadedSourceDataset = ', this.state.loadedSourceDataset);
    console.log('generatePermutations, loadedTargetDataset = ', this.state.loadedTargetDataset);

    const entitiesPermutations = [];

    if (this.state.loadedAlignments && this.state.loadedAlignments.links) {
      this.state.loadedAlignments.links.forEach(link => {
        const { entity1, entity2, measure } = link;
        entitiesPermutations.push({
          entity1,
          entity2,
          score: measure,
        });
      });
    } else {
      this.state.loadedSourceDataset.entities.forEach(entity1 => {
        this.state.loadedTargetDataset.entities.forEach(entity2 => {
          entitiesPermutations.push({
            entity1,
            entity2,
          });
        });
      });
    }

    // Refresh state with new entities permutations
    this.setState({
      entitiesPermutations,
    }, cb);

    console.log('generatePermutations, entitiesPermutations = ', entitiesPermutations);
  }

  showNextEntities = () => {
    let { index, entitiesPermutations } = this.state;
    const permutation = entitiesPermutations[index];
    let entity1 = null;
    let entity2 = null;
    let score = null;
    if (permutation) {
      ({ entity1, entity2, score } = permutation);
      index++;
    }
    this.setState({
      entity1,
      entity2,
      currentScore: score,
      index,
    });
  }

  getEntityData = (entityURI, store) => {
    if (!entityURI) {
      console.log('getEntityData: entity URI is null');
      return null;
    }

    const entityData = {
      uri: entityURI,
    };

    const { activeProject } = projectStore.state;
    const { selectedRdfProperties } = activeProject.state;
    selectedRdfProperties.forEach(property => {
      const { propertyName } = property;

      console.log('sym', entityURI, propertyName);
      const results = store.getObjects(entityURI, propertyName);
      console.log('getEntityData results = ', results);

      const objectValue = results.map(o => o.id).pop();
      entityData[propertyName] = objectValue;
    });

    return entityData;
  }

  onPaginationChange = (page, pageSize) => {
    this.setState({
      index: page - 1,
    }, () => {
      this.showNextEntities();
    });
  }

  render() {
    console.log('Compare.render');

    if (!projectStore.state.activeProject) {
      return null;
    }

    const { activeProject } = projectStore.state;
    const { selectedRdfProperties } = activeProject.state;
    const {
      entitiesPermutations,
      entity1,
      entity2,
      index,
      currentScore,
      loadedSourceDataset,
      loadedTargetDataset,
      loadedAlignments,
    } = this.state;

    console.log('RENDER!', this.state);

    const sourceEntityData = this.getEntityData(entity1, loadedSourceDataset.store);
    const targetEntityData = this.getEntityData(entity2, loadedTargetDataset.store);
    console.log('sourceEntityData =', sourceEntityData);
    console.log('targetEntityData =', targetEntityData);

    const percent = (index / entitiesPermutations.length) * 100;

    return (
      <Layout style={{ position: 'relative', minHeight: '100vh' }}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
          <Row>
            <Col span={3}>
              <Button onClick={() => { this.props.history.goBack() }}>Back</Button>
            </Col>
            <Col span={17}>
              <Row type="flex" justify="center" gutter={8}>
                {(loadedAlignments && loadedAlignments.links) && (
                  <Col>Is this correct?</Col>
                )}
                <Col><Button type="primary" onClick={() => { this.selectScore(1) }} ghost={currentScore !== 1.0}>Same</Button></Col>
                <Col><Button type="primary" onClick={() => { this.selectScore(0) }} ghost={currentScore !== 0.0}>Undecided</Button></Col>
                <Col><Button type="primary" onClick={() => { this.selectScore(-1) }} ghost={currentScore !== -1.0}>Different</Button></Col>
              </Row>
            </Col>
            <Col span={4}>
              <Menu
                //onClick={this.handleClick}
                //selectedKeys={[this.state.current]}
                theme="light"
                mode="horizontal"
                style={{ borderBottom: 0 }}
              >
                <SubMenu title={<span className="submenu-title-wrapper">
                  <CloudDownloadOutlined />Export alignments</span>}>
                  <Menu.Item key="export:edoal" onClick={this.exportEDOAL}>EDOAL format (Turtle)</Menu.Item>
                  <Menu.Item key="export:owl" onClick={this.exportOWL}>OWL format (N-Triples)</Menu.Item>
                </SubMenu>
              </Menu>
              {/*<span style={{ color: '#fff' }}>Changes have been saved!</span>*/}
            </Col>
          </Row>
        </Header>
        <Layout style={{ marginTop: 64, flex: 0 }}>
          <Content style={{ background: '#fff', margin: 0, padding: 8 }}>
            <Row type="flex" justify="center">
              <Col>
                <Pagination simple defaultCurrent={1} defaultPageSize={1} current={this.state.index} total={entitiesPermutations.length} onChange={this.onPaginationChange} />
              </Col>
            </Row>
          </Content>
        </Layout>
        <div>
          <Progress percent={percent} showInfo={false} style={{ width: '100%', padding: 8 }} />
        </div>
        <Layout>
          <Row type="flex" gutter={8} style={{ flex: 'auto', margin: 0 }}>
            <Col span={12}>
              <Layout style={{ minHeight: '100%' }}>
                <Content style={{ background: '#fff', padding: 24, margin: 0 }}>
                  {entity1 && (
                    <Layout style={{ background: '#fff' }}>
                      <h3><a href={entity1} target="_blank" rel="noreferrer noopener">{entity1}</a></h3>
                      <RdfEntity rdf={sourceEntityData} config={selectedRdfProperties} />
                    </Layout>
                  )}
                </Content>
              </Layout>
            </Col>
            <Col span={12}>
              <Layout style={{ minHeight: '100%' }}>
                <Content style={{ background: '#fff', padding: 24, margin: 0 }}>
                  {entity2 && (
                    <Layout style={{ background: '#fff' }}>
                      <h3><a href={entity2} target="_blank" rel="noreferrer noopener">{entity2}</a></h3>
                      <RdfEntity rdf={targetEntityData} config={selectedRdfProperties} />
                    </Layout>
                  )}
                </Content>
              </Layout>
            </Col>
          </Row>
        </Layout>
      </Layout>
    )
  }
}

export default withRouter(Compare);