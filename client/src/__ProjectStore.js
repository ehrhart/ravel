import React, { Component } from 'react';
import { flow, runInAction, decorate, observable, configure, action, computed } from "mobx"

import api from './Api';

configure({ enforceActions: 'observed' });

class ProjectStore {
  selectedRdfType = '';
  selectedRdfProperties = [];
  sourceDataset ={};
  targetDataset = {};
  alignments = {};
  projects = [];

  fetchProjects = async () => {
    const projects = (await api.get('projects')).data;

    runInAction(() => {
      this.projects = projects;
    });
  }

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  setSelectedRdfType(value) {
    this.selectedRdfType = value;
  }

  setSelectedRdfProperties(value) {
    this.selectedRdfProperties = value;
  }

  setSourceDataset(value) {
    this.sourceDataset = value;
  }

  setTargetDataset(value) {
    this.targetDataset = value;
  }

  setAlignments(value) {
    this.alignments = value;
  }

  // fetchSomething() {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(resolve, 1000);
  //   });
  // }

  // setTest = flow(function * (value) {
  //   yield this.fetchSomething();
  //   // This will wait until fetchSomething resolves
  //   this.test = 'test';
  // });

  //get highEarnersCount() { return this.employeesList.filter(e => e.salary > 500).length; }
}

decorate(ProjectStore, {
  selectedRdfType: observable,
  selectedRdfProperties: observable,
  sourceDataset: observable,
  targetDataset: observable,
  alignments: observable,
  projects: observable,

  setSelectedRdfType: action,
  setSelectedRdfProperties: action,
  setSourceDataset: action,
  setTargetDataset: action,
  setAlignments: action,

  //setTest: action,
  //totalSum: computed,
});

export default ProjectStore;
