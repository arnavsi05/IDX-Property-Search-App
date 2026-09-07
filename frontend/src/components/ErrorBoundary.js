import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled error in the property search app:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>
            An unexpected error occurred while rendering this page. Try
            reloading, or head back to the listings.
          </p>
          <button type="button" onClick={this.handleReset}>
            Try again
          </button>
          {" "}
          <Link to="/" onClick={this.handleReset}>
            Back to listings
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
