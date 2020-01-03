import * as React from "react";
import { render } from "react-dom";
import Form from "./Form";

import "./styles.css";

class App extends React.Component<{}, { hasError: boolean }> {
  constructor(props: object) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    console.log("getDerivedStateFromError", error);
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong. Very Wrong :(</h1>
          <button
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload window
          </button>
        </div>
      );
    }
    return (
      <div className="App">
        <h1>Validation Form</h1>
        <div>
          <p>
            very rudimentary form validation, the rules that drive this
            implementation
          </p>
          <ol>
            <li>Every field can have an arbitrary number of rules</li>
            <li>The error needs to be displayed near a specific field</li>
            <li>The errors are displayed after submit is clicked</li>
            <li>
              after the submit, if the backend return errors we can map them
              using the same structure
            </li>
          </ol>
          <div>Sadly it only works when everything is an error :(</div>
        </div>
        <Form />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
