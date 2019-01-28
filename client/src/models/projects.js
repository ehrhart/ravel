import React, { Component } from 'react';
import { types, flow, getRoot, destroy } from "mobx-state-tree"
import N3 from 'n3';
import axios from 'axios';

import Api from '../Api';

import createStore from 'pure-store'

function getLiteralValue(literal) {
  const match = /^"([^]*)"/.exec(literal);
  if (!match)
    throw new Error(literal + ' is not a literal');
  return match[1];
}

export const projectStore = createStore({
  projects: [],
  activeProject: null,
  isLoaded: false,
});

let promise = null;
let isLoadingProjects = false;

export class Project {
  id = '';
  name = '';
  selectedSourceRdfType = '';
  selectedTargetRdfType = '';
  selectedRdfProperties = [];
  sourceDataset = {
    format: 'auto',
  };
  targetDataset = {
    format: 'auto',
  };
  alignments = {
    format: 'auto',
  };

  constructor(data) {
    Object.assign(this, data);
  }

  readDataset = async (dataset) => {
    console.log('readDataset, dataset:', dataset);
    let url = null;
    if (dataset) {
      if (dataset.upload && dataset.upload.length > 0 && dataset.upload[0].response.path) {
        url = `${Api.defaults.baseURL}../${dataset.upload[0].response.path}`;
      } else if (dataset.url) {
        url = dataset.url;
      }
    }
    if (!url) {
      return null;
    }
    console.log('readDataset, url:', url);
    return (await axios.get(url)).data;
  }

  loadStore = (ttlData) => {
    return new Promise((resolve, reject) => {
      const parser = new N3.Parser();
      const quads = [];
      const prefixes = [];
      parser.parse(ttlData, (e, q, p) => {
        if (e) {
          reject(e);
        }
        if (q) {
          quads.push(q);
        }
        if (p) {
          prefixes.push(p);
        }
        resolve({quads: quads, prefixes: prefixes});
      });
    });
  }

  loadDataset = async (dataset) => {
    const loadedDataset = {};
    Object.assign(loadedDataset, dataset);

    var uri = window.location.origin;
    var body = await this.readDataset(dataset);
    if (!body) return loadedDataset;

    const { quads, prefixes }  = await this.loadStore(body);
    loadedDataset.store = N3.Store(quads, {
      prefixes: prefixes[0],
    });

    try {
      let rdfTypes = loadedDataset.store.getObjects(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'); // get statements about rdf:type
      rdfTypes = rdfTypes.map(o => o.id); // get objects only
      rdfTypes = [...new Set(rdfTypes)]; // remove duplicates
      // [ 'http://type1/', 'http://type2/', 'http://type3/']
      loadedDataset.rdfTypes = rdfTypes;
    } catch (err) {
      console.log(err)
    }

    return loadedDataset;
  }

  loadAlignments = async () => {
    const loadedAlignments = {};
    Object.assign(loadedAlignments, this.alignments);

    var uri = window.location.origin;
    var body = await this.readDataset(this.alignments);
    if (!body) return loadedAlignments;

    const { quads, prefixes }  = await this.loadStore(body);
    loadedAlignments.store = N3.Store(quads, {
      prefixes: prefixes[0],
    });
    loadedAlignments.links = [];

    try {
      const subjects = loadedAlignments.store.getSubjects('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://knowledgeweb.semanticweb.org/heterogeneity/alignment#Cell');
      subjects.forEach(subj => {
        let entity1 = loadedAlignments.store.getObjects(subj.id, 'http://knowledgeweb.semanticweb.org/heterogeneity/alignment#entity1').pop().id;
        let entity2 = loadedAlignments.store.getObjects(subj.id, 'http://knowledgeweb.semanticweb.org/heterogeneity/alignment#entity2').pop().id;
        let measure = loadedAlignments.store.getObjects(subj.id, 'http://knowledgeweb.semanticweb.org/heterogeneity/alignment#measure').pop().id;
        measure = parseFloat(getLiteralValue(measure));
        let relation = loadedAlignments.store.getObjects(subj.id, 'http://knowledgeweb.semanticweb.org/heterogeneity/alignment#relation').pop().id;
        relation = getLiteralValue(relation);

        loadedAlignments.links.push({
          entity1,
          entity2,
          measure,
          relation,
        });
      });

      console.log('loadedAlignments.links =', loadedAlignments.links);
    } catch (err) {
      console.log(err)
    }

    return loadedAlignments;
  }

  toJS() {
    return {
      id: this.id,
      name: this.name,
      selectedSourceRdfType: this.selectedSourceRdfType,
      selectedTargetRdfType: this.selectedTargetRdfType,
      selectedRdfProperties: this.selectedRdfProperties,
      sourceDataset: this.sourceDataset,
      targetDataset: this.targetDataset,
      alignments: this.alignments,
    };
  }
}

projectStore.loadProjects = async () => {
  if (isLoadingProjects) {
    return promise;
  }

  isLoadingProjects = true;

  promise = new Promise(async (resolve, reject) => {
    const projectsData = (await Api.get('projects')).data;
    projectStore.update(s => {
      s.projects = [...projectsData.map(p => new Project(p))];
    });
    isLoadingProjects = false;
    resolve();
  });

  return promise;
};

projectStore.findById = (id) => {
  const index = projectStore.state.projects.findIndex(x => x.id === id);
  return projectStore.state.projects[index];
};

projectStore.setActiveProject = async (project) => {
  if (!project) {
    projectStore.update(s => s.activeProject = null);
    return;
  }

  await projectStore.loadProjects();
  const index = projectStore.state.projects.findIndex(x => x.id === project.id);
  if (index > -1) {
    const activeProjectStore = projectStore.storeFor(s => s.projects[index]);
    projectStore.update(s => s.activeProject = activeProjectStore);
  }
}

projectStore.addProject = async (initialProjectData) => {
  const newProjectData = (await Api.post('projects', initialProjectData)).data;
  const newProject = new Project(newProjectData);
  projectStore.update(s => s.projects.push(newProject));
  return newProject;
};

projectStore.removeProject = async (project) => {
  const response = await Api.delete(`projects/${project.id}`);
  if (response.status === 200) {
    if (projectStore.state.activeProject && projectStore.state.activeProject.state.id === project.id) {
      console.log('DELETE ACTIVE');
      projectStore.update(s => s.activeProject = null);
    }
    projectStore.update(s => s.projects = s.projects.filter(o => o.id !== project.id));
  }
};

projectStore.updateProject = async (project) => {
  console.log('updateProject', project.state);
  const updatedProjectData = (await Api.put(`projects/${project.state.id}`, project.state.toJS())).data;
  const index = projectStore.state.projects.findIndex(x => x.id === project.state.id);
  if (index > -1) {
    // Found, update it
    projectStore.update(s => s.projects[index] = new Project(updatedProjectData));
  } else {
    // Not found, add it
    projectStore.update(s => s.projects.push(new Project(updatedProjectData)));
  }
};
