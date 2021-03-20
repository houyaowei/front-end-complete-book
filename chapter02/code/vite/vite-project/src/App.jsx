import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from "./routers"

import logo from './logo.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Hello Vite + React!</p>
          <p>
            <button onClick={() => setCount((count) => count + 1)}>
              count is: {count}
            </button>
          </p>
          <Switch>
            {
              routes.map(route => <Route exact key={route.path} path={route.path}>
                <route.component />
              </Route>)
            }
          </Switch>
        </header>
      </div>
    </Router>    
  )
}

export default App
