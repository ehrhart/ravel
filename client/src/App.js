import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import './App.css';

import Home from './Home';
import ProjectsPage from './ProjectsPage';
import Compare from './Compare';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route exact path="/" component={Home} breadcrumbName="Home" />
          <Route path="/projects" component={ProjectsPage} breadcrumbName="Projects" />
          <Route path="/compare/:id" component={Compare} breadcrumbName="Compare" />
        </div>
      </Router>
    );
  }
}

export default App;
