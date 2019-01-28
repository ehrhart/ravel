import React from 'react';
import { Layout } from 'antd';

const { Component } = React;

class RdfEntity extends Component {
  renderItem = (item) => {
    const { rdf } = this.props;
    console.log('rdf =', rdf);

    return (
      <Layout key={item.propertyName} style={{ background: '#fff' }}>
        <h3>{item.label || item.propertyName}</h3>
        {(rdf && item.type === 'text') &&
          <p>{rdf ? rdf[item.propertyName] : ''}</p>
        }
        {item.type === 'image' &&
          <p>{rdf ? <img src={rdf[item.propertyName]} alt={item.label || item.propertyName} style={{ maxWidth: '100%', maxHeight: '180px' }} /> : ''}</p>
        }
      </Layout>
    );
  }

  render() {
    const { config } = this.props;
    /*const config = [
      {"propertyName":"dc:identifier","type":"text","label":"Identifiant"},
      {"propertyName":"lode:poster","type":"image","label":"Poster"},
    ];*/
    console.log('config = ', JSON.stringify(config));

    return (
      <Layout>
        {config.map(this.renderItem)}
      </Layout>
    )
  }
}

export default RdfEntity;