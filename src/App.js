import 'core-js/es/array';
import 'core-js/es/map';
import 'core-js/es/set';
import "core-js/stable";
import 'raf/polyfill';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "regenerator-runtime/runtime";
import PrivateRoute from "./components/helpers/PrivateRoute";
import Dashboard from "./components/interfaces/Dashboard";
import ForgotPassword from "./components/interfaces/ForgotPassword";
import Game from "./components/interfaces/Game";
import Login from "./components/interfaces/Login";
import Signup from "./components/interfaces/Signup";
import Statistics from "./components/interfaces/Statistics";
import { AuthProvider } from "./contexts/AuthContext";
import './Game.css';

/**
 * Main Application Component
 */
class App extends Component {

  render() {
    return (
      <Router>
        <AuthProvider>
          <Switch>
            <PrivateRoute exact path="/" component={Game} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/statistics" component={Statistics} />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <Route path="/forgot-password" component={ForgotPassword} />
          </Switch>
        </AuthProvider>
      </Router>
    )
  }

}

export default App
