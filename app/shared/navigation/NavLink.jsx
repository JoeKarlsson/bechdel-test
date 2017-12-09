import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./NavLink.scss";

const activeStyles = {
  color: "red"
};

class NavLink extends React.Component {
  render() {
    return <NavLink {...this.props} activeStyle={activeStyles} />;
  }
}

export default NavLink;
