import React, { Component } from 'react';
import { decorate, observable, configure, action, computed } from "mobx"

import ProjectStore from './models/projects';

class RootStore {
  constructor() {
    //this.projectStore = ProjectStore.create();
  }
}

export default RootStore;