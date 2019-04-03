import React from 'react';
import { Layout, Typography } from 'antd';

const { Component } = React;
const { Paragraph } = Typography;

class RdfEntity extends Component {
  renderItem = (item) => {
    const { rdf } = this.props;
    console.log('rdf =', rdf);

    return (
      <Layout key={item.propertyName} style={{ background: '#fff' }}>
        <h3>{item.label || item.propertyName}</h3>
        {(rdf && item.type === 'text') &&
          <Paragraph>
            {rdf ? rdf[item.propertyName] : ''}
          </Paragraph>
        }
        {item.type === 'image' &&
          <Paragraph>
            {rdf ? <img src={rdf[item.propertyName]} alt={item.label || item.propertyName} style={{ maxWidth: '100%', maxHeight: '180px' }} /> : ''}
          </Paragraph>
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