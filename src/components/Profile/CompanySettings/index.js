import React, { Component } from "react";
import {
  Row,
  Col,
  Input,
  FormGroup,
  FormFeedback,
  Button,
  Label
} from "reactstrap";
import { logger } from "../../../helpers/Logger";
import Validator from "js-object-validation";
import { ProfileValidations, ProfileValidationsMessaages } from "../../../validations/profile.js";
import { allServices, allVehicleServices, allPeopleArray } from "../../../config/Constants"
import classnames from "classnames";
import { isValidURL } from "../../../helpers/Object";

class CompanySettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      companyName: "",
      companyNumber: "",
      vatNumber: "",
      website: "",
      currency: "",
      timeZone: "",
      peopleWork: {
        selected: "",
        allPeopleArray
      },
      servicesOffer: {
        selectedServices: [],
        allServices
      },
      vehicleService: {
        selectedVehicleServices: [],
        allVehicleServices
      },
      validErrors: {}
    };
  }

  componentDidMount = () => {
    if (this.props.profileData.profileInfo) {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        currency,
        companyName,
        companyNumber,
        vatNumber,
        website,
        peopleWork,
      } = this.props.profileData.profileInfo;
      this.setState({
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        companyName,
        companyNumber,
        vatNumber,
        website,
        currency,
        peopleWork: {
          ...this.state.peopleWork,
          selected: peopleWork,
        },
        servicesOffer: {
          ...this.state.servicesOffer,
          selectedServices: this.props.profileData.profileInfo ? this.props.profileData.profileInfo.serviceOffer : [],
        },
        vehicleService: {
          ...this.state.vehicleService,
          selectedVehicleServices: this.props.profileData.profileInfo ? this.props.profileData.profileInfo.vehicleService : [],
        }

      })
    }
  }
  componentDidUpdate = ({ profileData }) => {

    if (profileData.profileInfo !== this.props.profileData.profileInfo) {
      const {
        firstName,
        lastName,
        phoneNumber,
        address,
        currency,
        companyName,
        companyNumber,
        vatNumber,
        website,
        timeZone,
        peopleWork,
      } = this.props.profileData.profileInfo;

      this.setState({
        firstName,
        lastName,
        phoneNumber,
        address,
        currency,
        companyName,
        companyNumber,
        vatNumber,
        website,
        timeZone,
        peoplework: {
          ...this.state.peopleWork,
          selected: peopleWork,
        },
        servicesOffer: {
          ...this.state.servicesOffer,
          selectedServices: this.props.profileData.profileInfo ? this.props.profileData.profileInfo.serviceOffer : [],
        },
        vehicleService: {
          ...this.state.vehicleService,
          selectedVehicleServices: this.props.profileData.profileInfo ? this.props.profileData.profileInfo.vehicleService : [],
        }
      })
    }
  }

  handleInputChange = e => {
    const { target } = e;
    const { name, value } = target;
    this.setState({
      [name]: value,
      errors: {
        ...this.state.errors,
        [name]: null
      }
    });

  };

  serviceOfferAction = event => {
    let servicesOffer = this.state.servicesOffer;
    if (servicesOffer.selectedServices.length) {
      let checkExistence = servicesOffer.selectedServices.some(
        item => item === event.key
      );
      if (!checkExistence) {
        servicesOffer.selectedServices.push(event.key);
      } else {
        let servicesArray = servicesOffer.selectedServices.findIndex(
          item => item === event.key
        );
        servicesOffer.selectedServices.splice(servicesArray, 1);
      }
    } else {
      servicesOffer.selectedServices.push(event.key);
    }

    this.setState({
      servicesOffer: servicesOffer,
      validErrors: {
        ...this.state.validErrors,
        servicesOffer: null
      }
    });
  };

  vehicleServicesAction = event => {
    let vehicleService = this.state.vehicleService;
    if (vehicleService.selectedVehicleServices.length) {
      let checkVehicleExistence = vehicleService.selectedVehicleServices.some(
        item =>
          item === event.key
      );

      if (!checkVehicleExistence) {
        vehicleService.selectedVehicleServices.push(event.key);
      } else {
        let vehicleExistance = vehicleService.selectedVehicleServices.findIndex(
          item => item === event.key
        );
        vehicleService.selectedVehicleServices.splice(
          vehicleExistance,
          1
        );
      }
    } else {
      vehicleService.selectedVehicleServices.push(event.key);
    }

    this.setState({
      vehicleService: vehicleService,
      validErrors: {
        ...this.state.validErrors,
        vehicleService: null
      }
    });
  };

  peopleWorkAction = event => {
    let peopleWork = this.state.peopleWork;
    peopleWork.selected = event;
    this.setState({
      peopleWork: peopleWork,
      errors: {
        ...this.state.errors,
        peopleWork: null
      }
    });
  };


  handleSubmit = e => {
    e.preventDefault();
    try {
      let validErrors = {};
      let hasErrors = false;
      const {
        companyName,
        vatNumber,
        companyNumber,
        website,
        vehicleService: {
          selectedVehicleServices
        },
        servicesOffer: {
          selectedServices
        },
        peopleWork
      } = this.state;
      const { selected } = peopleWork;
      if (!selected) {
        validErrors.peopleWork = "Please select number of employees.";
        hasErrors = true;
      }

      if (!selectedServices.length) {
        validErrors.servicesOffer = "Please select at least one service.";
        hasErrors = true;
      }

      if (!selectedVehicleServices.length) {
        validErrors.vehicleService = "Please select at least one vehicle.";
        hasErrors = true;
      }

      if (website && !isValidURL(website)) {
        this.setState({
          urlError: "Please enter Valid URL( http:// )"
        })
      }
      else {
        this.setState({
          urlError: ""
        })
      }
      const servicesOfferTemp = [];
      for (let index = 0; index < selectedServices.length; index++) {
        const element = selectedServices[index];
        servicesOfferTemp.push(element);
      }
      const vehicleServicesOfferTemp = [];
      for (let index = 0; index < selectedVehicleServices.length; index++) {
        const element = selectedVehicleServices[index];
        vehicleServicesOfferTemp.push(element);
      }

      const payload = {
        companyName,
        companyNumber,
        vatNumber,
        website,
        vehicleService: vehicleServicesOfferTemp,
        servicesOffer: servicesOfferTemp,
        peopleWork: selected,
      };

      const { isValid, errors } = Validator(
        payload,
        ProfileValidations,
        ProfileValidationsMessaages
      );

      if (!isValid || (!isValid && hasErrors) || hasErrors) {
        this.setState({
          validErrors,
          errors
        });
        return;
      }
      else {
        this.props.updateProfileSetting(payload)
      }
    }
    catch (error) {
      logger(error);
    }
  }



  render() {
    const { errors, validErrors, urlError, website, companyName, companyNumber, vatNumber, peopleWork, servicesOffer, vehicleService } = this.state;

    return (
      <div>
        <h3 className={"pb-3"}>Company Profile</h3>
        <Row>
          <Col lg={"12"} md={"12"} className={"custom-form-modal"}>
            <Row>
              <Col lg={7} md={"7"}>
                <Row>
              <Col lg={"6"} md={"6"} >
                <FormGroup>
                  <Label htmlFor={"old password"} className="customer-modal-text-style">
                    Company Name <span className="asteric">*</span>
                  </Label>
                  <div className="input-block">
                    <Input
                      type="text"
                      placeholder="companyName"
                      autoComplete="companyName"
                      onChange={this.handleInputChange}
                      value={companyName}
                      name="companyName"
                      invalid={errors.companyName}
                    />
                    <FormFeedback>
                      {errors.companyName ? errors.companyName : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
              <Col lg={"6"} md={"6"} >
                <FormGroup>
                  <Label htmlFor={"old password"} className="customer-modal-text-style">
                    Company Url
                      </Label>
                  <div className="input-block">
                    <Input
                      type="text"
                      placeholder="Website"
                      autoComplete="Website"
                      onChange={this.handleInputChange}
                      value={website}
                      name="website"
                      invalid={errors.website}
                    />
                    <FormFeedback>
                      {urlError && website ? urlError : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
              <Col lg={"6"} md={"6"} >
                <FormGroup>
                  <Label htmlFor={"old password"} className="customer-modal-text-style">
                    Company Number
                  </Label>
                  <div className="input-block">
                    <Input
                      type="text"
                      placeholder="Company Number"
                      autoComplete="companyName"
                      onChange={this.handleInputChange}
                      value={companyNumber}
                      name="companyNumber"
                      invalid={errors.companyNumber}
                    />
                    <FormFeedback>
                      {errors.companyNumber ? errors.companyNumber : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
              <Col lg={"6"} md={"6"} >
                <FormGroup>
                  <Label htmlFor={"old password"} className="customer-modal-text-style">
                    Company VAT
                      </Label>
                  <div className="input-block">
                    <Input
                      type="text"
                      placeholder="VAT Number"
                      autoComplete="VAT Number"
                      onChange={this.handleInputChange}
                      value={vatNumber}
                      name="vatNumber"
                      invalid={errors.vatNumber}
                    />
                    <FormFeedback>
                      {errors.vatNumber ? errors.vatNumber : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
                </Row>
              </Col>
              <Col lg={5} md={"5"}></Col>
            </Row>

            <Row>
            <Col lg={"12"} md={"12"} >
            <div className="pb-3">
              <h4 className="pb-2 section-head position-relative">
                2. How many people work in your shop? <span className="asteric">*</span>
              </h4>
              <div className="justify-content-center error-block-contain">
                <div className="d-flex box-space">
                  {peopleWork.allPeopleArray ? peopleWork.allPeopleArray.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={
                          peopleWork.selected === item
                            ? "box-contain active"
                            : "box-contain"
                        }
                        onClick={() => this.peopleWorkAction(item)}
                      >
                        <div className="welcome-service-text">{item}</div>
                        <span className="check-icon">
                          <i className="fa fa-check-circle" />
                        </span>
                      </div>
                    );
                  }) : null}
                </div>
                <p className={"text-danger error-msg"}>
                  {validErrors.peopleWork ? validErrors.peopleWork : null}
                </p>
              </div>
            </div>
            </Col>
            </Row>
            <Row>
              <Col lg={"12"} md={"12"} >
            <div className="pb-3">
              <h4 className="pb-2 section-head position-relative">
                3. What kinds of services do you offer? <span className="asteric">*</span>
              </h4>
              <div className="justify-content-center error-block-contain">
                <div className="d-flex box-space">
                  {servicesOffer.allServices.map((item, index) => {
                    let selectedValue = []
                    selectedValue = servicesOffer.selectedServices && servicesOffer.selectedServices.length ? servicesOffer.selectedServices.filter(value => item.key === value) : null
                    return (
                      <div
                        key={index}
                        className={selectedValue && selectedValue.length && selectedValue[0]
                          ? "box-contain active"
                          : "box-contain"
                        }
                        onClick={() => this.serviceOfferAction(item)}
                      >
                        <div
                          className={classnames(
                            "justify-content-center",
                            index === 2 ? "custom-build" : null
                          )}
                        >
                          <img src={item.icon} alt="" />
                          <div className={"welcome-service-text"}>
                            {item.key}
                          </div>
                        </div>
                        <span className="check-icon">
                          <i className="fa fa-check-circle" />
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className={"text-danger error-msg"}>
                  {validErrors.servicesOffer ? validErrors.servicesOffer : null}
                </p>
              </div>
            </div>
            </Col>
            </Row>
            <Row>
              <Col lg={"12"} md={"12"} >            
            <div className="pb-3">
              <h4 className="pb-2 section-head position-relative">
                4. What types of vehicles do you service? <span className="asteric">*</span>
              </h4>
              <div className="justify-content-center error-block-contain">
                <div className="d-flex box-space">
                  {vehicleService.allVehicleServices.map((item, index) => {
                    let selectedValue = [];
                    selectedValue = vehicleService.selectedVehicleServices && vehicleService.selectedVehicleServices.length ? vehicleService.selectedVehicleServices.filter(value => item.key === value) : null
                    return (
                      <div
                        key={index}
                        className={selectedValue && selectedValue.length && selectedValue[0]
                          ? "box-contain active"
                          : "box-contain"
                        }
                        onClick={() => this.vehicleServicesAction(item)}
                      >
                        <div className="justify-content-center">
                          <img src={item.icon} alt="" />
                          <div className="welcome-service-text">
                            {item.key}
                          </div>
                        </div>
                        <span className="check-icon">
                          <i className="fa fa-check-circle" />
                        </span>
                      </div>
                    );
                  }
                  )}
                </div>
                <p className={"text-danger error-msg"}>
                  {validErrors.vehicleService
                    ? validErrors.vehicleService
                    : null}
                </p>
              </div>
            </div>
            </Col>
            </Row>
          </Col>
        </Row>
        <Row className={"m-0"}>
          <Col xs="2" className={""}>
            <FormGroup>
              <Label htmlFor={"old password"} className="customer-modal-text-style">
              </Label>
              <div className="input-block">
                <Button
                  color="primary"
                  className="px-4 btn-theme"
                  type="submit"
                  block
                  onClick={this.handleSubmit}
                >
                  Update
                    </Button>
              </div>
            </FormGroup>

          </Col>
        </Row>
      </div>
    )
  }
}

export default CompanySettings