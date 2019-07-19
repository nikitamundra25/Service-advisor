import React, { Component } from "react";
import {
  Row,
  Col,
  Button
} from "reactstrap";

import "../../../scss/subscription.scss"
import moment from "moment";
class SubscriptionSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: "",
      firstName: "",
      lastName: "",
    };
  }

  componentDidMount = () => {
    if (this.props.profileData.profileInfo) {
      const {
        firstName,
        lastName,
      } = this.props.profileData.profileInfo;
      this.setState({
        firstName,
        lastName,
      })
    }
  }
  componentDidUpdate = ({ profileData }) => {

    if (profileData.profileInfo !== this.props.profileData.profileInfo) {
      const {
        firstName,
        lastName,

      } = this.props.profileData.profileInfo;

      this.setState({
        firstName,
        lastName,
      })
    }
  }

  


 
  render() {
    // const { firstName, lastName,  } = this.state;
    const { profileData } = this.props;
    // const planName = profileData
    const expirationDate = profileData.profileInfo.planExiprationDate
    

    return (
      <div>
        <Row className={"mb-5 "}>
          <Col lg={"8"} md={"8"} className={"custom-form-modal"}>
            <h3 className={"pb-3"}>Subscription Details</h3>
            <div className={"p-3 d-flex subscription-plan justify-content-between align-items-center"}>
              <div className={"d-flex align-items-center"}>
                <i className="icons cui-dollar mr-3 plan-icon"></i>
                <div>
                  <h4>Currently <b className={"text-success"}>"{"Plan Name"}"</b> has been activated </h4>
                  <span className={"plan-detail mr-4 text-muted"}>
                    Allowed: <span className={"pl-2 text-dark"}>1 User(s)</span>
                  </span>
                  <span className={"plan-detail text-muted"}>Amount: <span className={"pl-2 text-dark"}><i className="fas fa-dollar"></i>70 paid </span></span>
                  <div className={"pt-3 mb-2"}>
                    <Button color={""} className={"btn-theme-line"}>
                      <i className={"fa fa-paper-plane mr-2"}></i>Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
              <div className={"expire-block pr-3"}>
                <span className={"text-muted"}>Expired On</span>
                <div><i className="fas fa-calendar"></i> {moment(expirationDate || '').format("MMM Do YYYY")}</div>
              </div>
            </div>
          </Col>
        </Row>
        
      </div>
    )
  }
}

export default SubscriptionSettings